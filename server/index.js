import WebSocket from "ws";

const PORT = process.env.PORT || 3000;

const ws = new WebSocket.Server({ port: PORT });

const messages = ["Start chatting"];

const sendNewMessage = (message) => {
  messages.push(message);
  ws.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(["new-message", [message]]));
    }
  });
};

const sendNewMessages = (m) => m.forEach(sendNewMessage);

ws.on("connection", (socketClient) => {
  console.log("connected");
  console.log("client Set length: ", ws.clients.size);

  // send all previous messages to every client
  socketClient.send(JSON.stringify(["new-message", messages]));

  socketClient.on("close", () => {
    console.log("closed");
    console.log("Number of clients: ", ws.clients.size);
  });

  socketClient.on("message", (rawData) => {
    let data;
    try {
      data = JSON.parse(rawData);
    } catch (err) {
      console.error(`Could not parse ${rawData}`);
    }

    const [type, payload] = data;
    switch (type) {
      case "new-message":
        sendNewMessages(payload);
        break;
      case "new-connection":
        sendNewMessage(`New peer connected: ${payload}`);
        break;
      default:
        console.log(`${type}: not supported`);
    }
  });
});
