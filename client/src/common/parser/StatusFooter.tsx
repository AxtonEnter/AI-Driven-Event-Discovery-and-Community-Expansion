import { Box, Card, LinearProgress, linearProgressClasses, LinearProgressProps, styled, Typography } from "@mui/material";

const BorderLinearProgress = styled(LinearProgress)(({ theme }) => ({
  height: 25,
  [`&.${linearProgressClasses.colorPrimary}`]: {
    backgroundColor: theme.palette.grey[200],
    ...theme.applyStyles('dark', {
      backgroundColor: theme.palette.grey[800],
    }),
  },
  [`& .${linearProgressClasses.bar}`]: {
    backgroundColor: '#1a90ff',
    ...theme.applyStyles('dark', {
      backgroundColor: '#308fe8',
    }),
  },
}));

function LinearProgressWithLabel(props: LinearProgressProps & { value: number }) {
  return (
    <Box>
      <Box sx={{ width: '100%' }}>
        <BorderLinearProgress variant="determinate" {...props} />
      </Box>
      <Box sx={{ position: "relative", left: -50 }}>
        <Typography
          variant="body2"
          sx={{ color: 'text.secondary' }}
        >{`30/100 Sites Scraped (${Math.round(props.value)}%)`}</Typography>
      </Box>
    </Box>
  );
}

export function StatusFooter() {

  return (
    <Card sx={{width: "100%", minHeight: "2em"}}>
      <Box>
        <LinearProgressWithLabel variant="determinate" value={30} />
      </Box>
    </Card>
  )
}