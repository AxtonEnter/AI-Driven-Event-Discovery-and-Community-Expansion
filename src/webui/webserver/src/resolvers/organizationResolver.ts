import { getOrganizationByID } from "../repositories/organizationRepo.js";

export const OrganizationResolver = {
  Query: {
    organization: async (
      _parent: any,
      args: {id: number}) => {
        return await getOrganizationByID(args.id);
      }  
  }
}