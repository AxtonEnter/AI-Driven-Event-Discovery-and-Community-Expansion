import { Button, Checkbox, Collapse, Divider, Stack, TableCell, TableRow, Typography } from "@mui/material";
import { EventItem } from "../../types/Event";
import EditIcon from '@mui/icons-material/Edit';
import { useState } from "react";
import { Check, Close, ExpandLess, ExpandMore } from "@mui/icons-material";

interface Props {
  event: EventItem,
  handleSelect: () => void,
}

export function EventRow(props: Props) {
  const [selected, setSelected] = useState<boolean>(false);
  const [expanded, setExpanded] = useState<boolean>(false);

  return (
    <TableRow>
      <TableCell>
        <Checkbox value={selected} onChange={() => {setSelected(!selected); props.handleSelect}} />
      </TableCell>
      <TableCell>
        <Stack direction={"column"} justifyContent={"center"}>
          <div>
            <a href={props.event.url}>{props.event.url}</a>
          </div>
          <Button startIcon={<EditIcon />}>Edit</Button>
        </Stack>
      </TableCell>
      <TableCell>
        <Typography>
          <b>Start: </b>
          {props.event.startDateTime.toString()}
        </Typography>
        <Divider />
        <Typography>
          <b>End: </b>
          {props.event.endDateTime.toString()}
        </Typography>
      </TableCell>
      <TableCell width={"65%"}>
        <Typography variant="body1">
          <b>Short Desc: </b>
          {props.event.shortDesc}

          <Typography variant="body2">
            {expanded
            ? <a onClick={() => setExpanded(false)}><ExpandLess /> Show Less</a>
            : <a onClick={() => setExpanded(true)}><ExpandMore /> Show More</a>}
          </Typography>
          <Collapse aria-expanded={expanded} in={expanded} unmountOnExit>
            <b>Details: </b>
            {props.event.details}
          </Collapse>
        </Typography>
      </TableCell>
      <TableCell>
        <Button startIcon={<Check />} color="success" variant="contained" sx={{maxWidth: '150px', width: '70%', mb: 1}}>Accept</Button>
        <Button startIcon={<Close />} color="error" variant="contained" sx={{maxWidth: '150px', width: '70%'}}>Reject</Button>
      </TableCell>
    </TableRow>
  )
}