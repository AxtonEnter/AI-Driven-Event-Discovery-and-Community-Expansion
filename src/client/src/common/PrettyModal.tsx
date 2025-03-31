import { ReactNode } from "react";
import { Box, Card, IconButton, Modal, Stack, Typography } from "@mui/material";
import CloseIcon from '@mui/icons-material/Close';

interface PrettyModalProps {
  open: boolean;
  onClose: () => void;
  width?: number;
  title: string;
  children: ReactNode;
}

export default function PrettyModal({
  width = 400,
  open,
  onClose,
  title,
  children,
}: PrettyModalProps) {
  return (
    <Modal open={open} onClose={onClose}>
      <Card
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width,
          boxShadow: 24,
          maxHeight: "calc(100vh - 160px)",
          overflowY: "auto",
          px: 4,
          py: 1.5
        }}
      >
        <Stack direction={"row"} justifyContent={"space-between"}>
          <Typography variant="h5">Edit URL</Typography>
          <IconButton onClick={onClose}><CloseIcon /></IconButton>
        </Stack>
        <Box py={2}>
          {children}
        </Box>
      </Card>
    </Modal>
  );
}
