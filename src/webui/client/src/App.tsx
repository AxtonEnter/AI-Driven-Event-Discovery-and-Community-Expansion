import './App.css'
import { Page } from './common/Page'
import { Box, Button, Stack, Table, TableBody, TableCell, TableContainer, TableHead } from '@mui/material'
import { EventItem } from './types/Event';
import { EventRow } from './common/event/EventRow';
import { SearchFilterOptions } from './common/search/SearchFilterOptions';
import { EX_EVENTS } from './assets/exampleEvents';

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
              <TableCell>Content</TableCell>
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
