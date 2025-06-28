import { gql } from "graphql-tag";
export const TagSchema = gql `
  type Tag {
    name: String!
    desc: String
    color: String!
  }
`;
//# sourceMappingURL=tagSchema.js.map