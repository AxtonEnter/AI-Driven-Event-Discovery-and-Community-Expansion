import { Button, Input, Stack } from "@mui/material"
import PrettyModal from "../PrettyModal"
import { useState } from "react";

interface Props {
  currentUrl: string;
  isOpen: boolean;
  handleClose: () => void;
}

export function EditEventUrlModal(props: Props) {
  const [url, setUrl] = useState<string>(props.currentUrl);

  return (
    <PrettyModal open={props.isOpen} onClose={props.handleClose} title="Edit URL">
      <Stack direction={"column"}>
        <Input aria-label="New URL" type="url" value={url} onChange={(e) => setUrl(e.target.value)} />
      </Stack>
      <Stack direction={"row"} justifyContent={"flex-end"} mt={3}>
        <Button color="error" variant="contained" sx={{mx: 1}}>Cancel</Button>
        <Button color="success" variant="contained" sx={{mx: 1}}>Save</Button>
      </Stack>
    </PrettyModal>
  )
}