import { gql } from "graphql-tag";

export const RegionSchema = gql`
  type Region {
    koa_url: String
    name: String!
  }

  type Query {
    region(name: String!): Region
    regions: [Region]
  }

  type Mutation {
    deleteRegion(id: ID!): Boolean
    deleteAllRegions: Boolean
  }
`