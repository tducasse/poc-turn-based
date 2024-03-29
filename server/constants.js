// eslint-disable-next-line import/prefer-default-export
export const EVENT_TYPES = {
  NEW_CHAT_MESSAGE: "new_chat_message",
  CREATE_ROOM: "create_room",
  LEAVE_ROOM: "leave_room",
  JOIN_ROOM: "join_room",
  READY_GAME: "ready_game",
  LIST_ROOMS: "list_rooms",
  UPDATE_ADMIN_DATA: "update_admin_data",
  REGISTER_ADMIN: "register_admin",
  SEND_QUERY: "send_query",
  BACK_TO_LOBBY: "back_to_lobby",
  REMOVE_ROOM: "remove_room",
  GAME__START_GAME: "game__start_game",
  GAME__BUY_ITEM: "game__buy_item",
  GAME__INIT_GAME: "game__init_game",
  GAME__NEXT_ROUND: "game__next_round",
  SET_NICKNAME: "set_nickname",
  KEEP_ALIVE: "keep_alive",
  OPPONENT_LEFT: "opponent_left",
  GAME_OVER: "game_over",
};

export const SEPARATOR = "__";

export const STARTING = {
  RESOURCES: 10,
  INCOME: 10,
  ATTACK: 0,
  DEFENSE: 0,
  HEALTH: 25,
};

export const KEEP_ALIVE_TIMEOUT = 30000;

const ATTACK_ITEMS = {
  archery: {
    0: {
      value: 1,
      upgrade: 3,
      price: 1,
    },
    1: {
      value: 2,
      price: 1,
    },
  },
};

const DEFENSE_ITEMS = {
  walls: {
    0: {
      value: 1,
      upgrade: 3,
      price: 1,
    },
    1: {
      value: 2,
      price: 1,
    },
  },
};

const INCOME_ITEMS = {
  cityHall: {
    0: {
      value: 10,
      upgrade: 3,
    },
    1: {
      value: 12,
    },
  },
};

export const SHOP_ITEMS = {
  income: { ...INCOME_ITEMS },
  attack: { ...ATTACK_ITEMS },
  defense: { ...DEFENSE_ITEMS },
};
