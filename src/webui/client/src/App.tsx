import './App.css'
import { CssBaseline, ThemeProvider } from '@mui/material'
import { ApolloClient, ApolloProvider, InMemoryCache } from '@apollo/client';
import AppRoutes from './routes.js';
import { theme } from './Theme.js';

function App() {
  const apolloClient = new ApolloClient({
    uri: process.env.REACT_APP_GRAPHQL_URL ?? "http://webui.us-east-2.elasticbeanstalk.com/graphql",
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
