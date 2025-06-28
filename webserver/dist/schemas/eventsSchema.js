import { gql } from "graphql-tag";
export const EventsSchema = gql `
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
    tags: [Tag]
  }

  input EventFilter {
    url: String
    title: String
    organization: String
    text: String
  }

  type SeparatedEvents {
    pending: [Event]
    accepted: [Event]
    rejected: [Event]
  }

  type Query {
    events(searchText: String, filters: EventFilter): SeparatedEvents
  }

  type Mutation {
    rejectEvent(id: ID!, reason: String!): Boolean
    acceptEvent(id: ID!): Boolean
    pendEvent(id: ID!): Boolean
    beginScrape: Boolean
    rejectEvents(ids: [ID], reason: String!): Boolean
    acceptEvents(ids: [ID]): Boolean
    pendEvents(ids: [ID]): Boolean
  }
`;
//# sourceMappingURL=eventsSchema.js.map