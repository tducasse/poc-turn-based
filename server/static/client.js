// HELPERS
const parseMessage = (message) => {
  let data;
  try {
    data = JSON.parse(message);
    return data;
  } catch (err) {
    console.error(`parseMessage(): could not parse ${message}`);
    return {};
  }
};

const jsonToTable = (data, id) => {
  document.getElementById(id).innerHTML = `<pre>${JSON.stringify(
    data,
    null,
    2
  )}</pre>`;
};

const updateData = (data) => {
  jsonToTable(data.rooms, "rooms");
  jsonToTable(data.users, "users");
};

// SOCKET STUFF
const protocol = window.location.protocol === "https" ? "wss://" : "ws:/";
const socket = new WebSocket(
  protocol + window.location.host + window.location.pathname
);

socket.onopen = () => {
  socket.send(JSON.stringify({ type: "register-admin" }));
};

socket.onmessage = (event) => {
  const { type, payload } = parseMessage(event.data);
  if (type === "update-admin-data") {
    updateData(payload);
  }
};
