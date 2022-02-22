const { privateKey } = require("./pvt");
const { publicKey } = require("./pbk");
const { mongoUrl } = require("./mongo_uri");

const index = {
  publicKey,
  privateKey,
  mongoUrl,
};

module.exports = index;
