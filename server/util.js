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
