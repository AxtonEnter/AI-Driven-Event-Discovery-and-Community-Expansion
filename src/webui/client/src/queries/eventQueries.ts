import gql from "graphql-tag";


export const GET_EVENTS = gql`
  query GetEvents($searchText: String, $filters: EventFilter) {
    events(searchText: $searchText, filters: $filters) {
      pending {
        id
        url
        title
        html
        text
        images
        addedat
        status
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
      accepted {
        id
        url
        title
        html
        text
        images
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
      rejected {
        id
        url
        title
        html
        text
        images
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

export const REJECT_EVENTS = gql`
  mutation RejectEvents($ids: [ID], $reason: String!) {
    rejectEvents(ids: $ids, reason: $reason)
  }
`;

export const ACCEPT_EVENTS = gql`
  mutation AcceptEvents($ids: [ID]) {
    acceptEvents(ids: $ids)
  }
`;

export const PEND_EVENTS = gql`
  mutation PendEvents($ids: [ID]) {
    pendEvents(ids: $ids)
  }
`;

export const DELETE_ALL_EVENTS = gql`
  mutation DeleteAllEvents {
    deleteAllEvents
  }
`;

export const IMPORT_EVENTS = gql`
  mutation ImportEvents($csv: String!) {
    importEvents(csv: $csv)
  }
`;