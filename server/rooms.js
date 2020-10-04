import WebSocket from "ws";
import { db } from "@tducasse/js-db";
import { sendMessage } from "./util";
import { EVENT_TYPES } from "./constants";

const defaultRoomState = {
  name: "NEW_ROOM",
  users: [],
  ready: [],
};

// get a list of all the existing rooms' names
const listRooms = () =>
  db.rooms
    .find()
    .filter((el) => el.name !== "lobby")
    .map((el) => `${el.name}${el.users.length ? ` - ${el.users.length}` : ""}`);

// send `client` all the existing rooms
export const sendExistingRooms = (client) => {
  sendMessage(client, {
    type: EVENT_TYPES.LIST_ROOMS,
    payload: listRooms(),
  });
};

const moveBackToLobby = (uuid) => {
  db.users.update({ uuid }, { $set: { room: "lobby" } });
  db.rooms.update({ name: "lobby" }, { $push: { users: uuid } });
  const user = db.users.findOne({ uuid });
  sendMessage(user.socket, {
    type: EVENT_TYPES.BACK_TO_LOBBY,
  });
  sendExistingRooms(user.socket);
};

// get the socket for everyone in a room
const findEveryoneInRoom = (room) =>
  db.users.find({ room }).map((el) => el.socket);

// send a message to everyone in a room
const sendToEveryone = ({ type, payload, room = "lobby" }) => {
  findEveryoneInRoom(room).forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      sendMessage(client, { type, payload });
    }
  });
};

// removes a room and tells everyone it is removed
const removeRoom = (name) => {
  db.rooms.remove({ name });
  sendToEveryone({
    type: EVENT_TYPES.REMOVE_ROOM,
    room: "lobby",
    payload: name,
  });
};

const resyncRooms = () => {
  sendToEveryone({
    type: EVENT_TYPES.LIST_ROOMS,
    payload: listRooms(),
  });
};

// Make the user `uuid` leave the room
export const leaveRoom = (uuid, remove = false) => {
  const room = db.rooms.findOne({ users: uuid });
  if (!room) {
    console.error(`leaveRoom(): can't find room for ${uuid}`);
    return false;
  }
  if (room.users.length === 1 && room.name !== "lobby") {
    // let's just remove the room then
    removeRoom(room.name);
    // if we're here because the user left the game
    if (remove) {
      db.users.remove({ uuid });
    } else {
      // otherwise we're here because the user was the last one to leave a room
      moveBackToLobby(uuid);
    }
    return true;
  }
  // otherwise, remove the user
  // and remove their ready flag
  db.rooms.update(
    { users: uuid },
    {
      $set: {
        users: room.users.filter((el) => el !== uuid),
        ready: room.ready.filter((el) => el !== uuid),
      },
    }
  );
  // if we're here because the user left the game
  if (remove) {
    db.users.remove({ uuid });
  } else if (room.name !== "lobby") {
    // we're here because we're moving back to the lobby, but not the last user in the room
    moveBackToLobby(uuid);
  }
  resyncRooms();
  return true;
};

// get room name by user uuid
const getRoomByUser = (uuid) => (db.users.findOne({ uuid }) || {}).room;

// send a chat message to everyone in the room
export const sendChatToRoom = (uuid, payload) => {
  sendToEveryone({
    type: EVENT_TYPES.NEW_CHAT_MESSAGE,
    payload,
    room: getRoomByUser(uuid),
  });
};

// tell the clients that the game should start
const startGame = (room) =>
  sendToEveryone({
    type: EVENT_TYPES.BEGIN,
    room,
  });

// sets the ready flag for a user
export const setReady = (uuid) => {
  const name = getRoomByUser(uuid);
  if (!name) {
    console.error(`setReady(): can't find room for ${uuid}`);
  }
  const room = db.rooms.findOne({ name });
  db.rooms.update(
    { name },
    { $set: { ready: Array.from(new Set([].concat(room.ready))) } }
  );
  const updatedRoom = db.rooms.findOne({ name });
  if ((updatedRoom.ready || []).length === 2) {
    startGame(name);
  }
};

// ask the clients to tell the server if they're ready
export const readyGame = (room) => {
  sendToEveryone({ type: EVENT_TYPES.READY_GAME, room });
};

// create a new room `name`
export const createRoom = (name) => {
  const existingRoom = db.rooms.findOne({ name });
  if (existingRoom) {
    console.error(`createRoom(): room already exists ${name}`);
    return false;
  }
  db.rooms.insert({ ...defaultRoomState, name });
  sendToEveryone({ type: EVENT_TYPES.CREATE_ROOM, payload: name });
  return true;
};

// Makes the user `uuid` join room `name`
export const joinRoom = (uuid, name) => {
  const room = db.rooms.findOne({ name });
  if (!room) {
    console.error(`joinRoom(): room doesn't exist: ${name}`);
    return false;
  }
  const previousRoom = getRoomByUser(uuid);
  if (previousRoom !== name) {
    // only leave the previous room if it's not also the current room
    // why would this happen? not sure!
    leaveRoom(uuid);
  }
  if (room.users.find((el) => el === uuid)) {
    // the user is already in the room
    return false;
  }
  db.users.update({ uuid }, { $set: { room: name } });
  db.rooms.update({ name }, { $push: { users: uuid } });
  const updatedRoom = db.rooms.findOne({ name });
  resyncRooms();
  console.log(`${uuid} joined ${name}`);
  if (updatedRoom.users.length === 2) {
    readyGame(name);
  }
  return true;
};
