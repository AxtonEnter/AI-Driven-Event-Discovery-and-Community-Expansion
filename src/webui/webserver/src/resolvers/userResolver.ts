import { ApolloContext } from "../context.js";
import { getUserByUsername } from "../repositories/userRepo.js"

export const UserResolver = {
  Query: {
    user: async (
      _parent: any,
      args: {username: string}) => {
        return await getUserByUsername(args.username);
      },
    currentUser: async (
      _parent: any,
      _args: any,
      { user }: ApolloContext) => {
        return user;
      },
  }
}