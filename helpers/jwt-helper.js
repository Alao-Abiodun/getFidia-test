const JWT = require("jsonwebtoken");
const dotenv = require("dotenv");
dotenv.config();

const secret = process.env.GETFIDIA_ACCESS_TOKEN_SECRET;

module.exports = {
  signAccessToken: (data) => {
    const payload = data;
    const options = {
      expiresIn: process.env.GETFIDIA_ACCESS_TOKEN_SECRET_EXPIRES_IN,
      // issuer: 'getfidia',
      // audience: '', // TODO: add audience and issuer
    };
    const token = JWT.sign(payload, secret, options);
    return token;
  },
  verifyAccessToken: (token) => {
    const payload = JWT.verify(token, secret);
    // console.log(payload);
    return payload;
  },
};
