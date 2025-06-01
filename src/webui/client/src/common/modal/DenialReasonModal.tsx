import { Button, Input, Stack } from "@mui/material"
import PrettyModal from "../PrettyModal"
import { useState } from "react";

interface Props {
    isOpen: boolean;
    handleClose: () => void;
}

export function DenialReasonModal(props: Props) {
    const [denialReason, setDenialReason] = useState<string>();

    return (
        <PrettyModal open={props.isOpen} onClose={props.handleClose} title="Denial Reason">
            <Stack direction={"column"}>
                <Input aria-label="Reason for denial" type="input" value={denialReason} onChange={(e) => setDenialReason(e.target.value)} />
            </Stack>
            <Stack direction={"row"} justifyContent={"flex-end"} mt={3}>
                <Button color="error" variant="contained" sx={{mx: 1}}>Cancel</Button>
                <Button color="success" variant="contained" sx={{mx: 1}}>Submit</Button>
            </Stack>
        </PrettyModal>
    )
}