import { Button, Stack } from "@mui/material"
import { useRef, useState } from "react"

export function CsvUpload() {
    const [file, setFile] = useState<File | null>(null);
    const inputFile = useRef<HTMLInputElement | null>(null);

    const openFileDialog = () => {
        inputFile.current?.click();
    }

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (files && files.length > 0) {
            setFile(files[0]);
        }
        else {
            setFile(null);
        }
    }

    return (
        <Stack direction={"row"} justifyContent={"center"} pb={2} pt={4}>
            <input type='file' id='file' ref={inputFile} style={{ display: 'none' }} accept=".csv" onChange={handleFileChange} />
            <Button color='info' variant='outlined' onClick={openFileDialog}>Upload CSV</Button>
        </Stack>
    )
}