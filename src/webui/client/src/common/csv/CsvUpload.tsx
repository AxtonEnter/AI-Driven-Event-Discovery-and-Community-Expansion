import { MutationResult } from "@apollo/client";
import { Button, Stack } from "@mui/material"
import { useRef, useState } from "react"

type CsvUploadProps = {
    handleUpload: (file: File) => void;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    result: MutationResult<any>;
}

export function CsvUpload(props: CsvUploadProps) {
    const [file, setFile] = useState<File | null>(null);
    const inputFile = useRef<HTMLInputElement | null>(null);

    const openFileDialog = () => {
        inputFile.current?.click();
    }

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        console.log("handleFileChange", e);
        const files = e.target.files;
        if (files && files.length > 0) {
            console.log("Files selected:", files);
            setFile(files[0]);
            if (file) {
                console.log("File selected:", file.name);
                props.handleUpload(file);
            }
        }
        else {
            setFile(null);
        }
    }

    return (
        <Stack direction={"row"} justifyContent={"center"} pb={2} pt={4}>
            <input type='file' id='file' ref={inputFile} style={{ display: 'none' }} accept=".csv" onChange={handleFileChange} />
            <Button color='info' variant='outlined' onClick={openFileDialog} loading={props.result.loading}>Upload CSV</Button>
        </Stack>
    )
}