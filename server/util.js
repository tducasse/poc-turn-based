import { db } from "@tducasse/js-db";

// send {type, payload, room} to `client`
export const sendMessage = (client, { type, payload = true }) =>
  client.send(JSON.stringify({ type, payload }));

export const parseMessage = (message) => {
  let data;
  try {
    data = JSON.parse(message);
    return data;
  } catch (err) {
    console.error(`parseMessage(): could not parse ${message}`);
    return {};
  }
};

export const sendQuery = (uuid, query) => {
  const user = db.users.findOne({ uuid });
  if (!user) {
    console.error(`Can't find user ${uuid}`);
    return false;
  }
  if (!user.isAdmin) {
    console.error(`User is not admin`);
    return false;
  }

  const { collection, operator, match, update } = query;
  db[collection][operator](match, update);
  return true;
};

export const hasPrefix = (type) => {
  return type.indexOf("/") >= 0;
};

export const unPrefix = (type) => {
  return type.split("/");
};
