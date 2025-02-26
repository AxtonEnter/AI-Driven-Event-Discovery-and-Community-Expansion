import { Box, Typography, List, ListItem, ListItemAvatar, Avatar, ListItemText, Stack, Card, CardHeader, Chip, Paper, TableContainer, Table, TableHead, TableBody, TableCell, TableRow } from "@mui/material";
import { Page } from "./common/Page";
import WorkIcon from '@mui/icons-material/Work';
import AssignmentIndIcon from '@mui/icons-material/AssignmentInd';
import TeamCard from "./common/TeamCard";
import Markdown from "react-markdown";
import Image from 'next/image';
import DomainModelSVG from "./assets/domain_model_1.svg"


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
                <Paper elevation={3} sx={{mr: 20, p: 3, mb: 3, ml: 5}}>
                    <Markdown>{`
# Development Methodology

## Scrum / Agile

* 2 week sprints  
* Sprints will be planned utilizing GitHub Projects  
* Each sprint will have the same structure:  
  * 1st meeting of the sprint \- every other Friday \- will serve as the planning meeting where we define goals and assign roles and responsibilities  
  * Each subsequent meeting will double as a standup, checking in on progress to see where the team is  
  * The following Wednesday, we will have our half sprint check in with the product owner (sponsor) and coach to see where we are and ensure that we are headed in the right direction  
  * A week later \- the next Wednesday meeting with the product owner and coach \- will serve as a sprint wrap up and retrospective, where we show the completed artifacts of the previous sprint, get feedback, and align ourselves for the next sprint  
* Roles:  
  * Product Owner \- Sponsor  
  * Scrum Master \- TBD  
  * Dev team \- Students  
* Each artifact to be completed will be organized into a user story that contains the following:  
  * Artifact name  
  * Who is assigned to the user story  
  * Story Points \- more on these in a second  
  * A description of functionality \- ex: As a \_\_ I want \_\_ so that \_\_.  
  * Definition of done \- checklist of items that is filled out as work is completed  
  * Acceptance criteria \- items that a tester checks off to ensure correct functionality of the system \- ex: Given \_\_, when I \_\_ then I \_\_.  
* Metrics and Measurements:  
  * User stories and individual artifacts will each be given a “Story Point” value, either 1, 2, 3, or 5 ranging on the perceived difficulty of the task  
  * Each sprint, we will plan out how many tasks we can do based on the amount of story points added up in a sprint, or the “velocity” of a sprint  
  * As we go along and understand our workload and ability, this velocity will be adjusted accordingly  
* Individual user stories and features will be organized into the following buckets:  
  * Product Backlog \- planned artifacts for the entire project  
  * To-do \- artifacts planned to be completed for the sprint  
  * In-progress \- artifacts that are currently being developed  
  * In-review \- artifacts that need to be checked before being marked complete  
  * Complete \- artifacts that are finished 
                    `}</Markdown>
                </Paper>
            </Box>

            <Typography variant='h4' mt={5} mb={2}>Metrics</Typography>

            <Box>
                <Paper elevation={3} sx={{mr: 20, p: 3, mb: 3, ml: 5}}>
                    <TableContainer>
                        <Table>
                            <TableHead>
                                <TableCell>Metric</TableCell>
                                <TableCell>Summary</TableCell>
                                <TableCell>Type</TableCell>
                            </TableHead>
                            <TableBody>
                                <TableRow>
                                    <TableCell>Story Points</TableCell>
                                    <TableCell>A story is given some number of points depending on how much work is required. </TableCell>
                                    <TableCell>Progress</TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell>Velocity</TableCell>
                                    <TableCell>The amount of Story Points the team or specific developer can complete in a sprint.</TableCell>
                                    <TableCell>Progress</TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell>Code Coverage</TableCell>
                                    <TableCell>The amount of code that is covered in testing.</TableCell>
                                    <TableCell>Activity</TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell>Scope Added</TableCell>
                                    <TableCell>Accounts for the total number of story points added after the sprint commencement. If the scope added percentage is high it would indicate that there are issues with how we are planning our sprints.</TableCell>
                                    <TableCell>Effort</TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell>Code Churn</TableCell>
                                    <TableCell>The overall changes within your code base, most significantly the code added, modified, or removed throughout the development life cycle.</TableCell>
                                    <TableCell>Activity</TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell>Defect Density</TableCell>
                                    <TableCell>Number of errors per KLOC, page, use case.</TableCell>
                                    <TableCell>Defect</TableCell>
                                </TableRow>
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Paper>
            </Box>

            <Typography variant='h4' mt={5} mb={2}>Domain Model</Typography>

            <Box>
                <Paper elevation={3} sx={{mr: 20, p: 3, mb: 3, ml: 5}}>
                    <Image priority src={DomainModelSVG} alt="Domain Model" style={{maxWidth: "100%"}} />
                </Paper>
            </Box>

        </Page>
    )
}