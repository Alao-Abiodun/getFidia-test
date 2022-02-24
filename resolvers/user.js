// const { ForbiddenError } = require("apollo-server");
const { AuthenticationError } = require("apollo-server");
const { combineResolvers } = require("graphql-resolvers");
const { isAuthenticated } = require("./authentication");

const userResolver = {
  Query: {
    _: async () => {
      return true;
    },
    user: async (parent, { id }, { models, payload }) => {
      if (!payload) {
        throw new AuthenticationError("Pls, login to view user details");
      }
      const user = await models.User.getUser(id);
      return user;
    },
    users: async (parent, {}, { models, payload }) => {
      const users = await models.User.fetchAllUsers();
      return users;
    },
  },
  User: {
    createdAt: async (parent, _, { models }) => {
      return await new Date(parent.createdAt).toLocaleString();
    },
  },
  Mutation: {
    createUser: async (_, { input }, { models }) => {
      const user = await models.User.createUser(input);
      return {
        message: "User created successfully",
        status: true,
        user,
      };
    },
    verifyEmail: async (_, { input }, { models }) => {
      console.log("checking input type", typeof input, input);
      const verifiedUser = await models.User.verifyEmail(input);
      return {
        message: "User verified successfully",
        success: true,
        // verifiedUser,
      };
    },
    resendEmailVerification: async (_, { input }, { models }) => {
      const resendEmailUser = await models.User.resendEmailVerification(input);
      return {
        message: "A new verification email has been sent successfully",
        success: true,
        resendEmailUser,
      };
    },
    login: async (_, { input }, { models }) => {
      console.log("reached");
      const loginUser = await models.User.login(input);
      return {
        message: "User loggedIn successfully",
        success: true,
        loginUser,
      };
    },
  },
};

module.exports = userResolver;
