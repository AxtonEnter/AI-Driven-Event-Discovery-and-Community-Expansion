import './App.css'
import { Page } from './common/Page.js'
import { Box, Button, Stack, Table, TableBody, TableCell, TableContainer, TableHead } from '@mui/material'
import { EventItem } from './types/Event.js';
import { EventRow } from './common/event/EventRow.js';
import { SearchFilterOptions } from './common/search/SearchFilterOptions.js';
import { ApolloClient, InMemoryCache, useQuery } from '@apollo/client';
import { GET_EVENTS } from './queries/eventQueries.js';
import RequestWrapper from './common/RequestWrapper.js';

function App() {
  const apolloClient = new ApolloClient({
    uri: process.env.REACT_APP_GRAPHQL_URL ?? "https://localhost:3000/graphql",
    credentials: "include",
    cache: new InMemoryCache(),
  });

  const eventsResult = useQuery(GET_EVENTS);

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

export default App
