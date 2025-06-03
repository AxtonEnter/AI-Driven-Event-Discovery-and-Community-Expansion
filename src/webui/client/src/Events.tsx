import './App.css'
import { Page } from './common/Page.js'
import { Box, Table, TableBody, TableCell, TableContainer, TableHead } from '@mui/material'
import { EventItem } from './types/Event.js';
import { EventRow } from './common/event/EventRow.js';
import { SearchFilterOptions } from './common/search/SearchFilterOptions.js';
import { useQuery } from '@apollo/client';
import { GET_EVENTS } from './queries/eventQueries.js';
import RequestWrapper from './common/RequestWrapper.js';
import { CsvUpload } from './common/csv/CsvUpload.js';

function Events() {
  const eventsResult = useQuery(GET_EVENTS);

  return (
    <Page>
      <Box>
        <CsvUpload handleUpload={function (file: File): void {
          console.log(file)
          throw new Error('Function not implemented.');
        }} />
        <SearchFilterOptions />

      </Box>
      <Box>
        <TableContainer>
          <Table>
            <TableHead sx={{ position: "sticky" }}>
              <TableCell></TableCell>
              <TableCell>URL</TableCell>
              <TableCell>Content</TableCell>
              <TableCell>Actions</TableCell>
            </TableHead>
            <RequestWrapper loading={eventsResult.loading} error={eventsResult.error}>
              <TableBody>
                {eventsResult.data?.events.map((eventItem: EventItem) => (
                  <EventRow event={eventItem} handleSelect={() => { }} />
                ))}
              </TableBody>
            </RequestWrapper>
          </Table>
        </TableContainer>
      </Box>
    </Page>
  )
}

export default Events;
