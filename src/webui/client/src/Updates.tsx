import { Typography, Stack, Divider } from "@mui/material";
import { Page } from "./common/Page";
import RequestWrapper2 from "./common/RequestWrapper2";
import { GET_UPDATES } from "./queries/updatesQueries";
import { Update } from "./types/Update";
import { useQuery } from "@apollo/client";
import UpdateRow from "./common/UpddateRow";

export default function Updates() {
  const queryResult = useQuery(GET_UPDATES, {pollInterval: 2000});

  return (
    <Page>
      <RequestWrapper2
        result={queryResult}
        render={(data) => {
          if (data.updates.length === 0) {
            return (
              <Typography
                variant="body1"
                sx={{
                  fontStyle: "italic",
                  color: "grey.700",
                  mx: "auto",
                  my: 8,
                }}
              >
                No updates.
              </Typography>
            );
          }
          return (
            <Stack divider={<Divider flexItem />} mt={4} spacing={0.75}>
              {data.updates.map((update: Update) => (
                <UpdateRow  
                  key={update.orgId}
                  postedAt={update.postedAt.toISOString()}
                  organization={update.organization?.name || "Unknown Organization"}
                  value={update.value}>
                </UpdateRow>
              ))}
              <Typography variant="body2">This page is limitted to 100 updates.</Typography>
            </Stack>
          );
        }}
      />
    </Page>
  );
}
