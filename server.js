// @ts-nocheck
const { ApolloServer } = require("apollo-server-express");
const { graphqlHTTP } = require("express-graphql");
const express = require("express");
const mongoose = require("mongoose");
const models = require("./models/index");
const typeDefs = require("./schema");
const resolvers = require("./resolvers");
const { error } = require("./helpers/index");
const { mongoUrl } = require("./constant/index");
const config = {
  mongoUrl,
};
const cors = require("cors");

const server = new ApolloServer({
  typeDefs,
  resolvers,
  tracing: true,
  context: async ({ req }) => {
    const { payload } = await models.User.verifyToken(req);
    return {
      models,
      payload,
    };
  },
  formatError: error,
});

const app = express();

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "OPTIONS, GET, POST, PUT, PATCH, DELETE"
  );
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }
  next();
});

app.use("/graphql", (error, req, res, next) => {
  console.log(error);
  const status = error.statusCode;
  const message = error.message;
  return res.status(status).json({ message, status });
});

app.use(cors());
server.applyMiddleware({ app });

mongoose
  .connect(config.mongoUrl, { useNewUrlParser: true, useUnifiedTopology: true })
  .then((res) => {
    console.log("MongoDB Connected");
    app.listen(4100, () => {
      console.log("🚀 Server ready at http://localhost:4100/graphql");
    });
  })
  .catch((err) => {
    console.log(err);
  });
