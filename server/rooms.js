import { db } from "@tducasse/js-db";
import { getRoomByUser, sendMessage, sendToEveryone } from "./util";
import { EVENT_TYPES, STARTING } from "./constants";

const defaultRoomState = {
  name: "NEW_ROOM",
  users: [],
  ready: [],
  state: {},
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

// removes a room and tells everyone it is removed
const removeRoom = (name) => {
  db.rooms.remove({ name });
  sendToEveryone({
    type: EVENT_TYPES.REMOVE_ROOM,
    room: "lobby",
    payload: name,
  });
};

export const tellOthersLeft = (name) => {
  db.rooms.findOne({ name }).users.forEach((uuid) =>
    sendMessage(db.users.findOne({ uuid }).socket, {
      type: EVENT_TYPES.OPPONENT_LEFT,
      payload: true,
    })
  );
};

export const resyncRooms = () => {
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
    tellOthersLeft(room.name);
    // we're here because we're moving back to the lobby, but not the last user in the room
    moveBackToLobby(uuid);
  }
  resyncRooms();
  return true;
};

const initRoom = (name) => {
  const room = db.rooms.findOne({ name });
  const startingVals = {
    resources: STARTING.RESOURCES,
    income: STARTING.INCOME,
    attack: STARTING.ATTACK,
    defense: STARTING.DEFENSE,
    health: STARTING.HEALTH,
  };
  db.rooms.update(
    { name },
    {
      $set: {
        state: {
          ...room.users.reduce(
            (acc, curr) => ({
              ...acc,
              // has to be spread, because otherwise it's the same object reference
              // and we don't want the two users to share the same resources, income, etc
              // inherent to the way we handle the database
              [curr]: { ...startingVals },
            }),
            {}
          ),
        },
        ready: [],
      },
    }
  );
  room.users.forEach((uuid) => {
    const { socket } = db.users.findOne({ uuid });
    sendMessage(socket, {
      type: EVENT_TYPES.GAME__INIT_GAME,
      payload: startingVals,
    });
  });
};

// tell the clients that the game should start
const startGame = (room) => {
  initRoom(room);
  sendToEveryone({
    type: EVENT_TYPES.GAME__START_GAME,
    room,
  });
};

// sets the ready flag for a user
export const setReady = (uuid) => {
  const name = getRoomByUser(uuid);
  if (!name) {
    console.error(`setReady(): can't find room for ${uuid}`);
  }
  const room = db.rooms.findOne({ name });
  db.rooms.update(
    { name },
    { $set: { ready: Array.from(new Set([uuid].concat(room.ready))) } }
  );
  const updatedRoom = db.rooms.findOne({ name });
  if ((updatedRoom.ready || []).length === 2) {
    startGame(name);
  }
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
  const { socket } = db.users.findOne({ uuid });
  sendMessage(socket, { type: EVENT_TYPES.JOIN_ROOM, payload: name });
  resyncRooms();
  console.log(`${uuid} joined ${name}`);
  return true;
};
