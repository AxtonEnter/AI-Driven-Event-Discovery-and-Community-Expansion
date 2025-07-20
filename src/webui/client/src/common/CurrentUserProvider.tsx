import { createContext, ReactElement, useContext } from "react";
import { gql, useQuery } from "@apollo/client";
//import { useLocation } from "react-router";
import RequestWrapper2 from "./RequestWrapper2";

//const loginUrl = process.env.REACT_APP_LOGIN_URL ?? "/";

export const GET_CURRENT_USER = gql`
  query GetCurrentUser {
    currentUser {
      username
      role
    }
  }
`;

export enum Role {
  ADMIN = "admin",
  ENTRANT = "entrant",
  GUEST = "guest",
}

export interface CurrentUser {
  username: string;
  role: Role;
}

const CurrentUserContext = createContext<CurrentUser | undefined>(undefined);


interface CurrentUserProviderProps {
  children: ReactElement;
}

export function CurrentUserProvider({ children }: CurrentUserProviderProps) {
  const result = useQuery(GET_CURRENT_USER);
  //const location = useLocation();

  // If the current user is null, redirect to SSO login
  // if (
  //   result &&
  //   !result.loading &&
  //   !result.data?.currentUser
  // ) {
  //   window.location.replace("/login");
  //   return null;
  // }

  return (
    <CurrentUserContext.Provider value={result.data?.currentUser ? result.data.currentUser : undefined}>
      <RequestWrapper2 result={result} render={() => children} />
    </CurrentUserContext.Provider>
  );
}

export function useCurrentUser() {
  const context = useContext(CurrentUserContext);

  if (context === undefined) {
    throw new Error("useCurrentUser must be used within a CurrentUserProvider");
  }

  return context;
}
