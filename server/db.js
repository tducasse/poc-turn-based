import store from "./store";

const methods = (collection) => ({
  // inserts the new `item` in the `collection`
  insert: (item) => store[collection].push(item),
  // gets all the elements that matches `query`
  find: (query = {}) =>
    store[collection].filter((el) =>
      Object.entries(query).every(([key, val]) =>
        [].concat(el[key]).includes(val)
      )
    ),
  // counts all the elements that matches `query`
  count: (query = {}) =>
    store[collection].filter((el) =>
      Object.entries(query).every(([key, val]) =>
        [].concat(el[key]).includes(val)
      )
    ).length,
  // gets the first element that matches `query`
  findOne: (query = {}) =>
    store[collection].find((el) =>
      Object.entries(query).every(([key, val]) =>
        [].concat(el[key]).includes(val)
      )
    ),
  // replaces `$set` in every element that matches `query`
  // pushes everything in `$push` to the corresponding nested arrays
  update: (query = {}, { $push = {}, $set = {} } = {}) =>
    store[collection].forEach((el, idx) => {
      if (
        Object.entries(query).every(([key, val]) =>
          [].concat(el[key]).includes(val)
        )
      ) {
        const push = {};
        Object.entries($push).forEach(([key, val]) => {
          push[key] = (el[key] || []).concat(val);
        });
        store[collection][idx] = { ...el, ...$set, ...push };
      }
    }),
  // removes every element that matches `query`
  remove: (query = {}) =>
    store[collection].forEach(
      (el, idx) =>
        Object.entries(query).every(([key, val]) =>
          [].concat(el[key]).includes(val)
        ) && store[collection].splice(idx, 1)
    ),
});

const db = {};

const register = (collection) => {
  db[collection] = methods(collection);
};

register("rooms");
register("users");

export default db;
