import controllers from "./controllers";
import { unPrefix } from "./util";

const PREFIX = {
  GAME: "game",
};

const dispatch = (type, uuid, payload) => {
  const [prefix, method] = unPrefix(type);
  // let's make it more javascripty
  // "send-units" becomes "sendUnits"
  const camelizedMethod = method.replace(/-./g, (x) => x.toUpperCase()[1]);
  switch (prefix) {
    case PREFIX.GAME:
      controllers[prefix][camelizedMethod]({ uuid, payload });
      break;
    default:
      break;
  }
};

export default dispatch;
