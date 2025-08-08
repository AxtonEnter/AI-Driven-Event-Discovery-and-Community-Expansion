import { gql } from "@apollo/client";

export const GET_UPDATES = gql`
  query GetUpdates {
    updates {
      orgId
      organization {
        id
        name
        org_url
        koa_url
      }
      value
      postedAt
    }
  }
`;