import { Button, Stack } from "@mui/material"
import { EventItem } from "../../types/Event";
import { useState } from "react";
import { BulkDenialModal } from "../modal/BulkDenialModal";
import { BulkAcceptModal } from "../modal/BulkAcceptModal";

interface Props {
    events: EventItem[];
}

export function BulkAction(props: Props) {
    const [denialModalOpen, setDenialModalOpen] = useState<boolean>(false);
    const [acceptModalOpen, setAcceptModalOpen] = useState<boolean>(false);

    function handleDenialSubmit(events: EventItem[]) {
        // TODO: replace this console.log with what we do when we bulk deny events
        console.log(`Denied ${events.length} events`);
        setDenialModalOpen(false);
    }

    function handleAcceptSubmit(events: EventItem[]) {
        // TODO: replace this console.log with what we do when we bulk accept events
        console.log(`Accepted ${events.length} events`);
        setAcceptModalOpen(false);
    }

    return (
        <Stack direction={"row"} spacing={2}>
            <Button onClick={() => setAcceptModalOpen(true)} variant="contained" color="success" sx={{mx: 1}} disabled={props.events.length === 0}>Bulk Accept</Button>
            <Button onClick={() => setDenialModalOpen(true)} variant="contained" color="error" sx={{mx: 1}} disabled={props.events.length === 0}>Bulk Deny</Button>
            <BulkAcceptModal events={props.events} isOpen={acceptModalOpen} handleClose={() => setAcceptModalOpen(false)} handleSubmit={(e: EventItem[]) => handleAcceptSubmit(e)} />
            <BulkDenialModal events={props.events} isOpen={denialModalOpen} handleClose={() => setDenialModalOpen(false)} handleSubmit={(e: EventItem[]) => handleDenialSubmit(e)} />
        </Stack>
    );
}