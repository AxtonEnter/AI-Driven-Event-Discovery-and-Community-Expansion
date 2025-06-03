import { OrganizationsRow } from "../db/tables.js";
import { getOrganizationByID } from "../repositories/organizationRepo.js";
import { getRegionByName } from "../repositories/regionRepo.js";

export const OrganizationResolver = {
  Organization: {
    region: async (
      parent: OrganizationsRow,
      _args: any) => {
        return parent.region && await getRegionByName(parent.region);
      }  
  },

  Query: {
    organization: async (
      _parent: any,
      args: {id: number}) => {
        return await getOrganizationByID(args.id);
      }  
  }
}