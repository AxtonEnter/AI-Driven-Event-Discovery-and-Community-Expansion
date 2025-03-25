import { ExpandMore } from "@mui/icons-material";
import { Box, Button, Card, Checkbox, Collapse, FormControlLabel, FormGroup, IconButton, Stack, TextField, ToggleButton, ToggleButtonGroup, Typography } from "@mui/material";
import { ChangeEvent, useEffect, useState } from "react";
import SearchBar from "./SearchBar";
import { useLocation, useNavigate } from "react-router";
import CloseIcon from "@mui/icons-material/Close";

interface EventSearchFilters {
  url?: string;
  title?: string;
  organization?: string;
  shortDesc?: string;
  details?: string;

  status: "only-pending" | "only-rejected" | "both"
}


export function SearchFilterOptions() {
  const navigate = useNavigate();
  const { search } = useLocation();


  const [startDateString, setStartDateString] = useState<string>();
  const [stopDateString, setStopDateString] = useState<string>();
  const [searchText, setSearchText] = useState<string>("");
  const [expanded, setExpanded] = useState(false);
  const [filters, setFilters] = useState<EventSearchFilters>({status: "both"});


  function handleRejectsSwitchChange(e: any) {
    setFilters({ ...filters, status: e.target.value });
    setUrlParam("rejects", e.target.value);
  }


  useEffect(() => {
    const searchParams = new URLSearchParams(search);
    const startDate = searchParams.get("start") ?? "";
    const stopDate = searchParams.get("stop") ?? "";
    const queryString = searchParams.get("q") ?? "";
    const status = (searchParams.get("rejects") as "only-pending" | "only-rejected" | "both") ?? "both";

    setStartDateString(startDate);
    setStopDateString(stopDate);
    setSearchText(queryString);
    setFilters({...filters, status})

    // query({
    //   variables: {
    //     startDate: parseDateForQuery(startDate, startOfDay),
    //     stopDate: parseDateForQuery(stopDate, endOfDay),
    //     searchText: queryString,
    //     filters: filters
    //   },
    // });
  }, [search]);

  const setUrlParam = (paramName: string, paramValue: string) => {
    const params = new URLSearchParams(search);
    params.set(paramName, paramValue);
    navigate("/admin/history?" + params, { replace: true });
  };

  const handleDateChange =
    (paramName: string, setter: (s: string) => void) =>
      (e: ChangeEvent<HTMLInputElement>) => {
        setter(e.target.value);
        setUrlParam(paramName, e.target.value);
      };

  const handleClear = () => {
    setSearchText("");
    navigate("/admin/history", { replace: true });
  };

  const showClearButton =
    startDateString || stopDateString || search.includes("q=");


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
        <Button onClick={() => setUrlParam("q", searchText)} variant="contained" color="primary">Search</Button>
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
                  <TextField variant="standard" label="Url" value={filters.url} onChange={(e) => setFilters({...filters, url: e.target.value})} fullWidth />
                  <TextField variant="standard" label="Title" value={filters.title} onChange={(e) => setFilters({...filters, title: e.target.value})} fullWidth />
                  <TextField variant="standard" label="Organization" value={filters.title} onChange={(e) => setFilters({...filters, organization: e.target.value})} fullWidth />
                </Stack>
                <Stack direction={"column"} flexWrap={"wrap"} ml={5}>
                  <Stack direction={"row"}>
                    <Box width={"15%"} mr={1}>
                    <Typography variant="body1">Short Description contains: </Typography>
                    </Box>
                    <TextField variant="standard" value={filters.shortDesc} onChange={(e) => setFilters({...filters, shortDesc: e.target.value})} fullWidth />
                  </Stack>
                  <Stack direction={"row"}>
                    <Box width={"15%"} mr={1}>
                      <Typography variant="body1">Details contains: </Typography>
                    </Box>
                    <TextField variant="standard" value={filters.details} onChange={(e) => setFilters({...filters, details: e.target.value})} fullWidth />
                  </Stack>
                </Stack>
              </Stack>
            </FormGroup>
            <FormGroup>
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
            </FormGroup>
          </Stack>
        </Collapse>
      </Card>
    </Box>
  )
}