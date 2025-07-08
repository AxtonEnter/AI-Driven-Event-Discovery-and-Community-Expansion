import { PublishCommand, SNSClient } from "@aws-sdk/client-sns";
import { OrganizationsRow } from "../db/tables.js";
import { getOrganizationByID, getOrganizations, insertCsvOrganizations, parseCSVForOrganizations } from "../repositories/organizationRepo.js";
import { getRegionByName } from "../repositories/regionRepo.js";

const sns = new SNSClient({ region: "us-east-1" }); // replace with your region

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
      args: { id: number }) => {
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
      args: { csv: string, mode?: string }) => {
      console.log("begin parse")
      const params = {
          TargetArn: process.env.SNS_TOPIC_ARN, // e.g. 'arn:aws:sns:us-east-1:123456789012:MyTopic'
          Message: JSON.stringify((await getOrganizations()).map((item) => item.id)),
        };

        try {
          const command = new PublishCommand(params);
          const data = await sns.send(command);
        } catch (error: any) {
          console.log(error);
        }
      // return await insertCsvOrganizations(parseCSVForOrganizations(args.csv)).then(async () => {
        
      // });
    }
  }
}