import { db } from "@tducasse/js-db";
import WebSocket from "ws";
import { EVENT_TYPES, separator } from "./constants";

// send {type, payload, room} to `client`
export const sendMessage = (client, { type, payload = true }) =>
  client.send(JSON.stringify({ type, payload }));

export const parseMessage = (message) => {
  let data;
  try {
    data = JSON.parse(message);
    return data;
  } catch (err) {
    console.error(`parseMessage(): could not parse ${message}`);
    return {};
  }
};

export const sendQuery = (uuid, query) => {
  const user = db.users.findOne({ uuid });
  if (!user) {
    console.error(`Can't find user ${uuid}`);
    return false;
  }
  if (!user.isAdmin) {
    console.error(`User is not admin`);
    return false;
  }

  const { collection, operator, match, update } = query;
  db[collection][operator](match, update);
  return true;
};

export const hasPrefix = (type) => {
  return type.indexOf(separator) >= 0;
};

export const unPrefix = (type) => {
  return type.split(separator);
};

// get the socket for everyone in a room
export const findEveryoneInRoom = (room) =>
  db.users.find({ room }).map((el) => el.socket);

// send a message to everyone in a room
export const sendToEveryone = ({ type, payload, room = "lobby" }) => {
  findEveryoneInRoom(room).forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      sendMessage(client, { type, payload });
    }
  });
};

// get room name by user uuid
export const getRoomByUser = (uuid) => {
  return (db.users.findOne({ uuid }) || {}).room;
};

export const clamp = (num, min, max) => {
  if (num <= min) {
    return min;
  }
  if (num >= max) {
    return max;
  }
  return num;
};

// send a chat message to everyone in the room
export const sendChatToRoom = (uuid, message) => {
  const { nickname } = db.users.findOne({ uuid });
  sendToEveryone({
    type: EVENT_TYPES.NEW_CHAT_MESSAGE,
    payload: { message, nickname },
    room: getRoomByUser(uuid),
  });
};

export const sendServerMessageToRoom = (room, message) => {
  sendToEveryone({
    type: EVENT_TYPES.NEW_CHAT_MESSAGE,
    payload: { message, nickname: "SERVER" },
    room,
  });
};
