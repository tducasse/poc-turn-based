import WebSocket from "ws";
import { v4 as uuidv4 } from "uuid";
import store, {
  createRoom,
  joinRoom,
  leaveRoom,
  setReady,
  sendNewMessage,
  registerUser,
} from "./util";
import { EVENT_TYPES } from "./constants";

const PORT = process.env.PORT || 3000;

const ws = new WebSocket.Server({ port: PORT });

store.ws = ws;

ws.on("connection", (client) => {
  // create a unique id, and register the user
  const uuid = uuidv4();
  registerUser(uuid, client);

  console.log(`New connection`);
  console.log(`Connected clients = ${ws.clients.size}`);

  // send all the rooms to the client
  client.send(
    JSON.stringify({
      type: EVENT_TYPES.LIST_ROOMS,
      payload: store.rooms.map((el) => el.name).filter((el) => el !== "lobby"),
    })
  );

  client.on("close", () => {
    leaveRoom(uuid);
    console.log("Disconnected");
    console.log(`Connected clients = ${ws.clients.size}`);
  });

  client.on("message", (rawData) => {
    let data;
    try {
      data = JSON.parse(rawData);
    } catch (err) {
      console.error(`Could not parse ${rawData}`);
    }

    const { type, payload, room } = data;
    switch (type) {
      case EVENT_TYPES.NEW_CHAT_MESSAGE:
        sendNewMessage(uuid, payload, room);
        break;
      case EVENT_TYPES.READY_GAME:
        setReady(uuid, room);
        break;
      case EVENT_TYPES.JOIN_ROOM:
        // payload is room name
        joinRoom(uuid, payload);
        break;
      case EVENT_TYPES.CREATE_ROOM:
        // payload is room name
        createRoom(uuid, payload);
        break;
      case EVENT_TYPES.LEAVE_ROOM:
        leaveRoom(uuid, room);
        break;
      default:
        console.log(`${type}: not supported`);
    }
  });
});
