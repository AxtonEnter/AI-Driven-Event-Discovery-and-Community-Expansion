import { gql } from "graphql-tag";

export const OrganizationSchema = gql`
  type Organization {
    id: ID!
    email: String
    name: String
    koa_url: String!
    org_url: String!
    org_events_url: String
    region: Region
    }

  type Query {
    organization(id: ID!): Organization
  }
`