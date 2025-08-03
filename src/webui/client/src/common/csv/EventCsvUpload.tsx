import React from "react";

interface EventCsvUploadProps {
  onFileSelected?: (file: File) => void;
}

export const EventCsvUpload: React.FC<EventCsvUploadProps> = ({ onFileSelected }) => {
  return (
    <div>
      <label htmlFor="event-csv-upload">
        Upload CSV (headers: orgId, url, rawText, images):
      </label>
      <input
        id="event-csv-upload"
        type="file"
        accept=".csv"
        onChange={e => {
          const file = e.target.files?.[0];
          if (file && onFileSelected) {
            onFileSelected(file);
          }
        }}
      />
    </div>
  );
};
