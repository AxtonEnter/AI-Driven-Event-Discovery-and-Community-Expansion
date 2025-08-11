import { getOrganizationByCMSID } from "../repositories/organizationRepo.js";
import { getAllUpdates } from "../repositories/updatesRepo.js";

export const UpdatesResolver = {
  Update: {
    organization: async (parent: any, args: any, context: any) => {
      return await getOrganizationByCMSID(parent.orgId);
    },
  },

  Query: {
    updates: async (
      _parent: any, 
      _args: any, 
      context: any) => {
      return await getAllUpdates();
    },
  },
};