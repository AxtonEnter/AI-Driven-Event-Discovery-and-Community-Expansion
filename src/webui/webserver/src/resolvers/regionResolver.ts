import { deleteAllRegions, deleteRegion, getRegionByName, getRegions } from "../repositories/regionRepo.js";

export const RegionResolver = {
  Query: {
    region: async (
      _parent: any,
      args: {name: string}) => {
        return await getRegionByName(args.name);
      } ,
    regions: async (
      _parent: any,
      _args: any ) => {
        return await getRegions();
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