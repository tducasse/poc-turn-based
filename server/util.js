import db from "./db";

// send {type, payload, room} to `client`
export const sendMessage = (client, { type, payload = true, room = "lobby" }) =>
  client.send(JSON.stringify({ type, payload, room }));

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
  // TODO: refactor this so that we can't just call it with whatever
  // eslint-disable-next-line no-eval
  eval(query);
  return true;
};
