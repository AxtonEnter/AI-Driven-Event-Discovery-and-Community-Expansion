import { gql } from "graphql-tag";
export const UserSchema = gql `
  type User {
    username: String!
    role: Int
  }

  type Query {
    user(id: ID!): User
  }
`;
//# sourceMappingURL=userSchema.js.map