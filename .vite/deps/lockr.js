import "./chunk-QHEXK6IG.js";

// node_modules/lockr/dist/index.mjs
var PREFIX = "";
function setPrefix(prefix) {
  PREFIX = prefix;
  return PREFIX;
}
function getPrefixedKey(key, options) {
  if ((options == null ? void 0 : options.noPrefix) === true) {
    return key;
  } else {
    return `${PREFIX}${key}`;
  }
}
function hasPrefix() {
  return PREFIX.length > 0;
}
function getPrefix() {
  return PREFIX;
}
var prefix_default = getPrefix;
function set(key, value, options) {
  var query_key = getPrefixedKey(key, options);
  try {
    localStorage.setItem(query_key, JSON.stringify({ data: value }));
  } catch (e) {
    if (console) {
      console.warn(
        `Lockr didn't successfully save the '{"${key}": "${value}"}' pair, because the localStorage is full.`
      );
    }
  }
}
function smembers(key, options) {
  const queryKey = getPrefixedKey(key, options);
  let value;
  const localValue = localStorage.getItem(queryKey);
  if (localValue !== null) {
    value = JSON.parse(localValue);
  } else {
    value = null;
  }
  return value && value.data ? value.data : [];
}
function sadd(key, value, options) {
  const queryKey = getPrefixedKey(key, options);
  let json;
  var values = smembers(key);
  if (values.indexOf(value) > -1) {
    return false;
  }
  try {
    values.push(value);
    json = JSON.stringify({ data: values });
    localStorage.setItem(queryKey, json);
  } catch (e) {
    console.log(e);
    if (console)
      console.warn(
        "Lockr didn't successfully add the " + value + " to " + key + " set, because the localStorage is full."
      );
  }
  return true;
}
function rm(key, options) {
  const queryKey = getPrefixedKey(key, options);
  return localStorage.removeItem(queryKey);
}
function get(key, missing, options) {
  const queryKey = getPrefixedKey(key, options);
  let value;
  const localValue = localStorage.getItem(queryKey);
  try {
    if (localValue !== null) {
      value = JSON.parse(localValue);
    }
  } catch (e) {
    if (localStorage[queryKey]) {
      value = { data: localStorage.getItem(queryKey) };
    } else {
      value = null;
    }
  }
  if (!value) {
    return missing;
  } else if (typeof value === "object" && typeof value.data !== "undefined") {
    return value.data;
  }
}
function keys() {
  const prefix = prefix_default();
  const keys2 = [];
  const allKeys = Object.keys(localStorage);
  if (!hasPrefix()) {
    return allKeys;
  }
  allKeys.forEach(function(key) {
    if (key.indexOf(prefix) !== -1) {
      keys2.push(key.replace(prefix, ""));
    }
  });
  return keys2;
}
function getAll(includeKeys) {
  const keys2 = keys();
  if (includeKeys) {
    return keys2.reduce(function(accum, key) {
      const tempObj = {};
      tempObj[key] = get(key);
      accum.push(tempObj);
      return accum;
    }, []);
  }
  return keys2.map(function(key) {
    return get(key);
  });
}
function flush() {
  if (hasPrefix()) {
    keys().forEach((key) => {
      localStorage.removeItem(getPrefixedKey(key));
    });
  } else {
    localStorage.clear();
  }
}
function sismember(key, value) {
  return smembers(key).indexOf(value) > -1;
}
function srem(key, value, options) {
  const queryKey = getPrefixedKey(key, options);
  const values = smembers(key, value);
  const index = values.indexOf(value);
  if (index > -1) {
    values.splice(index, 1);
  }
  const json = JSON.stringify({ data: values });
  try {
    localStorage.setItem(queryKey, json);
  } catch (e) {
    if (console)
      console.warn(
        "Lockr couldn't remove the " + value + " from the set " + key
      );
  }
}
export {
  flush,
  get,
  getAll,
  getPrefix,
  getPrefixedKey,
  hasPrefix,
  keys,
  rm,
  sadd,
  set,
  setPrefix,
  sismember,
  smembers,
  srem
};
//# sourceMappingURL=lockr.js.map
