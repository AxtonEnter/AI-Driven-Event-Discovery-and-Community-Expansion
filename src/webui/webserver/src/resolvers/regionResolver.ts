import { deleteAllRegions, deleteRegion, getRegionByName } from "../repositories/regionRepo.js";

export const RegionResolver = {
  Query: {
    region: async (
      _parent: any,
      args: {name: string}) => {
        return await getRegionByName(args.name);
      }  
  },
  Mutation: {
    deleteRegion: async (
      _parent: any,
      args: {id: number}) => {
        return await deleteRegion(args.id);
      },
    deleteAllRegions: async () => {
      return await deleteAllRegions();
    }
  }
}