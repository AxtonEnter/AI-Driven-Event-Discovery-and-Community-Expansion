import './App.css'
import { Page } from './common/Page.js'
import { Box, Button, Snackbar, Tab, Table, TableBody, TableCell, TableContainer, TableHead, Tabs } from '@mui/material'
import { EventItem } from './types/Event.js';
import { EventRow } from './common/event/EventRow.js';
import { SearchFilterOptions } from './common/search/SearchFilterOptions.js';
import { useLazyQuery, useMutation } from '@apollo/client';
import { GET_EVENTS, IMPORT_EVENTS } from './queries/eventQueries.js';
import RequestWrapper from './common/RequestWrapper.js';
import { CsvUpload } from './common/csv/CsvUpload.js';
import { useState, useEffect } from 'react';
import { IMPORT_ORGANIZATION_CSV } from './queries/organizationQueries.js';
import { EventCsvUpload } from './common/csv/EventCsvUpload.js';
import { saveAs } from 'file-saver';

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
  const [getEvents, getEventsResult] = useLazyQuery(GET_EVENTS, { pollInterval: 2000 });

  const [importOrgCsv, importOrgCsvResult] = useMutation(IMPORT_ORGANIZATION_CSV);
  const [importEventCsv, importEventCsvResult] = useMutation(IMPORT_EVENTS);

  //getEvents();

  const [eventsPanel, setEventsPanel] = useState<number>(0);
  const [selectedEvents, setSelectedEvents] = useState<EventItem[]>([]);
  const [importSnackbarOpen, setImportSnackbarOpen] = useState<boolean>(false);
  const [eventImportSnackbarOpen, setEventImportSnackbarOpen] = useState<boolean>(false);

  function handleSelect(event: EventItem) {
    setSelectedEvents((prev: EventItem[]) =>
      prev.includes(event) ? prev.filter((e) => e !== event) : [...prev, event]
    );
  }

  // Show Snackbar when importOrgCsvResult.data changes (i.e., import finishes successfully)
  useEffect(() => {
    if (importOrgCsvResult.data) {
      setImportSnackbarOpen(true);
    }
  }, [importOrgCsvResult.data]);

  // Show Snackbar when importEventCsvResult.data changes (i.e., event import finishes successfully)
  useEffect(() => {
    if (importEventCsvResult.data) {
      setEventImportSnackbarOpen(true);
    }
  }, [importEventCsvResult.data]);

  // Export accepted events as CSV
  function exportAcceptedEventsCsv() {
    const accepted = getEventsResult.data?.events.accepted;
    if (!accepted || accepted.length === 0) return;

    // Define CSV headers and fields to export
    const headers = ["id", "organization", "url", "title", "text", "images", "status"];
    const csvRows = [
      headers.join(","),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ...accepted.map((event: any) =>
        headers.map(h => {
          // eslint-disable-next-line prefer-const
          let val = event[h];
          if (Array.isArray(val)) {
            return `"${val.join(';').replace(/"/g, '""')}"`;
          }
          if (typeof val === "string") {
            return `"${val.replace(/"/g, '""')}"`;
          }
          return val ?? "";
        }).join(",")
      )
    ];
    const csvContent = csvRows.join("\r\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8" });
    saveAs(blob, "accepted_events.csv");
  }

  return (
    <Page>
      <Box>
        <CsvUpload result={importOrgCsvResult} handleUpload={async function (file: File): Promise<void> {
          console.log("begin upload: orgs");
          importOrgCsv({ variables: { csv: await file.text() } });
        }} />
        <EventCsvUpload onFileSelected={async function (file: File): Promise<void> {
          console.log("begin upload: events");
          importEventCsv({ variables: { csv: await file.text() } });
        }} />
        <SearchFilterOptions selectedEvents={selectedEvents} query={getEvents} />
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
                    <EventRow event={eventItem} handleSelect={handleSelect} />
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
                    <EventRow event={eventItem} handleSelect={handleSelect} />
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
                    <EventRow event={eventItem} handleSelect={handleSelect} />
                  ))}
                </TableBody>
              </Table>
            </TabPanel>
          </TableContainer>
        </RequestWrapper>
      </Box>
      <Button
        color="success"
        variant="outlined"
        sx={{ ml: 2 }}
        onClick={exportAcceptedEventsCsv}
        disabled={!getEventsResult.data?.events.accepted?.length}
      >
        Export Accepted Events CSV
      </Button>

      <Snackbar
        open={importSnackbarOpen}
        autoHideDuration={6000}
        onClose={() => setImportSnackbarOpen(false)}
        message="Import successful. Engaging Web Scraper..."
      />
      <Snackbar
        open={eventImportSnackbarOpen}
        autoHideDuration={6000}
        onClose={() => setEventImportSnackbarOpen(false)}
        message="Event CSV import successful."
      />
    </Page >
  )
}

export default Events;
