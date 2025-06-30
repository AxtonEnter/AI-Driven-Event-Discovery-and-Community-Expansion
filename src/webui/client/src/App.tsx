import './App.css'
import { CssBaseline, ThemeProvider } from '@mui/material'
import { ApolloClient, ApolloProvider, InMemoryCache } from '@apollo/client';
import AppRoutes from './routes.js';
import { theme } from './Theme.js';

function App() {
  process.loadEnvFile(__dirname + "/../.env");

  const apolloClient = new ApolloClient({
    uri: process.env.REACT_APP_GRAPHQL_URL ?? "https://localhost:3000/graphql",
    credentials: "include",
    cache: new InMemoryCache(),
  });

  return (
    <ApolloProvider client={apolloClient}>
      <ThemeProvider theme={theme}>
        <CssBaseline/>
          <AppRoutes />
      </ThemeProvider>
    </ApolloProvider>
  )
}

export default App
