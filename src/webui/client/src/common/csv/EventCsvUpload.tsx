import React, { useRef, useState } from "react";
import { Button, Stack } from "@mui/material";

interface EventCsvUploadProps {
  onFileSelected?: (file: File) => void;
}

export const EventCsvUpload: React.FC<EventCsvUploadProps> = ({ onFileSelected }) => {
  const [file, setFile] = useState<File | null>(null);
  const inputFile = useRef<HTMLInputElement | null>(null);

  const openFileDialog = () => {
    inputFile.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      setFile(files[0]);
      console.log("File selected:", file?.name);
      if (onFileSelected) {
        onFileSelected(files[0]);
      }
    } else {
      setFile(null);
    }
  };

  return (
    <Stack direction={"row"} justifyContent={"center"} pb={2} pt={2}>
      <input
        type="file"
        id="event-csv-upload"
        ref={inputFile}
        style={{ display: "none" }}
        accept=".csv"
        onChange={handleFileChange}
      />
      <Button color="info" variant="outlined" onClick={openFileDialog}>
        Upload Event CSV (headers: orgId, url, rawText, images)
      </Button>
    </Stack>
  );
};
