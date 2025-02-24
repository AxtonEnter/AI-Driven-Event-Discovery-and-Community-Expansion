import { Button, Stack, TableCell, TableRow } from "@mui/material";
import { EventItem } from "../../types/Event";
import EditIcon from '@mui/icons-material/Edit';

interface Props {
    event: EventItem,
    handleSelect: () => void,
}

export function EventRow(props: Props) {

    return (
        <TableRow>
            <TableCell>
                <Stack direction={"column"} justifyContent={"center"}>
                    <div>
                        <a href={props.event.url}>{props.event.url}</a>
                    </div>
                    <Button startIcon={<EditIcon />}>Edit</Button>
                </Stack>
            </TableCell>
        </TableRow>
    )
}