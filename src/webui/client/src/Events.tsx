import './App.css'
import { Page } from './common/Page.js'
import { Box, Tab, Table, TableBody, TableCell, TableContainer, TableHead, Tabs } from '@mui/material'
import { EventItem } from './types/Event.js';
import { EventRow } from './common/event/EventRow.js';
import { SearchFilterOptions } from './common/search/SearchFilterOptions.js';
import { useLazyQuery } from '@apollo/client';
import { GET_EVENTS } from './queries/eventQueries.js';
import RequestWrapper from './common/RequestWrapper.js';
import { CsvUpload } from './common/csv/CsvUpload.js';
import { useState } from 'react';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

function Events() {
  const [getEvents, getEventsResult] = useLazyQuery(GET_EVENTS);

  //getEvents();

  const [eventsPanel, setEventsPanel] = useState<number>(0);

  return (
    <Page>
      <Box>
        <CsvUpload handleUpload={function (file: File): void {
          console.log(file)
          throw new Error('Function not implemented.');
        }} />
        <SearchFilterOptions query={getEvents} />
      </Box>
      <Box>
        <RequestWrapper loading={getEventsResult.loading} error={getEventsResult.error}>
          <TableContainer>
            <Box sx={{ width: '100%' }}>
              <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                <Tabs value={eventsPanel} onChange={(e, newVal: number) => e && setEventsPanel(newVal)}>
                  <Tab label="Pending" value={0} />
                  <Tab label="Accepted" value={1} />
                  <Tab label="Rejected" value={2} />
                </Tabs>
              </Box>
            </Box>
            <TabPanel value={eventsPanel} index={0}>
              <Table>
                <TableHead sx={{ position: "sticky" }}>
                  <TableCell></TableCell>
                  <TableCell>URL</TableCell>
                  <TableCell>Content</TableCell>
                  <TableCell>Actions</TableCell>
                </TableHead>

                <TableBody>
                  {getEventsResult.data?.events.pending.map((eventItem: EventItem) => (
                    <EventRow event={eventItem} handleSelect={() => { }} />
                  ))}
                </TableBody>
              </Table>
            </TabPanel>
            <TabPanel value={eventsPanel} index={1}>
              <Table>
                <TableHead sx={{ position: "sticky" }}>
                  <TableCell></TableCell>
                  <TableCell>URL</TableCell>
                  <TableCell>Content</TableCell>
                  <TableCell>Actions</TableCell>
                </TableHead>
                <TableBody>
                  {getEventsResult.data?.events.accepted.map((eventItem: EventItem) => (
                    <EventRow event={eventItem} handleSelect={() => { }} />
                  ))}
                </TableBody>
              </Table>
            </TabPanel>
            <TabPanel value={eventsPanel} index={2}>
              <Table>
                <TableHead sx={{ position: "sticky" }}>
                  <TableCell></TableCell>
                  <TableCell>URL</TableCell>
                  <TableCell>Content</TableCell>
                  <TableCell>Actions</TableCell>
                </TableHead>
                <TableBody>
                  {getEventsResult.data?.events.rejected.map((eventItem: EventItem) => (
                    <EventRow event={eventItem} handleSelect={() => { }} />
                  ))}
                </TableBody>
              </Table>
            </TabPanel>
          </TableContainer>
        </RequestWrapper>
      </Box>
    </Page >
  )
}

export default Events;
