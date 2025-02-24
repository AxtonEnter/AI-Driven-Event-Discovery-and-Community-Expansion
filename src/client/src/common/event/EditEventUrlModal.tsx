import { Input, Modal, Stack } from "@mui/material"
import PrettyModal from "../PrettyModal"
import { useState } from "react";

interface Props {
  currentUrl: string;
  isOpen: boolean;
  handleClose: () => void;
}

export function EditEventUrlModal(props: Props) {
  const [url, setUrl] = useState<string>();

  return (
    <PrettyModal open={props.isOpen} onClose={props.handleClose} title="Edit URL">
      <Stack direction={"column"}>
        <Input type="url" value={url} onChange={(e) => setUrl(e.target.value)} />
      </Stack>
    </PrettyModal>
  )
}