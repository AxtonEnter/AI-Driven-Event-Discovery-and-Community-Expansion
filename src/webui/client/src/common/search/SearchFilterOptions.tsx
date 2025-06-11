import { ExpandMore } from "@mui/icons-material";
import { Box, Button, Card, Collapse, FormGroup, IconButton, Stack, TextField, Typography } from "@mui/material";
import { ChangeEvent, useEffect, useState } from "react";
import SearchBar from "./SearchBar";
import { useLocation, useNavigate } from "react-router";
import CloseIcon from "@mui/icons-material/Close";
import { endOfDay, parse, startOfDay } from "date-fns";
import { LazyQueryExecFunction, OperationVariables } from "@apollo/client";

interface EventSearchFilters {
  url?: string;
  title?: string;
  organization?: string;
  text?: string;

  // status: "only-pending" | "only-rejected" | "both"
}

function parseDateForQuery(
  dateString: string,
  dayShifter: (d: Date) => Date
): Date | null {
  if (!dateString) return null;
  return dayShifter(parse(dateString, "yyyy-MM-dd", new Date()));
}

interface SearchFilterOptionsProps {
  query: LazyQueryExecFunction<any, OperationVariables>;
}


export function SearchFilterOptions(props: SearchFilterOptionsProps) {
  const navigate = useNavigate();
  const { search } = useLocation();


  const [startDateString, setStartDateString] = useState<string>();
  const [stopDateString, setStopDateString] = useState<string>();
  const [searchText, setSearchText] = useState<string>("");
  const [expanded, setExpanded] = useState(false);
  const [filters, setFilters] = useState<EventSearchFilters>({});


  // function handleRejectsSwitchChange(e: any) {
  //   setFilters({ ...filters, status: e.target.value });
  //   setUrlParam("rejects", e.target.value);
  // }

  function handleSubmit() {
    const params = new URLSearchParams(search);
    params.set("q", searchText);
    if (filters) {
      filters.url && params.set("url", filters.url);
      filters.title && params.set("title", filters.title);
      filters.organization && params.set("org", filters.organization);
      filters.text && params.set("text", filters.text);
    }
    navigate("?" + params, { replace: true });
  }


  useEffect(() => {
    const searchParams = new URLSearchParams(search);
    const startDate = searchParams.get("start") ?? "";
    const stopDate = searchParams.get("stop") ?? "";
    const queryString = searchParams.get("q") ?? "";
    const filters = {
      url: searchParams.get("url") ?? undefined,
      title: searchParams.get("title") ?? undefined,
      organization: searchParams.get("org") ?? undefined,
      text: searchParams.get("text") ?? undefined,
    }
    // const status = (searchParams.get("rejects") as "only-pending" | "only-rejected" | "both") ?? "both";

    setStartDateString(startDate);
    setStopDateString(stopDate);
    setSearchText(queryString);
    setFilters({ ...filters });

    console.log(filters)

    props.query({
      variables: {
        startDate: parseDateForQuery(startDate, startOfDay),
        stopDate: parseDateForQuery(stopDate, endOfDay),
        searchText: queryString,
        filters: filters
      },
      pollInterval: 2000
    });
  }, [search]);

  const setUrlParam = (paramName: string, paramValue: string) => {
    const params = new URLSearchParams(search);
    params.set(paramName, paramValue);
    navigate("?" + params, { replace: true });
  };

  const handleDateChange =
    (paramName: string, setter: (s: string) => void) =>
      (e: ChangeEvent<HTMLInputElement>) => {
        setter(e.target.value);
        setUrlParam(paramName, e.target.value);
      };

  const handleClear = () => {
    setSearchText("");
    navigate("", { replace: true });
  };

  const showClearButton = search.includes("q=");


  return (
    <Box>
      <Stack direction={"row"} spacing={2}>
        <TextField
          label="Start"
          type="date"
          size="small"
          sx={{ width: 180 }}
          value={startDateString}
          onChange={handleDateChange("start", setStartDateString)}
          focused
        />
        <TextField
          label="Stop"
          type="date"
          size="small"
          sx={{ width: 180 }}
          value={stopDateString}
          onChange={handleDateChange("stop", setStopDateString)}
          focused
        />
        <SearchBar
          hideClearButton
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          onSubmit={() => setUrlParam("q", searchText)}
        />

        {showClearButton && (
          <IconButton onClick={handleClear} sx={{ ml: "8px !important" }}>
            <CloseIcon />
          </IconButton>
        )}
        <Button onClick={handleSubmit} variant="contained" color="primary">Search</Button>
      </Stack>
      <Card sx={{ p: "1em", background: 'none', border: 'none' }}>
        <Stack direction={"row"} onClick={() => setExpanded(!expanded)}>
          <ExpandMore
            aria-expanded={expanded}
            aria-label="Advanced Options"
          ></ExpandMore>
          <Typography>
            Advanced Options
          </Typography>
        </Stack>
        <Collapse in={expanded} timeout="auto" unmountOnExit>
          <Stack direction={"column"}>
            <FormGroup>
              <Typography>
                Type
              </Typography>
              <Stack direction={"column"} flexWrap={"wrap"} height={"10em"}>
                <Stack direction={"column"} flexWrap={"wrap"} maxWidth={500}>
                  <TextField variant="standard" label="Url" value={filters.url} onChange={(e) => { setFilters({ ...filters, url: e.target.value }); }} fullWidth />
                  <TextField variant="standard" label="Title" value={filters.title} onChange={(e) => { setFilters({ ...filters, title: e.target.value }); }} fullWidth />
                  <TextField variant="standard" label="Organization" value={filters.title} onChange={(e) => { setFilters({ ...filters, organization: e.target.value }); }} fullWidth />
                </Stack>
                <Stack direction={"column"} flexWrap={"wrap"} ml={5}>
                  <Stack direction={"row"}>
                    <Box width={"15%"} mr={1}>
                      <Typography variant="body1">Text contains: </Typography>
                    </Box>
                    <TextField variant="standard" value={filters.text} onChange={(e) => { setFilters({ ...filters, text: e.target.value }); }} fullWidth />
                  </Stack>
                </Stack>
              </Stack>
            </FormGroup>
            {/* <FormGroup>
              <ToggleButtonGroup value={filters.status} onChange={handleRejectsSwitchChange} exclusive={true} size="small" aria-label="Small sizes" orientation={"horizontal"}>
                <ToggleButton value="only-pending" key="only-pending">
                  Only Pending
                </ToggleButton>
                <ToggleButton value="both" key="both">
                  Both
                </ToggleButton>
                <ToggleButton value="only-rejected" key="only-rejected">
                  Only Rejected
                </ToggleButton>
              </ToggleButtonGroup>
            </FormGroup> */}
          </Stack>
        </Collapse>
      </Card>
    </Box>
  )
}