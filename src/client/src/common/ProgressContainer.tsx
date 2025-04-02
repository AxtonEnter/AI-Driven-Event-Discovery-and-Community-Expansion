import { Box, Card, Collapse, LinearProgress, linearProgressClasses, Stack, styled, Typography } from "@mui/material";
import { useState } from "react";

const StyledLinearProgress = styled(LinearProgress)(({ theme }) => ({
  height: 10,
  borderRadius: 5,
  [`&.${linearProgressClasses.colorPrimary}`]: {
    backgroundColor: theme.palette.grey[200],
    ...theme.applyStyles('dark', {
      backgroundColor: theme.palette.grey[800],
    }),
  },
  [`& .${linearProgressClasses.bar}`]: {
    borderRadius: 5,
  },
}));

const SubStyledLinearProgress = styled(LinearProgress)(({ theme }) => ({
  height: 5,
  borderRadius: 5,
  [`&.${linearProgressClasses.colorPrimary}`]: {
    backgroundColor: theme.palette.grey[200],
    ...theme.applyStyles('dark', {
      backgroundColor: theme.palette.grey[800],
    }),
  },
  [`& .${linearProgressClasses.bar}`]: {
    borderRadius: 5,
  },
}));

export function ProgresssContainer() {
  const [expanded, setExpanded] = useState<boolean>(true);

  return (
    <Card sx={{ width: "100%", position: "fixed", bottom: 0, p: 3, m: 0 }}>
        <Stack direction={"column"}>
          <Box mr={8} ml={4}>
            <Typography variant="body2" fontSize={15}>
              {58}/{100} sites scraped
            </Typography>
            <StyledLinearProgress variant="determinate" color="success" value={58} />
          </Box>

          <Box mt={3} mr={8} ml={4}>
            <Typography variant="body2" fontSize={15}>
              (Step 1/5) Requesting example.com/example.html...
            </Typography>
            <SubStyledLinearProgress variant="determinate" color="info" value={20} />
          </Box>
        </Stack>
    </Card>
  )
}