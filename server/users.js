import { EVENT_TYPES } from "./constants";
import db from "./db";
import { sendMessage } from "./util";

const defaultUserState = {
  uuid: "NEW_UUID",
  socket: {},
  room: "lobby",
  isAdmin: false,
};

// Creates a new user and assigns them to the lobby room
export const registerUser = (uuid, socket) => {
  db.users.insert({ ...defaultUserState, uuid, socket });
  db.rooms.update({ name: "lobby" }, { $push: { users: uuid } });
};

export const updateAdminData = () => {
  const admins = db.users.find({ isAdmin: true });
  if (!admins.length) {
    return false;
  }
  admins.forEach((admin) => {
    sendMessage(admin.socket, {
      type: EVENT_TYPES.UPDATE_ADMIN_DATA,
      payload: {
        rooms: db.rooms.find(),
        users: db.users
          .find()
          .map(({ uuid, isAdmin, room }) => ({ uuid, isAdmin, room })),
      },
    });
  });
  return true;
};

// Makes the current user an admin
export const registerAdmin = (uuid) => {
  db.users.update({ uuid }, { $set: { isAdmin: true } });
  updateAdminData();
};
