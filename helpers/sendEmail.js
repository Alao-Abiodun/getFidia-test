const nodemailer = require("nodemailer");
require("dotenv").config();

const {
  MAIL_HOST,
  MAIL_PORT,
  MAIL_USER,
  MAIL_PASSWORD,
  FROM_NAME,
  FROM_EMAIL,
} = process.env;

exports.sendMail = async (config) => {
  let account = await nodemailer.createTestAccount();
  try {
    const transporter = nodemailer.createTransport({
      host: MAIL_HOST,
      port: MAIL_PORT,
      secure: true,
      auth: {
        user: MAIL_USER,
        pass: MAIL_PASSWORD,
      },
      tls: {
        rejectUnauthorized: false,
      },
    });

    const info = await transporter.sendMail({
      from: `${FROM_NAME} ${FROM_EMAIL}`,
      ...config,
    });

    return `Preview URL: %s', ${nodemailer.getTestMessageUrl(info)}`;
  } catch (err) {
    throw new Error(err.message);
  }
};
