'use client'

import * as React from 'react';
import Box from '@mui/material/Box';
import { AppBar, Avatar, Button, Divider, Stack, Typography } from '@mui/material';
import { useNavigate } from 'react-router';
//import { ProgresssContainer } from './ProgressContainer';
import { useCurrentUser } from './CurrentUserProvider';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import ApprovalIcon from '@mui/icons-material/Approval';
import VisibilityIcon from '@mui/icons-material/Visibility';
import BusinessIcon from '@mui/icons-material/Business';
import EventNoteIcon from '@mui/icons-material/EventNote';
import GroupIcon from '@mui/icons-material/Group';


type Props = {
  children: React.ReactNode;
}

export const Page = ({ children }: Props) => {
  const navigate = useNavigate();
  const currentUser = useCurrentUser();

  return (
    <Box width={"100%"}>
      <AppBar position='static' color='transparent' sx={{ px: 2, width: "100%" }}>
        <Stack direction='row' alignItems='flex-start' justifyContent='space-between' width='100%' height={64}>
          <Stack direction={"row"} alignItems={"center"}>
            <Divider orientation='vertical' sx={{ mx: 2 }} component={"p"} />

            <Button sx={{ height: 60 }} startIcon={<EventNoteIcon />} onClick={() => navigate('/')}>Events</Button>
            <Button sx={{ height: 60 }} startIcon={<BusinessIcon />} onClick={() => navigate('/app/orgs')}>Organizations</Button>

            {currentUser.role === "admin" && (
              <Button sx={{ height: 60 }} startIcon={<GroupIcon />} onClick={() => navigate('/app/users')}>Users</Button>
            )}
          </Stack>

          <Stack direction={"row"} alignItems={"center"}>
            <Avatar>
              {currentUser.role === "admin" && <AdminPanelSettingsIcon />}
              {currentUser.role === "entrant" && <ApprovalIcon />}
              {currentUser.role === "guest" && <VisibilityIcon />}
            </Avatar>
            <Typography variant='body1' sx={{ ml: 1 }}>
              {currentUser.username}
            </Typography>
            <Button variant='outlined' sx={{ ml: 2 }} onClick={() => navigate('/logout')}>Logout</Button>
          </Stack>
        </Stack>

      </AppBar>

      <Box mx={5} mb={10}>
        {children}
      </Box>

      <footer>
        <Typography variant='body2'>

        </Typography>
      </footer>

      {/* <ProgresssContainer /> */}
    </Box>
  )
}