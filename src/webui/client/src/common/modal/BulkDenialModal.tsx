import { Button, Input, Stack } from "@mui/material"
import PrettyModal from "../PrettyModal"
import { EventItem } from "../../types/Event";
import { useState } from "react";

interface Props {
    events: EventItem[];
    isOpen: boolean;
    handleClose: () => void;
    handleSubmit: (events: EventItem[]) => void;
}

export function BulkDenialModal(props: Props) {
    const [denialReason, setDenialReason] = useState<string>();

    return (
        <PrettyModal open={props.isOpen} onClose={props.handleClose} title="Bulk Denial">
            <Stack direction={"column"}>
                <p>Please provide reason for denying {props.events.length} {props.events.length === 1 ? 'event' : 'events'}.</p>
                <Input aria-label="Reason for denial" type="input" value={denialReason} onChange={(e) => setDenialReason(e.target.value)} />
            </Stack>
            <Stack direction={"row"} justifyContent={"flex-end"} mt={3}>
                <Button onClick={props.handleClose} color="error" variant="contained" sx={{mx: 1}}>Cancel</Button>
                <Button onClick={() => props.handleSubmit(props.events)} color="success" variant="contained" sx={{mx: 1}}>Submit</Button>
            </Stack>
        </PrettyModal>
    )
}