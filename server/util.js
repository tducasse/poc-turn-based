import { db } from "@tducasse/js-db";
import WebSocket from "ws";
import { EVENT_TYPES, SEPARATOR, SHOP_ITEMS } from "./constants";

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
  return type.indexOf(SEPARATOR) >= 0;
};

export const unPrefix = (type) => {
  return type.split(SEPARATOR);
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

export const sendKeepAlive = (client) => {
  sendMessage(client, { type: EVENT_TYPES.KEEP_ALIVE, payload: true });
};

// this is so unsafe
export const deepCopy = (toCopy) => JSON.parse(JSON.stringify(toCopy));

export const getStartShopItems = () =>
  Object.values(SHOP_ITEMS).reduce(
    (items, val) => ({
      ...items,
      ...Object.keys(val).reduce((acc, key) => ({ ...acc, [key]: 0 }), {}),
    }),
    {}
  );

export const getAllShopItems = (uuid) => {
  const name = db.users.findOne({ uuid }).room;
  const userState = db.rooms.findOne({ name }).state[uuid];
  const { shopItems } = userState;
  return Object.entries(SHOP_ITEMS).reduce((acc, [category, items]) => {
    return [
      ...acc,
      {
        category,
        items: Object.entries(items).reduce((acc2, [key, val]) => {
          return [
            ...acc2,
            {
              name: key,
              ...val[shopItems[key]],
            },
          ];
        }, []),
      },
    ];
  }, []);
};

export const getCurrentItem = (name, level) => {
  const item = {};
  Object.entries(SHOP_ITEMS).forEach(([type, items]) => {
    const curr = items[name];
    if (!curr) {
      return;
    }
    item.current = curr[level];
    item.next = curr[level + 1];
    item.type = type;
  });
  return item;
};
