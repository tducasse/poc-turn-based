import { db } from "@tducasse/js-db";
import { EVENT_TYPES, STARTING } from "../constants";
import { getNickname } from "../users";
import {
  clamp,
  deepCopy,
  getAllShopItems,
  getCurrentItem,
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
    payload: {
      resources,
      income,
      attack,
      defense,
      health,
      shopItems: getAllShopItems(uuid),
    },
  });
};

const buyItem = ({ uuid, payload }) => {
  const { name } = payload;
  const roomName = getRoomByUser(uuid);
  const previous = db.rooms.findOne({ name: roomName }).state[uuid];
  const { shopItems } = previous;
  const level = shopItems[name];
  const { current, type } = getCurrentItem(name, level);
  if (!current || !current.price) {
    return false;
  }
  const { price, value } = current;

  if (previous.resources < price) {
    return false;
  }
  db.rooms.update(
    { users: uuid },
    {
      $set: {
        [`state.${uuid}.resources`]: previous.resources - price,
        [`state.${uuid}.${type}`]: (previous[type] || 0) + value,
      },
    }
  );
  sendNextUserState(uuid);
  return true;
};

const getNewHealth = (health, attack, defense) =>
  clamp(health - (attack || 0) + (defense || 0), 0, health);

const getNewIncome = (resources, income) => resources + (income || 0);

const getRoundSummary = (name, roundData) => {
  let gameOver = false;
  const room = db.rooms.findOne({ name });
  const summary = [""]
    .concat(
      Object.entries(roundData).map(([uuid, roundState]) => {
        const nickname = getNickname(uuid);
        return [
          `--`,
          `- ${nickname}: ${roundState.attack} ATK`,
          `- ${nickname}: ${roundState.defense} DEF`,
        ];
      })
    )
    .concat(["--------"])
    .concat(
      Object.entries(room.state).map(([uuid, userState]) => {
        gameOver = gameOver || !userState.health;
        const { nickname } = db.users.findOne({ uuid });
        return `- ${nickname}: ${userState.health} HP`;
      })
    )
    .concat(["--------"])
    .flat()
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
  const roundData = deepCopy({
    [firstUuid]: firstState,
    [secondUuid]: secondState,
  });
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

  const { summary, gameOver } = getRoundSummary(name, roundData);
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

const upgradeItem = ({ uuid, payload }) => {
  const { name } = payload;
  const roomName = getRoomByUser(uuid);
  const previous = db.rooms.findOne({ name: roomName }).state[uuid];
  const { shopItems } = previous;
  const level = shopItems[name];
  const { current, type, next } = getCurrentItem(name, level);
  if (!current || !current.upgrade || !next) {
    return false;
  }
  const { upgrade } = current;
  if (previous.resources < upgrade) {
    return false;
  }

  db.rooms.update(
    { users: uuid },
    {
      $set: {
        [`state.${uuid}.resources`]: previous.resources - upgrade,
        [`state.${uuid}.shopItems.${name}`]: level + 1,
        ...(type === "income" && {
          [`state.${uuid}.income`]: next.value,
        }),
      },
    }
  );

  sendNextUserState(uuid);
  return true;
};

export default {
  buyItem,
  upgradeItem,
  nextRound,
};
