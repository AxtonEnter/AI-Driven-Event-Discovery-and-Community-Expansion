import { getRegionByName } from "../repositories/regionRepo.js";
export const RegionResolver = {
    Query: {
        region: async (_parent, args) => {
            return await getRegionByName(args.name);
        }
    }
};
//# sourceMappingURL=regionResolver.js.map