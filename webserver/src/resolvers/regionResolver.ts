import { getRegionByName } from "../repositories/regionRepo.js";

export const RegionResolver = {
  Query: {
    region: async (
      _parent: any,
      args: {name: string}) => {
        return await getRegionByName(args.name);
      }  
  }
}