import { createTheme } from "@mui/material";

export const theme = createTheme({
    palette: {
        primary: {
            main: "#5b308d",
            dark: "#F76902",
            contrastText: "#FFFFFF",
        },
        secondary: {
            main: "#bd2467",
            contrastText: "#FFFFFF",
        },
        warning: {
            main: '#FFAB00',
        },
        mode: localStorage.getItem("themeMode") == "dark" ? "dark" : "light"
    },
    typography: {
        fontFamily: 'Roboto',
        subtitle1: {
            fontWeight: "bold",
        },
        body1: {
            fontWeight: undefined,
        },
    },
})