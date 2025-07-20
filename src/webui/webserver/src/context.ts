export enum Role {
  ADMIN = "admin",
  ENTRANT = "entrant",
  GUEST = "guest",
}

export interface CurrentUser {
  username: string;
  role: string;
}

export interface ApolloContext {
  user: CurrentUser | undefined;
  logout: () => void;
  ifAllowed: (
    allowedRoles: Role[],
    callback: (user: CurrentUser) => any
  ) => any;
  ifAuthenticated: (callback: (user: CurrentUser) => any) => any;
}


const context = async ({ req }: { req: any }) => ({
  user: req.user,
  logout: () => req.logout(),
});

export default context;