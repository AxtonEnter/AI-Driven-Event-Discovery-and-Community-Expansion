import { gql } from "graphql-tag";

export const UserSchema = gql`
  type User {
    username: String
    role: String
  }

  type Query {
    user(id: ID!): User
    users: [User]
    currentUser: User
  }

  type Mutation {
    updateUserRole(username: String!, role: String!): User
  }
`