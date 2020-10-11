import { db } from "@tducasse/js-db";
import { EVENT_TYPES, STARTING } from "../constants";
import {
  clamp,
  getRoomByUser,
  sendMessage,
  sendServerMessageToRoom,
  sendToEveryone,
} from "../util";

const sendNextUserState = (uuid) => {
  const { income, resources, attack, defense, health } = db.rooms.findOne({
    users: uuid,
  }).state[uuid];
  const { socket } = db.users.findOne({ uuid });
  sendMessage(socket, {
    type: EVENT_TYPES.GAME__BUY_ITEM,
    payload: { resources, income, attack, defense, health },
  });
};

const buyItem = ({ uuid, payload }) => {
  const { type, cost } = payload;
  const toAdd = payload[type];
  if (!toAdd) {
    return false;
  }
  const previous = db.rooms.findOne({ users: uuid }).state[uuid];
  if (previous.resources < cost) {
    return false;
  }
  db.rooms.update(
    { users: uuid },
    {
      $set: {
        [`state.${uuid}.resources`]: previous.resources - cost,
        [`state.${uuid}.${type}`]: (previous[type] || 0) + toAdd,
      },
    }
  );
  sendNextUserState(uuid);
  return true;
};

const getNewHealth = (health, attack, defense) =>
  clamp(health - (attack || 0) + (defense || 0), 0, health);

const getNewIncome = (resources, income) => resources + (income || 0);

const getRoundSummary = (name) => {
  let gameOver = false;
  const summary = [""]
    .concat(
      Object.entries(db.rooms.findOne({ name }).state).map(
        ([uuid, userState]) => {
          gameOver = gameOver || !userState.health;
          return `- ${db.users.findOne({ uuid }).nickname}: ${
            userState.health
          }HP`;
        }
      )
    )
    .join("\n");
  return {
    summary,
    gameOver,
  };
};

const runFightPhase = (name) => {
  const { state } = db.rooms.findOne({ name });
  const [firstUuid, firstState] = Object.entries(state)[0];
  const [secondUuid, secondState] = Object.entries(state)[1];
  db.rooms.update(
    { name },
    {
      $set: {
        [`state.${firstUuid}.resources`]: getNewIncome(
          firstState.resources,
          firstState.income
        ),
        [`state.${firstUuid}.health`]: getNewHealth(
          firstState.health,
          secondState.attack,
          firstState.defense
        ),
        [`state.${secondUuid}.resources`]: getNewIncome(
          secondState.resources,
          secondState.income
        ),
        [`state.${secondUuid}.health`]: getNewHealth(
          secondState.health,
          firstState.attack,
          secondState.defense
        ),
        [`state.${secondUuid}.attack`]: STARTING.ATTACK,
        [`state.${secondUuid}.defense`]: STARTING.DEFENSE,
        [`state.${firstUuid}.attack`]: STARTING.ATTACK,
        [`state.${firstUuid}.defense`]: STARTING.DEFENSE,
      },
    }
  );
  sendNextUserState(firstUuid);
  sendNextUserState(secondUuid);

  const { summary, gameOver } = getRoundSummary(name);
  sendServerMessageToRoom(name, summary);
  sendToEveryone({
    type: EVENT_TYPES.GAME__NEXT_ROUND,
    payload: true,
    room: name,
  });
  if (gameOver) {
    sendToEveryone({ type: EVENT_TYPES.GAME_OVER, paylaod: true, room: name });
  }
};

const nextRound = ({ uuid }) => {
  const name = getRoomByUser(uuid);
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
    runFightPhase(name);
  }
};

export default {
  buyItem,
  nextRound,
};
