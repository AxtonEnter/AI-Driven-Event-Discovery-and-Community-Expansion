import React, { ReactNode } from "react";
import { Card, CardHeader, IconButton, Modal, Stack } from "@mui/material";
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
          p: 4,
        }}
      >
        <CardHeader title={title} />
        <Stack direction={"row"} alignItems={"flex-end"}>
          <IconButton onClick={onClose}><CloseIcon /></IconButton>
        </Stack>
        {children}
      </Card>
    </Modal>
  );
}
