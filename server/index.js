import WebSocket from "ws";
import { v4 as uuidv4 } from "uuid";
import express from "express";
import { register, seed, db } from "@tducasse/js-db";
import repl from "repl";
import net from "net";
import dispatch from "./dispatch";
import store from "./store";
import {
  registerAdmin,
  registerUser,
  setNickname,
  updateAdminData,
} from "./users";
import {
  createRoom,
  joinRoom,
  leaveRoom,
  sendChatToRoom,
  sendExistingRooms,
  setReady,
  resyncRooms,
} from "./rooms";
import { hasPrefix, parseMessage, sendQuery } from "./util";
import { EVENT_TYPES } from "./constants";

const PORT = process.env.PORT || 3000;

// the static part
const app = express();
const router = express.Router();
app.use("/", router);
app.use(express.static("static"));
const server = app.listen(PORT, () => console.log(`Listening on port ${PORT}`));

const ws = new WebSocket.Server({ server });

// init db
register("rooms");
register("users");
seed(store);

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
    if (hasPrefix(type)) {
      dispatch(type, uuid, payload);
    } else {
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
        case EVENT_TYPES.LIST_ROOMS:
          resyncRooms();
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
        case EVENT_TYPES.SET_NICKNAME:
          setNickname(uuid, payload);
          break;
        default:
          console.log(`${type}: not supported`);
      }
    }
    updateAdminData();
  });
  updateAdminData();
});

if (process.env.NODE_ENV === "development") {
  // start a socket on 1337, connect to it with `npm run cli`
  net
    .createServer((socket) => {
      const r = repl.start({
        prompt: "js-db>",
        input: socket,
        output: socket,
        terminal: true,
        preview: false,
      });
      r.context.db = db;
    })
    .listen(1337);
}
