import { getUserByUsername } from "../repositories/userRepo.js"

export const UserResolver = {
  Query: {
    user: async (
      _parent: any,
      args: {username: string}) => {
        return await getUserByUsername(args.username);
      }  
  }
}