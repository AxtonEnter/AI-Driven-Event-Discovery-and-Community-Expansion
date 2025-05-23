import { DateTimeResolver, DateTimeTypeDefinition, JSONResolver, } from "graphql-scalars";
import { makeExecutableSchema } from "@graphql-tools/schema";
import { gql } from "graphql-tag";
import { HelloSchema } from "./schemas/helloSchema.js";
import { HelloResolver } from "./resolvers/helloResolver.js";
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
        HelloSchema
    ],
    resolvers: [
        resolveFunctions,
        HelloResolver
    ]
});
//# sourceMappingURL=schema.js.map