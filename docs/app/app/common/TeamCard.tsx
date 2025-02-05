import { Box, Card, CardContent, CardHeader, Chip, Stack, Typography } from "@mui/material"

type Props = {
    name: string,
    role: string,
    // pronouns: string;
    // origin: string;
    chipColor: "default" | "primary" | "secondary" | "error" | "info" | "success" | "warning"
}

export default function TeamCard(props: Props) {
    return (
        <Card sx={{ width: 500, px: 1, my: 1 }}>
            <CardContent>
                <Stack direction={"row"} alignItems={"center"} justifyContent={"space-between"}>
                    <Typography variant="h6" textAlign={"center"}>{props.name}</Typography>
                    <Chip color={props.chipColor} label={props.role} variant="outlined" />
                </Stack>
            </CardContent>
        </Card>
    )
}