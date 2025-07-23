import { gql } from "graphql-tag";

export const UserSchema = gql`
  type User {
    username: String
    role: String
  }

  type Query {
    user(id: ID!): User
    currentUser: User
  }
`