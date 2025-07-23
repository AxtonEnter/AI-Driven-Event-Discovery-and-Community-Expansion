import React from "react";
import { useQuery, useMutation, gql } from "@apollo/client";
import { Box, Button, Typography } from "@mui/material";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { Page } from "./common/Page";

interface Organization {
  id: number;
  name: string;
}

interface Region {
  koa_url: string;
  name: string;
}

const ORGANIZATIONS_QUERY = gql`
  query GetOrganizations {
    organizations { id name }
    regions { id name }
  }
`;

const DELETE_ORGANIZATION = gql`
  mutation DeleteOrganization($id: ID!) {
    deleteOrganization(id: $id)
  }
`;

const DELETE_REGION = gql`
  mutation DeleteRegion($id: ID!) {
    deleteRegion(id: $id)
  }
`;

const DELETE_ALL = gql`
  mutation DeleteAll {
    deleteAllOrganizations
    deleteAllRegions
  }
`;

const Organizations: React.FC = () => {
  const { data, loading, error, refetch } = useQuery(ORGANIZATIONS_QUERY);
  const [deleteOrganizationMutation] = useMutation(DELETE_ORGANIZATION);
  const [deleteRegionMutation] = useMutation(DELETE_REGION);
  const [deleteAllMutation] = useMutation(DELETE_ALL);

  const organizations: Organization[] = data?.organizations || [];
  const regions: Region[] = data?.regions || [];

  const deleteOrganization = async (id: number) => {
    try {
      await deleteOrganizationMutation({ variables: { id } });
      refetch();
    } catch (err) {
      alert("Failed to delete organization");
    }
  };

  const deleteRegion = async (id: number) => {
    try {
      await deleteRegionMutation({ variables: { id } });
      refetch();
    } catch (err) {
      alert("Failed to delete region");
    }
  };

  const deleteAll = async () => {
    try {
      await deleteAllMutation();
      refetch();
    } catch (err) {
      alert("Failed to delete all");
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error.message}</div>;

  // DataGrid columns for organizations
  const orgColumns: GridColDef[] = [
    { field: "id", headerName: "ID", width: 90 },
    { field: "name", headerName: "Name", flex: 1 },
    {
      field: "actions",
      type: "actions",
      headerName: "Actions",
      width: 120,
      getActions: (params) => [
        <Button
          variant="outlined"
          key="delete-org"
          color="error"
          onClick={() => deleteOrganization(params.id as number)}
        >Delete</Button>,
      ],
    },
  ];

  // DataGrid columns for regions
  const regionColumns: GridColDef[] = [
    { field: "koa_url", headerName: "KOA URL", width: 90 },
    { field: "name", headerName: "Name", flex: 1 },
    {
      field: "actions",
      type: "actions",
      headerName: "Actions",
      width: 120,
      getActions: (params) => [
        <Button
          variant="outlined"
          key="delete-region"
          color="error"
          onClick={() => deleteRegion(params.id as number)}
        >Delete</Button>,
      ],
    },
  ];

  return (
    <Page>
      <Box sx={{ p: 4 }}>
        <Typography variant="h4" gutterBottom>Organizations</Typography>
        <Button variant="contained" color="error" sx={{ mb: 2 }} onClick={deleteAll}>
          Delete All Organizations & Regions
        </Button>
        <Box sx={{ height: 400, mb: 4 }}>
          <DataGrid
            rows={organizations}
            columns={orgColumns}
            rowSelection={false}
            autoPageSize
          />
        </Box>
        <Typography variant="h4" gutterBottom>Regions</Typography>
        <Box sx={{ height: 400 }}>
          <DataGrid
            rows={regions}
            columns={regionColumns}
            rowSelection={false}
            autoPageSize
          />
        </Box>
      </Box>
    </Page>
  );
};

export default Organizations;
