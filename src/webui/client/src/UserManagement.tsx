import React from "react";
import { useQuery, useMutation, gql } from "@apollo/client";
import { Box, Typography, Select, MenuItem } from "@mui/material";
import { DataGrid, GridColDef, GridRenderCellParams } from "@mui/x-data-grid";
import { Page } from "./common/Page";

const USERS_QUERY = gql`
  query GetUsers {
    users { username role }
  }
`;

const UPDATE_ROLE_MUTATION = gql`
  mutation UpdateUserRole($id: ID!, $role: String!) {
    updateUserRole(id: $id, role: $role) { id role }
  }
`;

const ROLE_OPTIONS = ["guest", "entrant", "admin"];

const UserManagement: React.FC = () => {
  const { data, loading, error, refetch } = useQuery(USERS_QUERY);
  const [updateRole] = useMutation(UPDATE_ROLE_MUTATION);

  const handleRoleChange = async (id: number, role: string) => {
    try {
      await updateRole({ variables: { id, role } });
      refetch();
    } catch {
      alert("Failed to update role");
    }
  };

  const columns: GridColDef[] = [
    { field: "id", headerName: "ID", width: 90 },
    { field: "username", headerName: "Username", flex: 1 },
    {
      field: "role",
      headerName: "Role",
      width: 150,
      renderCell: (params: GridRenderCellParams) => (
        <Select
          value={params.value}
          onChange={e => handleRoleChange(params.row.id, e.target.value)}
          size="small"
        >
          {ROLE_OPTIONS.map(role => (
            <MenuItem key={role} value={role}>{role}</MenuItem>
          ))}
        </Select>
      ),
    },
  ];

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error.message}</div>;

  return (
    <Page>
      <Box sx={{ p: 4 }}>
        <Typography variant="h4" gutterBottom>User Management</Typography>
        <Box sx={{ height: 500 }}>
          <DataGrid
            rows={data?.users || []}
            columns={columns}
            pageSizeOptions={[50]}
            rowSelection={false}
          />
        </Box>
      </Box>
    </Page>
  );
};

export default UserManagement;
