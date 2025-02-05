'use client'

import * as React from 'react';
import Box from '@mui/material/Box';
import { AppBar, Button, Divider, IconButton, Menu, MenuItem, Stack, Typography } from '@mui/material';
import styled from "styled-components";
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import  LogoSVG from '../assets/RIT_hor.svg';

const StyledLogo = styled.img`
  margin: 20px 12px 12px 12px;
  &:hover {
    cursor: pointer;
  }
`;

type Props = {
    children: React.ReactNode;
}

export const Page = ({ children }: Props) => {
    const router = useRouter();

    return (
        <Box>
            <AppBar position='static' color='transparent' sx={{px: 2}}>
                <Stack direction={"row"} alignItems={"center"}>
                    <Image src={LogoSVG} alt="RIT logo" onClick={() => router.push('/')} />

                    <Divider orientation='vertical' sx={{mx: 2}} component={"p"} />

                    <Button sx={{ height: 60 }} onClick={() => router.push('/')}>Home</Button>

                    <Button sx={{ height: 60 }} onClick={() => router.push('/changelog')}>Changelog</Button>

                    <Button sx={{ height: 60 }} onClick={() => router.push('/timesheet')}>Timesheet</Button>
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