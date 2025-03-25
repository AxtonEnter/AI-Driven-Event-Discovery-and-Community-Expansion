import './App.css'
import { Page } from './common/Page'
import { Box, Button, Stack, Table, TableBody, TableCell, TableContainer, TableHead } from '@mui/material'
import { EventItem } from './types/Event';
import { EventRow } from './common/event/EventRow';
import { SearchFilterOptions } from './common/search/SearchFilterOptions';

const EX_EVENTS: EventItem[] = [
  {
    url: "https://example.com",
    shortDesc: 'Lorem ipsum odor amet, consectetuer adipiscing elit. Mus nec nisi netus sem cubilia ligula. Volutpat sodales hac praesent malesuada efficitur. Aenean malesuada turpis ultricies porta sapien.',
    details: 
    `Lorem ipsum odor amet, consectetuer adipiscing elit. Proin ridiculus auctor vivamus ante bibendum praesent. Eros efficitur nisl auctor iaculis 
    fringilla potenti ad. Nostra rutrum orci nibh neque rhoncus. Eget parturient porta ante nulla iaculis volutpat vulputate feugiat. Scelerisque dapibus donec 
    erat, nascetur montes orci.

    Vitae fusce mi scelerisque, amet nullam eros. Lectus taciti vulputate duis dolor libero; nascetur conubia. Cursus lacus hendrerit ex ad netus. Dui dui justo 
    ac, est sapien pretium amet fusce sem? Magna mollis senectus odio consectetur volutpat. Duis pulvinar laoreet imperdiet eget curae fermentum. Egestas ante 
    id ipsum ornare himenaeos posuere feugiat. Quam condimentum a ligula purus nam congue. Sagittis placerat ut mattis nisi metus lectus viverra himenaeos habitasse.`,
    imageUrls: ['https://upload.wikimedia.org/wikipedia/commons/thumb/e/e0/Cat_demonstrating_static_cling_with_styrofoam_peanuts.jpg/310px-Cat_demonstrating_static_cling_with_styrofoam_peanuts.jpg'],
    status: null,
    startDateTime: new Date(2025, 4, 1, 12, 0, 0),
    endDateTime: new Date(2025, 4, 1, 15, 30, 0)
  },
  {
    url: "https://example.com",
    shortDesc: 'Lorem ipsum odor amet, consectetuer adipiscing elit. Mus nec nisi netus sem cubilia ligula. Volutpat sodales hac praesent malesuada efficitur. Aenean malesuada turpis ultricies porta sapien.',
    details: 
    `Lorem ipsum odor amet, consectetuer adipiscing elit. Proin ridiculus auctor vivamus ante bibendum praesent. Eros efficitur nisl auctor iaculis 
    fringilla potenti ad. Nostra rutrum orci nibh neque rhoncus. Eget parturient porta ante nulla iaculis volutpat vulputate feugiat. Scelerisque dapibus donec 
    erat, nascetur montes orci.

    Vitae fusce mi scelerisque, amet nullam eros. Lectus taciti vulputate duis dolor libero; nascetur conubia. Cursus lacus hendrerit ex ad netus. Dui dui justo 
    ac, est sapien pretium amet fusce sem? Magna mollis senectus odio consectetur volutpat. Duis pulvinar laoreet imperdiet eget curae fermentum. Egestas ante 
    id ipsum ornare himenaeos posuere feugiat. Quam condimentum a ligula purus nam congue. Sagittis placerat ut mattis nisi metus lectus viverra himenaeos habitasse.`,
    imageUrls: ['https://upload.wikimedia.org/wikipedia/commons/thumb/e/e0/Cat_demonstrating_static_cling_with_styrofoam_peanuts.jpg/310px-Cat_demonstrating_static_cling_with_styrofoam_peanuts.jpg'],
    status: null,
    startDateTime: new Date(2025, 4, 13, 9, 0, 0),
    endDateTime: new Date(2025, 4, 18, 23, 0, 0)
  }
];

function App() {
  return (
    <Page>
      <Box>
        <Stack direction={"row"} justifyContent={"center"} pb={2} pt={4}>
          <Button color='info' variant='outlined'>Upload CSV</Button>
        </Stack>

        <SearchFilterOptions />
      </Box>
      <Box>
        <TableContainer>
          <Table>
            <TableHead sx={{position: "sticky"}}>
              <TableCell></TableCell>
              <TableCell>URL</TableCell>
              <TableCell>Start - End</TableCell>
              <TableCell>Summary</TableCell>
              <TableCell>Actions</TableCell>
            </TableHead>
            <TableBody>
              {EX_EVENTS.map((eventItem: EventItem) => (
                <EventRow event={eventItem} handleSelect={() => {}} />
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    </Page>
  )
}

export default App
