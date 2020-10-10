import { db } from "@tducasse/js-db";
import { EVENT_TYPES } from "../constants";
import { getRoomByUser, sendMessage, sendToEveryone } from "../util";

const sendNewIncomeAndResources = (uuid) => {
  const { income, resources } = db.rooms.findOne({ users: uuid }).state[uuid];
  const { socket } = db.users.findOne({ uuid });
  sendMessage(socket, {
    type: EVENT_TYPES.GAME__BUY_ITEM,
    payload: { resources, income },
  });
};

const buyItem = ({ uuid, payload }) => {
  const { cost, income } = payload;
  const previous = db.rooms.findOne({ users: uuid }).state[uuid];
  db.rooms.update(
    { users: uuid },
    {
      $set: {
        [`state.${uuid}.resources`]: previous.resources - cost,
        [`state.${uuid}.income`]: previous.income + income,
      },
    }
  );
  sendNewIncomeAndResources(uuid);
};

const startNextRound = (name) => {
  sendToEveryone({
    type: EVENT_TYPES.GAME__NEXT_ROUND,
    payload: true,
    room: name,
  });
};

const earnIncome = (name, uuid) => {
  const { resources, income } = db.rooms.findOne({ name }).state[uuid];
  db.rooms.update(
    { name },
    { $set: { [`state.${uuid}.resources`]: resources + income } }
  );
  sendNewIncomeAndResources(uuid);
};

const nextRound = ({ uuid }) => {
  const name = getRoomByUser(uuid);
  earnIncome(name, uuid);
  if (!name) {
    console.error(`nextRound(): can't find room for ${uuid}`);
  }
  const room = db.rooms.findOne({ name });
  db.rooms.update(
    { name },
    { $set: { ready: Array.from(new Set([uuid].concat(room.ready))) } }
  );
  const updatedRoom = db.rooms.findOne({ name });
  if ((updatedRoom.ready || []).length === 2) {
    db.rooms.update({ name }, { $set: { ready: [] } });
    startNextRound(name);
  }
};

export default {
  buyItem,
  nextRound,
};
