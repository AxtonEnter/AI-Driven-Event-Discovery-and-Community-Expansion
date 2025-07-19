import './App.css'
import { ThemeProvider } from '@mui/material'
import { ApolloClient, ApolloProvider, InMemoryCache } from '@apollo/client';
import AppRoutes from './routes.js';
import { theme } from './Theme.js';
import { CurrentUserProvider } from './common/CurrentUserProvider.js';

function App() {
  const apolloClient = new ApolloClient({
    uri: process.env.REACT_APP_GRAPHQL_URL ?? "https://awseb--awseb-qtfstuhvgp4v-1642944154.us-east-1.elb.amazonaws.com/graphql",
    //credentials: "include",
    cache: new InMemoryCache(),
  });

  return (
    <ApolloProvider client={apolloClient}>
      <ThemeProvider theme={theme}>
        <CurrentUserProvider>
          {/* <CssBaseline/> */}
          <AppRoutes />
        </CurrentUserProvider>
      </ThemeProvider>
    </ApolloProvider>
  )
}

export default App
