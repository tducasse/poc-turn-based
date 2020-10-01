const protocol = window.location.protocol === "https" ? "wss://" : "ws:/";
const socket = new WebSocket(
  protocol + window.location.host + window.location.pathname
);

const EVENT_TYPES = {
  REGISTER_ADMIN: "register-admin",
  UPDATE_ADMIN_DATA: "update-admin-data",
  SEND_QUERY: "send-query",
};

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

const addQueryArea = () => {
  document.getElementById("query-area").style = "";
};

const sendQuery = () => {
  const query = document.getElementById("query").value;
  socket.send(JSON.stringify({ type: EVENT_TYPES.SEND_QUERY, payload: query }));
};

const initListeners = () => {
  document.getElementById("send-query").addEventListener("click", sendQuery);
};

// SOCKET STUFF
socket.onopen = () => {
  socket.send(JSON.stringify({ type: EVENT_TYPES.REGISTER_ADMIN }));
  initListeners();
  addQueryArea();
};

socket.onmessage = (event) => {
  const { type, payload } = parseMessage(event.data);
  if (type === EVENT_TYPES.UPDATE_ADMIN_DATA) {
    updateData(payload);
  }
};
