const sortResultsByKey = (key) => (a, b) => {
  if (a[key] < b[key]) {
    return -1;
  }

  if (a[key] > b[key]) {
    return 1;
  }

  return 0;
};

const sortResultsBy2Keys =
  ([key1, key2]) =>
  (a, b) => {
    if (a[key1] < b[key1]) {
      return -1;
    }
    if (a[key1] > b[key1]) {
      return 1;
    }

    // a[key1] === b[key1], sort by second key
    if (a[key2] < b[key2]) {
      return -1;
    }
    if (a[key2] > b[key2]) {
      return 1;
    }
    return 0;
  };

const filterObject = (obj, keys) =>
  keys.reduce((acc, k) => {
    acc[[k]] = obj[k];
    return acc;
  }, {});

module.exports = {
  sortResultsByKey,
  sortResultsBy2Keys,
  filterObject,
};
