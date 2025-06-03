import { Button, Checkbox, Chip, Collapse, Divider, Paper, Snackbar, Stack, TableCell, TableRow, Tooltip, Typography } from "@mui/material";
import { EventItem } from "../../types/Event";
import { Warning, WarningKey } from "../../types/Warning";
import EditIcon from '@mui/icons-material/Edit';
import { useState } from "react";
import { Check, Close, ExpandLess, ExpandMore } from "@mui/icons-material";
import { EditEventUrlModal } from "./EditEventUrlModal";
import { FullContentModal } from "./FullContentModal";
import { useMutation } from "@apollo/client";
import { ACCEPT_EVENT, GET_EVENTS, PEND_EVENT } from "../../queries/eventQueries";
import { TEMP_USER } from "../../assets/TEMP_USER";
import { DenialReasonModal } from "../modal/DenialReasonModal";

interface Props {
  event: EventItem,
  handleSelect: () => void,
}

export function EventRow(props: Props) {
  const [selected, setSelected] = useState<boolean>(false);
  const [expanded, setExpanded] = useState<boolean>(false);
  const [editModalOpen, setEditModalOpen] = useState<boolean>(false);
  const [contentModalOpen, setContentModalOpen] = useState<boolean>(false);
  const [snackbarOpen, setSnackbarOpen] = useState<boolean>(false);


  const [acceptEvent] = useMutation(ACCEPT_EVENT, { variables: { id: props.event.id, username: TEMP_USER.username } });
  const [pendEvent] = useMutation(PEND_EVENT, { variables: { id: props.event.id } });

  function handleAcceptClick() {
    acceptEvent({ refetchQueries: [GET_EVENTS] });
    setSnackbarOpen(true);
  }

  function handleAcceptUndoClick() {
    pendEvent({ refetchQueries: [GET_EVENTS] });
    setSnackbarOpen(false);
  }
  const [denialReasonModalOpen, setDenialReasonModalOpen] = useState<boolean>(false);

  const showWarningTag = props.event.hasWarnings;

  const tooltipMessages = (props.event.warnings || []).map(
    (warningKey: WarningKey) => Warning[warningKey] || warningKey
  );

  const tooltipText = tooltipMessages.join(", ");

  return (
    <TableRow>
      <TableCell style={{ verticalAlign: 'top' }}>
        <Checkbox value={selected} onChange={() => { setSelected(!selected); props.handleSelect }} />
      </TableCell>
      <TableCell style={{ verticalAlign: 'top' }}>
        <Stack direction={"column"} justifyContent={"center"}>
          <div>
            <a href={props.event.url}>{props.event.url}</a>
          </div>
          <Button startIcon={<EditIcon />} onClick={() => setEditModalOpen(true)}>Edit</Button>
            {showWarningTag && (
            <Tooltip title={tooltipText}>
              <Chip
                label="Warning"
                size="small"
                color="warning"
                style={{ marginTop: "4px", maxWidth: "100px" }}
              />
            </Tooltip>
          )}
        </Stack>
      </TableCell>
      <TableCell width={"65%"} style={{ verticalAlign: 'top' }}>
        <Typography variant="h5">{props.event.title}</Typography>
        <Divider />
        <Button onClick={() => setContentModalOpen(true)} variant="contained">Show HTML Content</Button>
        <Typography variant="body2">
          {expanded
            ? <a onClick={() => setExpanded(false)}><ExpandLess /> Hide Raw HTML</a>
            : <a onClick={() => setExpanded(true)}><ExpandMore /> Show Raw HTML</a>}
        </Typography>
        <Collapse in={expanded}>
          <Paper>
            {props.event.text ?? "No Text."}
          </Paper>
        </Collapse>
      </TableCell>
      <TableCell style={{ verticalAlign: 'top' }}>
        <Button startIcon={<Check />} color="success" variant="contained" sx={{ maxWidth: '150px', width: '70%', mb: 1 }} onClick={handleAcceptClick}>Accept</Button>
        <Button onClick={() => setDenialReasonModalOpen(true)} startIcon={<Close />} color="error" variant="contained" sx={{ maxWidth: '150px', width: '70%' }}>Reject</Button>
      </TableCell>
      <EditEventUrlModal currentUrl={props.event.url} isOpen={editModalOpen} handleClose={() => setEditModalOpen(false)} />
      <FullContentModal htmlContent={props.event.html} isOpen={contentModalOpen} handleClose={() => setContentModalOpen(false)} />
      <DenialReasonModal isOpen={denialReasonModalOpen} handleClose={() => setDenialReasonModalOpen(false)} />

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={() => setSnackbarOpen(false)}
        message="Event marked as Accepted"
        action={<Button onClick={handleAcceptUndoClick} color="secondary" variant="text">Undo</Button>}
      />
    </TableRow>
  )
}