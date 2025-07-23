import { ApolloContext } from "../context.js";
import { getUserByUsername, getUsers } from "../repositories/userRepo.js"

export const UserResolver = {
  Query: {
    user: async (
      _parent: any,
      args: { username: string }) => {
      return await getUserByUsername(args.username);
    },
    currentUser: async (
      _parent: any,
      _args: any,
      context: ApolloContext) => {
      console.log("currentUser: ", context.user);
      return context.user;
    },
    users: async (
      _parent: any,
      _args: any
    ) => {
      return await getUsers();
    }
  }
}