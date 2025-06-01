import './App.css'
import { Page } from './common/Page.js'
import { Box, Table, TableBody, TableCell, TableContainer, TableHead } from '@mui/material'
import { EventItem } from './types/Event.js';
import { EventRow } from './common/event/EventRow.js';
import { SearchFilterOptions } from './common/search/SearchFilterOptions.js';
import { EX_EVENTS } from './assets/exampleEvents.js';
import { CsvUpload } from './common/csv/CsvUpload.js';

function App() {
  return (
    <Page>
      <Box>
        <CsvUpload />
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
