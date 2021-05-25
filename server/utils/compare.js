const sortResultsByKey = (key) => (a, b) => {
  if (a[key] < b[key]) {
    return -1;
  }

  if (a[key] > b[key]) {
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
  filterObject,
};
