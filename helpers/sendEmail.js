const nodemailer = require("nodemailer");

exports.sendMail = async (config) => {
  let account = await nodemailer.createTestAccount();
  try {
    const transporter = nodemailer.createTransport({
      host: "alao43844@gmail.com",
      port: 465,
      secure: true,
      auth: {
        user: "alao43844@gmail.com",
        pass: "abiodun1996",
      },
      tls: {
        rejectUnauthorized: false,
      },
    });

    const info = await transporter.sendMail({
      from: "getFidia alao43844@gmail.com",
      ...config,
    });

    return `Preview URL: %s', ${nodemailer.getTestMessageUrl(info)}`;
  } catch (err) {
    throw new Error(err.message);
  }
};
