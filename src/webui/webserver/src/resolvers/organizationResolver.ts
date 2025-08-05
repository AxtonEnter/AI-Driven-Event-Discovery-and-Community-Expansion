import { SendMessageCommand, SQSClient } from "@aws-sdk/client-sqs";
import { OrganizationsRow } from "../db/tables.js";
import { deleteAllOrganizations, deleteOrganization, getOrganizationByID, getOrganizations, getOrganizationsByUser, insertCsvOrganizations, parseCSVForOrganizations } from "../repositories/organizationRepo.js";
import { getRegionByName } from "../repositories/regionRepo.js";
import { ApolloContext } from "../context.js";

const sqsClient = new SQSClient({ region: "us-east-1" }); // replace with your region

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
      args: { csv: string, mode?: string },
      context: ApolloContext) => {
      console.log("begin parse");
      return await insertCsvOrganizations(parseCSVForOrganizations(args.csv), context.user.username).then(async () => {
        const command = new SendMessageCommand({
          QueueUrl: process.env.SQS_URL,
          MessageBody: JSON.stringify({
            orgs: (await getOrganizationsByUser(context.user.username)).map((item) => item.id),
            user: context.user.username
          }),
        });

        try {
          const response = await sqsClient.send(command);
          console.log("Message sent successfully:", response.MessageId);
        } catch (error) {
          console.error("Error sending message:", error);
        }
      });
    },
    deleteOrganization: async (
      _parent: any,
      args: { id: number }) => {
      return await deleteOrganization(args.id);
    },
    deleteAllOrganizations: async () => {
      return await deleteAllOrganizations();
    }
  }
}