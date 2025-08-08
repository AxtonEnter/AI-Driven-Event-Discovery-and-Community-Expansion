import { gql } from "graphql-tag";

export const UpdatesSchema = gql`
  type Update {
    orgId: String!
    organization: Organization
    value: String!
    postedAt: DateTime!
  }

  type Query {
    updates: [Update]
  }
`;