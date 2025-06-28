import { Button, Stack } from "@mui/material"
import PrettyModal from "../PrettyModal"
import { EventItem } from "../../types/Event";

interface Props {
    events: EventItem[];
    isOpen: boolean;
    handleClose: () => void;
    handleSubmit: (events: EventItem[]) => void;
}

export function BulkAcceptModal(props: Props) {
    return (
        <PrettyModal open={props.isOpen} onClose={props.handleClose} title="Bulk Accept">
            <Stack direction={"column"}>
                <p>Are you sure you want to accept {props.events.length} {props.events.length === 1 ? 'event' : 'events'}?</p>
            </Stack>
            <Stack direction={"row"} justifyContent={"flex-end"} mt={3}>
                <Button onClick={props.handleClose} color="error" variant="contained" sx={{mx: 1}}>Cancel</Button>
                <Button onClick={() => props.handleSubmit(props.events)} color="success" variant="contained" sx={{mx: 1}}>Submit</Button>
            </Stack>
        </PrettyModal>
    )
}