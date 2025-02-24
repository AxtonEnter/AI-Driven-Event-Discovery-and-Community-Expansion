'use client'

import * as React from 'react';
import Box from '@mui/material/Box';
import { AppBar, Button, Divider, IconButton, Menu, MenuItem, Stack, Typography } from '@mui/material';
import { useNavigate } from 'react-router';


type Props = {
  children: React.ReactNode;
}

export const Page = ({ children }: Props) => {
  const navigate = useNavigate();

  return (
    <Box>
      <AppBar position='static' color='transparent' sx={{ px: 2 }}>
        <Stack direction={"row"} alignItems={"center"}>
          <Divider orientation='vertical' sx={{ mx: 2 }} component={"p"} />

          <Button sx={{ height: 60 }} onClick={() => navigate('/')}>Events</Button>

          <Button sx={{ height: 60 }} onClick={() => navigate('/settings')}>Settings</Button>

          <Button sx={{ height: 60 }} onClick={() => navigate('/account')}>Account</Button>
        </Stack>

      </AppBar>

      <Box mx={5} mb={10}>
        {children}
      </Box>

      <footer>
        <Typography variant='body2'>

        </Typography>
      </footer>
    </Box>
  )
}