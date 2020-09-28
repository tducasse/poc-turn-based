import WebSocket from "ws";
import { EVENT_TYPES } from "./constants";

const store = {
  rooms: [{ name: "lobby", users: [] }],
  users: {},
};

export const registerUser = (uuid, socket) => {
  store.users[uuid] = { socket, room: "lobby" };
  store.rooms.find((r) => r.name === "lobby").users.push(uuid);
};

export const findEveryoneInRoom = (name) => {
  const room = store.rooms.find((r) => r.name === name);
  if (!room) {
    console.error(`Can't find room ${name}`);
    return [];
  }
  return room.users.map((uuid) => store.users[uuid].socket);
};

export const sendToEveryone = ({ type, payload, room = "lobby" }) => {
  findEveryoneInRoom(room).forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify({ type, payload, room }));
    }
  });
};

export const startGame = (room) =>
  sendToEveryone({
    type: EVENT_TYPES.BEGIN,
    room,
  });

export const setReady = (uuid, name) => {
  const room = store.rooms.find((el) => el.name === name);
  if (!room) {
    console.error(`Can't find room ${name}`);
    return false;
  }
  const user = room.users.find((el) => el === uuid);
  if (!user) {
    console.error(`Can't find user ${uuid} in room ${name}`);
    return false;
  }
  room.ready[uuid] = true;
  if (Object.keys(room.ready).length === 2) {
    return startGame(name);
  }
  return true;
};

export const readyGame = (room) => {
  sendToEveryone({ type: EVENT_TYPES.READY_GAME, room });
};

// find a room by user id
export const findRoom = (uuid) => {
  return store.users[uuid] && store.users[uuid].room;
};

export const leaveRoom = (uuid, room) => {
  // find which room the user is in
  const actualRoom = room || findRoom(uuid);
  if (!actualRoom) {
    return false;
  }
  // if last user in the room, remove the room
  const currentRoom = store.rooms.find((r) => r.name === actualRoom);
  if (!currentRoom) {
    console.error(`Can't find room ${actualRoom}`);
    return false;
  }
  if (actualRoom !== "lobby") {
    if (currentRoom.users.length === 1) {
      store.rooms = store.rooms.filter((el) => el.name !== actualRoom);
    }
    // since the only way to leave a room that's not "lobby" is to leave the game, we can do that
    // TODO: FIX LATER
    delete store.users[uuid];
    if (currentRoom.ready && currentRoom.ready[uuid]) {
      delete currentRoom.ready[uuid];
    }
  }
  // if it's the lobby, we just remove the user from the list
  currentRoom.users = currentRoom.users.filter((el) => el !== uuid);
  return true;
};

export const joinRoom = (uuid, name) => {
  const room = store.rooms.find((el) => el.name === name);
  if (!room) {
    console.error(`Room doesn't exist: ${name}`);
    return false;
  }

  const previousRoom = store.users[uuid].room;
  if (previousRoom !== name) {
    leaveRoom(uuid, previousRoom);
  }
  if (room.users.find((el) => el === uuid)) {
    return false;
  }
  room.users.push(uuid);
  store.users[uuid].room = name;
  console.log(`${uuid} joined ${name}`);
  if (room.users.length === 2) {
    readyGame(name);
  }
  return true;
};

export const sendNewMessage = (uuid, payload, room) => {
  sendToEveryone({
    type: EVENT_TYPES.NEW_CHAT_MESSAGE,
    payload,
    room: room || findRoom(uuid),
  });
};

export const createRoom = (uuid, name) => {
  if (store.rooms.find((el) => el.name === name)) {
    console.log(`room ${name} already exists`);
    return false;
  }
  store.rooms.push({ name, users: [], ready: {} });
  console.log(`${uuid} created room: ${name}`);
  sendToEveryone({ type: EVENT_TYPES.CREATE_ROOM, payload: name });
  return true;
};

export default store;
