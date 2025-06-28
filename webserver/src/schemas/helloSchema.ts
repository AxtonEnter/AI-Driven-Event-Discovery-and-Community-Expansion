import { gql } from "graphql-tag";

export const HelloSchema = gql`
  type Query {
    hello: String
  }
`