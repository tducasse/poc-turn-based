import WebSocket from "ws";

const ws = new WebSocket.Server({ port: 3000 });

const messages = ["Start chatting"];

ws.on("connection", (socketClient) => {
  console.log("connected");
  console.log("client Set length: ", ws.clients.size);

  socketClient.send(JSON.stringify(messages));

  socketClient.on("close", () => {
    console.log("closed");
    console.log("Number of clients: ", ws.clients.size);
  });

  socketClient.on("message", (message) => {
    messages.push(message);
    ws.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify([message]));
      }
    });
  });
});