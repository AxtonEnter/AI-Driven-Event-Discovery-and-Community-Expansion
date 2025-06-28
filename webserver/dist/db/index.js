import knex from "knex";
import { config } from "./knexFile.js";
const connection = config[process.env.NODE_ENV || "development"];
const knexInstance = knex(connection);
export { knexInstance as knex };
//# sourceMappingURL=index.js.map