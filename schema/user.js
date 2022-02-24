const { gql } = require("apollo-server-express");

const userSchema = gql`
  extend type Query {
    user(id: ID!): User
    users: [User]!
  }
  extend type Mutation {
    createUser(input: CreateUserInput): CreateUserResponse!
    login(input: LoginInput): LoginResponse!
    verifyEmail(input: VerifyEmailInput): verifyEmailResponse!
    resendEmailVerification(
      input: ResendEmailVerificationInput
    ): resendEmailResponse!
  }

  type CreateUserResponse {
    message: String!
    status: Boolean!
    user: User!
  }

  type LoginResponse {
    message: String!
    success: Boolean!
    token: String!
  }

  type verifyEmailResponse {
    message: String!
    success: Boolean!
  }

  type resendEmailResponse {
    message: String!
    success: Boolean!
  }

  type User {
    _id: ID!
    name: String!
    email: String!
    username: String!
    password: String!
    mobile_number: String!
    country: String
    createdAt: String!
  }

  input CreateUserInput {
    name: String!
    email: String!
    username: String!
    password: String!
    mobile_number: String!
    country: String
  }

  input VerifyEmailInput {
    code: String!
  }

  input LoginInput {
    email: String!
    password: String!
  }

  input ResendEmailVerificationInput {
    email: String!
  }
`;

module.exports = userSchema;
