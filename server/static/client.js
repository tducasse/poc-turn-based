const protocol = window.location.protocol === "https" ? "wss://" : "ws:/";
const socket = new WebSocket(
  protocol + window.location.host + window.location.pathname
);

const EVENT_TYPES = {
  REGISTER_ADMIN: "register_admin",
  UPDATE_ADMIN_DATA: "update_admin_data",
  SEND_QUERY: "send_query",
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

const showQueryArea = () => {
  document.getElementById("query-area").style = "";
};

const cleanAndParse = (json) =>
  JSON.parse(json.replace(/(['"])?([a-zA-Z0-9_$]+)(['"])?:/g, '"$2": '));

const sendQuery = () => {
  const collection = document.getElementById("collection").value;
  const match = document.getElementById("match").value;
  const operator = document.getElementById("operator").value;
  const update = document.getElementById("update").value;

  if (!match || !collection || !operator) {
    return false;
  }

  if (operator === "update" && !update) {
    return false;
  }

  const query = {
    collection,
    operator,
    match: cleanAndParse(match),
    update: update && cleanAndParse(update),
  };
  console.log(query);
  socket.send(JSON.stringify({ type: EVENT_TYPES.SEND_QUERY, payload: query }));
  return true;
};

const initListeners = () => {
  document.getElementById("send-query").addEventListener("click", sendQuery);
};

// SOCKET STUFF
socket.onopen = () => {
  socket.send(JSON.stringify({ type: EVENT_TYPES.REGISTER_ADMIN }));
  initListeners();
};

socket.onmessage = (event) => {
  const { type, payload } = parseMessage(event.data);
  if (type === EVENT_TYPES.UPDATE_ADMIN_DATA) {
    updateData(payload);
    showQueryArea();
  }
};
