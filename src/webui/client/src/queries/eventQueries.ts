import gql from "graphql-tag";


export const GET_EVENTS = gql`
  query GetEvents {
    events {
      id
      url
      title
      html
      text
      addedat
      statuschangedat
      rejectedreason
      user {
        username
      }
      organization {
        id
        email
        name
        koa_url
        org_url
        org_events_url
        region {
          koa_url
          name
        }
      }
      tags {
        name
        desc
        color
      }
    }
  }
`;

export const REJECT_EVENT = gql`
  mutation RejectEvent($id: ID!, $reason: String!) {
    rejectEvent(id: $id, reason: $reason)
  }
`;

export const ACCEPT_EVENT = gql`
  mutation AcceptEvent($id: ID!) {
    acceptEvent(id: $id)
  }
`;

export const PEND_EVENT = gql`
  mutation PendEvent($id: ID!) {
    pendEvent(id: $id)
  }
`;