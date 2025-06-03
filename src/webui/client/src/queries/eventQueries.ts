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
    }
  }
`;