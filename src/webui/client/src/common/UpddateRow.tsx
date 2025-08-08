import { Stack, Typography } from "@mui/material";
import { format, parseISO } from "date-fns";
import { useEffect, useState } from "react";

interface AuditLogRowProps {
  postedAt: string;
  organization: string;
  value: string;
}

function formatDateTime(dateTime: string) {
  return format(parseISO(dateTime), "M/d/yy h:mmaaa").split(" ");
}

export default function UpdateRow({ postedAt, organization, value }: AuditLogRowProps) {
  const [width, setWidth] = useState<number>(window.innerWidth);
  function handleWindowSizeChange() {
    setWidth(window.innerWidth);
  }
  useEffect(() => {
    window.addEventListener('resize', handleWindowSizeChange);
    return () => {
      window.removeEventListener('resize', handleWindowSizeChange);
    }
  }, []);
  const isMobile = width <= 1100;

  const [date, time] = formatDateTime(postedAt);

  return (
    <Stack direction={isMobile ? "column" : "row"} alignItems={isMobile ? "flex-start" : "center"} px={2}>
      <Stack direction={isMobile ? "row" : "column"}>
        <Stack direction={"row"}>
          <Typography color={localStorage.getItem("themeMode") == "dark" ? "grey.300" : "grey.700"} sx={{ width: 70 }} variant="body2">
            {date}
          </Typography>
          <Typography color={localStorage.getItem("themeMode") == "dark" ? "grey.300" : "grey.700"} sx={{ width: 93 }} variant="body2">
            {time}
          </Typography>
        </Stack>
      </Stack>
      <Typography>
        {organization}: {value}
      </Typography>
    </Stack>
  );
}
