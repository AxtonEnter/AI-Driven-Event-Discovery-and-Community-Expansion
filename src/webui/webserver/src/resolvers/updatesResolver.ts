import { getAllUpdates } from "../repositories/updatesRepo.js";

export const UpdatesResolver = {
  Update: {
    organization: async (parent: any, args: any, context: any) => {
      const { organizationRepo } = context;
      return await organizationRepo.getOrganizationByCmsId(parent.orgId);
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