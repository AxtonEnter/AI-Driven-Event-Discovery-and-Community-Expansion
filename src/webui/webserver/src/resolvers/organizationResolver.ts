import { OrganizationsRow } from "../db/tables.js";
import { getOrganizationByID, getOrganizations, insertCsvOrganizations, parseCSVForOrganizations } from "../repositories/organizationRepo.js";
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
      },
    organizations: async (
      _parent: any,
      _args: any) => {
        return await getOrganizations();
      },
  },

  Mutation: {
    importOrganizations: async (
      _parent: any,
      args: {csv: string, mode?: string}) => {
        console.log("begin parse")
        return await insertCsvOrganizations(parseCSVForOrganizations(args.csv));
      }  
  }
}