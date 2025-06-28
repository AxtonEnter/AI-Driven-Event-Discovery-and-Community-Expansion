import { Button, Stack } from "@mui/material"
import { EventItem } from "../../types/Event";
import { useState } from "react";
import { BulkDenialModal } from "../modal/BulkDenialModal";
import { BulkAcceptModal } from "../modal/BulkAcceptModal";
import { useMutation } from "@apollo/client";
import { ACCEPT_EVENTS, REJECT_EVENTS } from "../../queries/eventQueries";

interface Props {
    events: EventItem[];
}

export function BulkAction(props: Props) {
    const [denialModalOpen, setDenialModalOpen] = useState<boolean>(false);
    const [acceptModalOpen, setAcceptModalOpen] = useState<boolean>(false);

    const [acceptEvents] = useMutation(ACCEPT_EVENTS);
    const [rejectEvents] = useMutation(REJECT_EVENTS);

    function handleDenialSubmit(events: EventItem[], reason: string) {
        rejectEvents({variables: {ids: events.map((e) => e.id), reason}})
        setDenialModalOpen(false);
    }

    function handleAcceptSubmit(events: EventItem[]) {
        acceptEvents({variables: {ids: events.map((e) => e.id)}})
        setAcceptModalOpen(false);
    }

    return (
        <Stack direction={"row"} spacing={2}>
            <Button onClick={() => setAcceptModalOpen(true)} variant="contained" color="success" sx={{mx: 1}} disabled={props.events.length === 0}>Bulk Accept</Button>
            <Button onClick={() => setDenialModalOpen(true)} variant="contained" color="error" sx={{mx: 1}} disabled={props.events.length === 0}>Bulk Deny</Button>
            <BulkAcceptModal events={props.events} isOpen={acceptModalOpen} handleClose={() => setAcceptModalOpen(false)} handleSubmit={(e: EventItem[]) => handleAcceptSubmit(e)} />
            <BulkDenialModal events={props.events} isOpen={denialModalOpen} handleClose={() => setDenialModalOpen(false)} handleSubmit={(e: EventItem[], reason: string) => handleDenialSubmit(e, reason)} />
        </Stack>
    );
}