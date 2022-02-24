// @ts-nocheck
const mongoose = require("mongoose");
const Token = require("./token");
const { AuthenticationError, UserInputError } = require("apollo-server");
const { signAccessToken, verifyAccessToken } = require("../helpers/jwt-helper");
require("dotenv").config();

const { DEV_URL, PROD_URL } = process.env;

const crypto = require("crypto");

const {
  bcryptCompare,
  bcryptHash,
  decoded,
  handleError,
  sendMail,
  sign,
  verifyToken,
} = require("../helpers/index");

const Schema = mongoose.Schema;

const userSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    username: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    mobile_number: {
      type: String,
      required: true,
    },
    country: {
      type: String,
      required: true,
    },
    verified: {
      type: Boolean,
      default: false,
    },
  },
  {
    id: false,
    timestamps: true,
  }
);

const User = mongoose.model("User", userSchema);

User.createUser = async ({
  name,
  email,
  username,
  password,
  mobile_number,
  country,
}) => {
  try {
    console.log(email);
    const regex =
      /^[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/i;
    if (!regex.test(email)) {
      throw new UserInputError("Invalid email address");
    }
    const userByEmail = await User.findOne({ email: email });
    console.log(userByEmail);
    if (userByEmail) {
      throw new AuthenticationError(
        "User already registered with the email address"
      );
    }
    const userByUsername = await User.findOne({ username: username });
    if (userByUsername) {
      throw new Error("User already registered with the username");
    }
    if (password.length < 6) {
      throw new UserInputError("Password must be more than 6 letters");
    }
    const hashPassword = await bcryptHash(password);
    const user = new User({
      name,
      email,
      username,
      password: hashPassword,
      mobile_number,
      country,
    });

    const config = {
      to: email,
      subject: "Registration Successful",
      html: `<h1 style="font-size: 28px">Successful Registration</h1>
      <p style="font-size: 12px; color: grey">Proceed to verify your email account by clicking on the link in the next mail that will forwarded to you soon</p>`,
    };
    const data = {
      email: user.email,
    };
    const code = signAccessToken(data);
    const token = new Token({
      token: code,
      userId: user._id,
    });

    let verificationUrl;
    if (process.env.NODE_ENV === "development") {
      verificationUrl = `${DEV_URL}auth/email/verify/?verification_token=${code}`;
    }
    verificationUrl = `${PROD_URL}auth/email/verify/?verification_token=${code}`;

    const emailConfig = {
      to: email,
      subject: "Email Confirmation",
      html: `<p>Your code is</p>
      <p style="width: 50%; margin: auto; font-size: 30px; letter-spacing: 3px"><a href="${verificationUrl}">click here</a> to verify your email.</p>
     `,
    };
    console.log(await sendMail(config));
    console.log(await sendMail(emailConfig));
    await token.save();
    await user.save();
    console.log(user);
    return user;
  } catch (error) {
    console.log(error);
    handleError(error);
  }
};

User.verifyEmail = async (data) => {
  try {
    const token = await Token.findOne({ token: data.code });
    console.log(token);
    if (!token) {
      throw new Error("Invalid token");
    }
    const user = await User.findOne({ _id: token.userId });
    if (user.verified) {
      throw new Error("User already  verified, kindly proceed to login");
    }
    user.verified = true;
    await user.save();
    await Token.deleteOne({ token: data.code });
    // const dataInfo = { message: "Email verified" };
    return user;
  } catch (error) {
    console.log(error);
    throw new Error(error.message);
  }
};

User.resendEmailVerification = async ({ email }) => {
  try {
    if (!email) {
      throw new Error("Please provide email");
    }

    const user = await User.findOne({ email }).select("+verified");

    if (!user) {
      throw new Error("Email has not been registered");
    }
    if (user.verified) {
      throw new Error("Email has already been verified, you can login");
      // return next(new AppError("Email has already been verified", 401));
    }

    const data = {
      email,
    };
    const code = signAccessToken(data.email);
    const token = new Token({
      token: code,
      userId: user._id,
    });

    let verificationUrl;
    if (process.env.NODE_ENV === "development") {
      verificationUrl = `${DEV_URL}auth/email/verify/?verification_token=${code}`;
    }
    verificationUrl = `${PROD_URL}auth/email/verify/?verification_token=${code}`;

    const emailConfig = {
      to: data.email,
      subject: "New Verification Email!",
      html: `<p>Your new Resend verification email is:</p>
      <p style="width: 50%; margin: auto; font-size: 30px; letter-spacing: 3px"><a href="${verificationUrl}">click here</a> to verify your email.</p>
     `,
    };
    console.log(await sendMail(emailConfig));
    await token.save();
    await user.save();
    return user;
  } catch (error) {
    console.log(error);
    handleError(error);
  }
};

User.login = async ({ email, password }) => {
  try {
    const user = await User.findOne({ email: email });
    if (!user) {
      throw new Error("No user registered with email address");
    }
    const doMatch = await bcryptCompare(password, user.password);
    if (!doMatch) {
      throw new Error("Incorrect Password");
    }
    if (!user.verified) {
      throw new Error(
        "Pls confirm your email address sent to your email address and verify"
      );
    }
    const payload = {
      email: user.email,
      username: user.username,
      userId: user._id,
    };
    const token = await signAccessToken(payload);
    return user;
  } catch (error) {
    handleError(error);
  }
};

User.fetchAllUsers = async () => {
  try {
    const users = await User.find();
    return users;
  } catch (error) {
    handleError(error);
  }
};

module.exports = User;
