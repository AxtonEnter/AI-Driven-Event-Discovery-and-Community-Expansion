import { Button, Checkbox, Collapse, Divider, Paper, Stack, TableCell, TableRow, Typography } from "@mui/material";
import { EventItem } from "../../types/Event";
import EditIcon from '@mui/icons-material/Edit';
import { useState } from "react";
import { Check, Close, ExpandLess, ExpandMore } from "@mui/icons-material";
import { EditEventUrlModal } from "./EditEventUrlModal";
import { FullContentModal } from "./FullContentModal";
import { DenialReasonModal } from "../modal/DenialReasonModal";

interface Props {
  event: EventItem,
  denialReason: string,
  handleSelect: () => void,
}

export function EventRow(props: Props) {
  const [selected, setSelected] = useState<boolean>(false);
  const [expanded, setExpanded] = useState<boolean>(false);
  const [editModalOpen, setEditModalOpen] = useState<boolean>(false);
  const [contentModalOpen, setContentModalOpen] = useState<boolean>(false);
  const [denialReasonModalOpen, setDenialReasonModalOpen] = useState<boolean>(false);

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
        </Stack>
      </TableCell>
      <TableCell width={"65%"} style={{ verticalAlign: 'top' }}>
        <Typography variant="h5">{props.event.tabTitle}</Typography>
        <Divider />
        <Button onClick={() => setContentModalOpen(true)} variant="contained">Show HTML Content</Button>
        <Typography variant="body2">
          {expanded
            ? <a onClick={() => setExpanded(false)}><ExpandLess /> Hide Raw HTML</a>
            : <a onClick={() => setExpanded(true)}><ExpandMore /> Show Raw HTML</a>}
        </Typography>
        <Collapse in={expanded}>
          <Paper>
            {props.event.parsedText}
          </Paper>
        </Collapse>
      </TableCell>
      <TableCell style={{ verticalAlign: 'top' }}>
        <Button startIcon={<Check />} color="success" variant="contained" sx={{ maxWidth: '150px', width: '70%', mb: 1 }}>Accept</Button>
        <Button onClick={() => setDenialReasonModalOpen(true)} startIcon={<Close />} color="error" variant="contained" sx={{ maxWidth: '150px', width: '70%' }}>Reject</Button>
      </TableCell>
      <EditEventUrlModal currentUrl={props.event.url} isOpen={editModalOpen} handleClose={() => setEditModalOpen(false)} />
      <FullContentModal htmlContent={props.event.parsedText} isOpen={contentModalOpen} handleClose={() => setContentModalOpen(false)} />
      <DenialReasonModal denialReason={props.denialReason} isOpen={denialReasonModalOpen} handleClose={() => setDenialReasonModalOpen(false)} />
    </TableRow>
  )
}