import gql from "graphql-tag";

export const IMPORT_ORGANIZATION_CSV = gql`
  mutation ImportOrganizations($csv: String!) {
    importOrganizations(csv: $csv) {
      id
    }
  }
`