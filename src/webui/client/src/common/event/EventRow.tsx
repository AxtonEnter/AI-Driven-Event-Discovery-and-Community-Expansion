import { Button, Checkbox, Chip, Collapse, Divider, Paper, Snackbar, Stack, TableCell, TableRow, Tooltip, Typography } from "@mui/material";
import { ApprovalStatus, EventItem } from "../../types/Event";
import EditIcon from '@mui/icons-material/Edit';
import { useState } from "react";
import { Check, Close, ExpandLess, ExpandMore } from "@mui/icons-material";
import { EditEventUrlModal } from "./EditEventUrlModal";
import { FullContentModal } from "./FullContentModal";
import { useMutation } from "@apollo/client";
import { ACCEPT_EVENT, GET_EVENTS, PEND_EVENT, REJECT_EVENT } from "../../queries/eventQueries";
import { TEMP_USER } from "../../assets/TEMP_USER";
import { DenialReasonModal } from "../modal/DenialReasonModal";
import { Tag } from "../../types/Tag";
import { ImageCarouselModal } from "../modal/ImageCarouselModal";

interface Props {
  event: EventItem,
  handleSelect: (event: EventItem) => void,
}

export function EventRow(props: Props) {
  const [selected, setSelected] = useState<boolean>(false);
  const [expanded, setExpanded] = useState<boolean>(false);
  const [editModalOpen, setEditModalOpen] = useState<boolean>(false);
  const [contentModalOpen, setContentModalOpen] = useState<boolean>(false);
  const [imageModalOpen, setImageModalOpen] = useState<boolean>(false);
  const [denialReasonModalOpen, setDenialReasonModalOpen] = useState<boolean>(false);
  const [snackbarOpen, setSnackbarOpen] = useState<boolean>(false);
  const [rejectSnackbarOpen, setRejectSnackbarOpen] = useState<boolean>(false);
  const [pendSnackbarOpen, setPendSnackbarOpen] = useState<boolean>(false);



  const [acceptEvent] = useMutation(ACCEPT_EVENT, { variables: { id: props.event.id, username: TEMP_USER.username } });
  const [rejectEvent] = useMutation(REJECT_EVENT);
  const [pendEvent] = useMutation(PEND_EVENT, { variables: { id: props.event.id } });

  function handleAcceptClick() {
    acceptEvent({ refetchQueries: [GET_EVENTS] });
    setSnackbarOpen(true);
  }
  function handleAcceptUndoClick() {
    pendEvent({ refetchQueries: [GET_EVENTS] });
    setSnackbarOpen(false);
  }

  function handleRejectSubmitClick(reason: string) {
    rejectEvent({ refetchQueries: [GET_EVENTS], variables: { id: props.event.id, username: TEMP_USER.username, reason } });
    setRejectSnackbarOpen(true);
    setDenialReasonModalOpen(false);
  }
  function handleRejectUndoClick() {
    pendEvent({ refetchQueries: [GET_EVENTS] });
    setRejectSnackbarOpen(false);
  }

  function handlePendClick() {
    pendEvent({ refetchQueries: [GET_EVENTS] });
    setPendSnackbarOpen(true)
  }

  const showWarningTag = props.event.tags.length > 0;

  const tooltipMessages = (props.event.tags ?? []).map(
    (tag: Tag) => tag.desc
  );

  const tooltipText = tooltipMessages.join(", ");

  return (
    <TableRow>
      <TableCell style={{ verticalAlign: 'top' }}>
        <Checkbox value={selected} onChange={() => {setSelected(!selected); props.handleSelect(props.event); }} />
      </TableCell>
      <TableCell style={{ verticalAlign: 'top' }}>
        <Stack direction={"column"} justifyContent={"center"}>
          <div>
            <a style={{color: "text.secondary"}} href={props.event.url}>{props.event.url}</a>
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
        <Typography variant="subtitle1">Org: {props.event.organization?.name}</Typography>
        <Divider />
        <Button onClick={() => setContentModalOpen(true)} variant="contained">Show HTML Content</Button>
        <Button onClick={() => setImageModalOpen(true)} variant="contained" style={{marginLeft : '20px'}}>Show Images</Button>
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
      {props.event.status === ApprovalStatus.PENDING ? <TableCell style={{ verticalAlign: 'top' }}>
        <Button startIcon={<Check />} color="success" variant="contained" sx={{ minWidth: '100px', maxWidth: '150px', width: '70%', mb: 1 }} onClick={handleAcceptClick}>Accept</Button>
        <Button onClick={() => setDenialReasonModalOpen(true)} startIcon={<Close />} color="error" variant="contained" sx={{ minWidth: '100px', maxWidth: '150px', width: '70%' }}>Reject</Button>
      </TableCell>
      : <TableCell style={{ verticalAlign: 'top' }}>
        <Button startIcon={<Check />} color="warning" variant="contained" sx={{ minWidth: '100px', maxWidth: '150px', width: '70%', mb: 1 }} onClick={handlePendClick}>Pend</Button>
      </TableCell>}
      <EditEventUrlModal currentUrl={props.event.url} isOpen={editModalOpen} handleClose={() => setEditModalOpen(false)} />
      <FullContentModal htmlContent={props.event.html} isOpen={contentModalOpen} handleClose={() => setContentModalOpen(false)} />
      <DenialReasonModal isOpen={denialReasonModalOpen} handleClose={() => setDenialReasonModalOpen(false)} handleSubmit={handleRejectSubmitClick} />
      <ImageCarouselModal images={props.event.images} isOpen={imageModalOpen} handleClose={() => setImageModalOpen(false)} />
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={() => setSnackbarOpen(false)}
        message="Event marked as Accepted"
        action={<Button onClick={handleAcceptUndoClick} color="secondary" variant="text">Undo</Button>}
      />
      <Snackbar
        open={rejectSnackbarOpen}
        autoHideDuration={6000}
        onClose={() => setRejectSnackbarOpen(false)}
        message="Event marked as Rejected"
        action={<Button onClick={handleRejectUndoClick} color="secondary" variant="text">Undo</Button>}
      />
      <Snackbar
        open={pendSnackbarOpen}
        autoHideDuration={6000}
        onClose={() => setPendSnackbarOpen(false)}
        message="Event marked as Pending"
      />
    </TableRow>
  )
}