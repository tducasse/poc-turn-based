import WebSocket from "ws";
import { v4 as uuidv4 } from "uuid";
import express from "express";
import { registerAdmin, registerUser, updateAdminData } from "./users";
import {
  createRoom,
  joinRoom,
  leaveRoom,
  sendChatToRoom,
  sendExistingRooms,
  setReady,
} from "./rooms";
import { parseMessage, sendQuery } from "./util";
import { EVENT_TYPES } from "./constants";

const PORT = process.env.PORT || 3000;

// the static part
const app = express();
const router = express.Router();
app.use("/", router);
app.use(express.static("static"));
const server = app.listen(PORT, () => console.log(`Listening on port ${PORT}`));

const ws = new WebSocket.Server({ server });

ws.on("connection", (socket) => {
  // create a unique id, and register the user
  const uuid = uuidv4();
  registerUser(uuid, socket);
  console.log(`New connection`);
  console.log(`Connected clients = ${ws.clients.size}`);

  // let's tell them what happened before they joined
  sendExistingRooms(socket);

  socket.on("close", () => {
    const remove = true;
    leaveRoom(uuid, remove);
    console.log("Disconnected");
    console.log(`Connected clients = ${ws.clients.size}`);
    updateAdminData();
  });

  socket.on("message", (rawData) => {
    const { type, payload } = parseMessage(rawData);
    switch (type) {
      case EVENT_TYPES.NEW_CHAT_MESSAGE:
        sendChatToRoom(uuid, payload);
        break;
      case EVENT_TYPES.READY_GAME:
        setReady(uuid);
        break;
      case EVENT_TYPES.CREATE_ROOM:
        // payload is room name
        createRoom(payload);
        break;
      case EVENT_TYPES.JOIN_ROOM:
        // payload is room name
        joinRoom(uuid, payload);
        break;
      case EVENT_TYPES.LEAVE_ROOM:
        leaveRoom(uuid);
        break;
      case EVENT_TYPES.REGISTER_ADMIN:
        registerAdmin(uuid, socket);
        break;
      case EVENT_TYPES.SEND_QUERY:
        sendQuery(uuid, payload);
        break;
      default:
        console.log(`${type}: not supported`);
    }
    updateAdminData();
  });
  updateAdminData();
});
