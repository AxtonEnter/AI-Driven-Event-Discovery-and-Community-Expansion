import { Box, Typography, List, ListItem, ListItemAvatar, Avatar, ListItemText, Stack, Card, CardHeader, Chip, Paper } from "@mui/material";
import { Page } from "./common/Page";
import WorkIcon from '@mui/icons-material/Work';
import AssignmentIndIcon from '@mui/icons-material/AssignmentInd';
import TeamCard from "./common/TeamCard";


export default function Home() {
    return (
        <Page>
            <Box mt={5}>
                <Typography variant='h2'>AI Driven Event Discovery and Community Expansion</Typography>
                <Box ml={5}>
                    <List sx={{ width: '100%', maxWidth: 360, bgcolor: 'background.paper' }}>
                        <ListItem>
                            <ListItemAvatar>
                                <Avatar>
                                    <WorkIcon />
                                </Avatar>
                            </ListItemAvatar>
                            <ListItemText primary="Sponsor" secondary="KidsOutAndAbout.com" />
                        </ListItem>
                        <ListItem>
                            <ListItemAvatar>
                                <Avatar>
                                    <AssignmentIndIcon />
                                </Avatar>
                            </ListItemAvatar>
                            <ListItemText primary="Coach" secondary="Bryan Basham" />
                        </ListItem>
                    </List>
                </Box>
            </Box>

            <Box>
                <Typography variant='h4' mt={5} >The Team<br /></Typography>
                <Typography variant="body1" sx={{fontSize: '0.7em'}} mb={2}>Roles are subject to change</Typography>

                <Box ml={5}>
                    <Stack direction={"row"} flexWrap={'wrap'} maxWidth={600} justifyContent={"left"}>
                        <TeamCard name={"JD Bartholomew"} role={"Project Manager"} chipColor={"primary"} />
                        <TeamCard name={"Alec Haag"} role={"Documentation & Development Lead"} chipColor={"warning"} />
                        <TeamCard name={"Chris Shepard"} role={"Communications Lead"} chipColor={"secondary"} />
                        <TeamCard name={"Jahmir Hinds"} role={"UI/UX Lead"} chipColor={"success"} />
                        <TeamCard name={"Joe Wesnofske"} role={"Machine Learning Architect"} chipColor={"error"} />
                        <TeamCard name={"Eva Stoddard"} role={"Database Architect"} chipColor={"error"} />
                        <TeamCard name={"Edward Teutle"} role={"Scrum Master"} chipColor={"info"} />
                    </Stack>
                </Box>
            </Box>

            <Typography variant='h4' mt={5} mb={2}>Project Synopsis</Typography>

            <Paper elevation={3} sx={{mr: 20, p: 3, mb: 3, ml: 5}}>
                <Typography variant="body1">
                    The Team plans to create an isolated service to automate the process of finding events from a list of websites 
                    for the event directory site KidsOutAndAbout.com. These events are to be identified and parsed using a trained 
                    AI model. Parsed events are shown to website staff so they may edit and add them to the public site. 
                    <br /><br />
                    The Team additionally plans to develop a means for finding possible new partner organizations for KidsOutAndAbout.com 
                    given a list of regions not yet supported by the site. The proposed service will give the website staff a list of 
                    potential partners so that a new region site can be spun up with ease.
                </Typography>
            </Paper>

            <Typography variant='h4' mt={5} mb={2}>Development Methodology</Typography>

            <Box>
                <Typography variant="body2">
                    In progress! Coming soon.
                </Typography>
            </Box>

            <Typography variant='h4' mt={5} mb={2}>Metrics</Typography>

            <Box>
                <Typography variant="body2">
                    In progress! Coming soon.
                </Typography>
            </Box>

            <Typography variant='h4' mt={5} mb={2}>Domain Model</Typography>

            <Box>
                <Typography variant="body2">
                    In progress! Coming soon.
                </Typography>
            </Box>

        </Page>
    )
}