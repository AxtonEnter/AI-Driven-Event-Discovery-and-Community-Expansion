import { Paper } from "@mui/material"
import PrettyModal from "../PrettyModal"

interface Props {
  htmlContent: string;
  isOpen: boolean;
  handleClose: () => void;
}

export function FullContentModal(props: Props) {
  return (
    <PrettyModal open={props.isOpen} onClose={props.handleClose} title="Content" width={1200}>
      <Paper>
        <div dangerouslySetInnerHTML={{ __html: props.htmlContent }} /> {/* This is not a great option to continue with. Hence the attribute name. */}
      </Paper>
    </PrettyModal>
  )
}