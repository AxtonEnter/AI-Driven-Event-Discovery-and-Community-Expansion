import { getUserByUsername } from "../repositories/userRepo.js";
export const UserResolver = {
    Query: {
        user: async (_parent, args) => {
            return await getUserByUsername(args.username);
        }
    }
};
//# sourceMappingURL=userResolver.js.map