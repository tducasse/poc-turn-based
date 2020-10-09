import { db } from "@tducasse/js-db";
import { EVENT_TYPES } from "../constants";
import { sendMessage } from "../util";

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

export default {
  buyItem,
};
