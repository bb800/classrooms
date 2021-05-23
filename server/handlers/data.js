const dataWrapper = (data) => ({
  data,
});

const messageWrapper = (message) => ({
  message,
});

module.exports = {
  data: dataWrapper,
  message: messageWrapper,
};
