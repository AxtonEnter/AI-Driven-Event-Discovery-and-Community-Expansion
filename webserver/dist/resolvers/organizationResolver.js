import { PublishCommand, SNSClient } from "@aws-sdk/client-sns";
import { getOrganizationByID, getOrganizations } from "../repositories/organizationRepo.js";
import { getRegionByName } from "../repositories/regionRepo.js";
const sns = new SNSClient({ region: "us-east-1" });
export const OrganizationResolver = {
    Organization: {
        region: async (parent, _args) => {
            return parent.region && await getRegionByName(parent.region);
        }
    },
    Query: {
        organization: async (_parent, args) => {
            return await getOrganizationByID(args.id);
        },
        organizations: async (_parent, _args) => {
            return await getOrganizations();
        },
    },
    Mutation: {
        importOrganizations: async (_parent, args) => {
            console.log("begin parse");
            const params = {
                TopicArn: process.env.SNS_TOPIC_ARN,
                Message: JSON.stringify((await getOrganizations()).map((item) => item.id)),
            };
            try {
                const command = new PublishCommand(params);
                const data = await sns.send(command);
            }
            catch (error) {
                console.log(error);
            }
        }
    }
};
//# sourceMappingURL=organizationResolver.js.map