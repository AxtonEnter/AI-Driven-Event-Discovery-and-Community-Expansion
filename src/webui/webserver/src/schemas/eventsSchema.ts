import { gql } from "graphql-tag";

export const EventsSchema = gql`
  type Event {
    id: ID!
    url: String!
    title: String!
    html: String!
    text: String
    addedat: DateTime!
    statuschangedat: DateTime
    rejectedreason: String
    user: User
    organization: Organization
    }

  type Query {
    events: [Event]
  }

  type Mutation {
    rejectEvent(id: ID!, reason: String!): Boolean
    acceptEvent(id: ID!): Boolean
  }
`