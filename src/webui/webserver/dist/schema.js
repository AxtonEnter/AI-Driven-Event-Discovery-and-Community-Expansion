"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.schema = void 0;
const graphql_scalars_1 = require("graphql-scalars");
const schema_1 = require("@graphql-tools/schema");
const resolveFunctions = {
    DateTime: graphql_scalars_1.DateTimeResolver,
    JSON: graphql_scalars_1.JSONResolver,
};
exports.schema = (0, schema_1.makeExecutableSchema)({
    typeDefs: [],
    resolvers: [
        resolveFunctions,
    ]
});
//# sourceMappingURL=schema.js.map