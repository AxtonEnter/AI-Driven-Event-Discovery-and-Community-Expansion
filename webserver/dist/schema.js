import { DateTimeResolver, DateTimeTypeDefinition, JSONResolver, } from "graphql-scalars";
import { makeExecutableSchema } from "@graphql-tools/schema";
import { gql } from "graphql-tag";
import { HelloSchema } from "./schemas/helloSchema.js";
import { HelloResolver } from "./resolvers/helloResolver.js";
import { UserSchema } from "./schemas/userSchema.js";
import { OrganizationSchema } from "./schemas/organizationSchema.js";
import { UserResolver } from "./resolvers/userResolver.js";
import { OrganizationResolver } from "./resolvers/organizationResolver.js";
import { EventsResolver } from "./resolvers/eventsResolver.js";
import { EventsSchema } from "./schemas/eventsSchema.js";
import { RegionSchema } from "./schemas/regionSchema.js";
import { RegionResolver } from "./resolvers/regionResolver.js";
import { TagSchema } from "./schemas/tagSchema.js";
const resolveFunctions = {
    DateTime: DateTimeResolver,
    JSON: JSONResolver,
};
const jsonSchema = gql `
  scalar JSON
`;
export const schema = makeExecutableSchema({
    typeDefs: [
        jsonSchema,
        DateTimeTypeDefinition,
        HelloSchema,
        UserSchema,
        OrganizationSchema,
        EventsSchema,
        RegionSchema,
        TagSchema
    ],
    resolvers: [
        resolveFunctions,
        HelloResolver,
        UserResolver,
        OrganizationResolver,
        EventsResolver,
        RegionResolver
    ]
});
//# sourceMappingURL=schema.js.map