import path from "path";
import process from "process";
const __dirname = path.resolve(path.dirname(''));
if (!process.env.NODE_ENV)
    process.loadEnvFile(__dirname + "/.env");
export const config = {
    development: {
        client: "pg",
        connection: {
            connectionString: process.env.DATABASE_URL,
            ssl: {
                rejectUnauthorized: false
            }
        },
        pool: {
            min: 2,
            max: 10,
        },
        migrations: {
            tableName: "knex_migrations",
            directory: "migrations",
        },
        asyncStackTraces: true,
    },
    production: {
        client: "pg",
        connection: {
            connectionString: process.env.DATABASE_URL,
            ssl: {
                rejectUnauthorized: false,
            },
        },
        pool: {
            min: 2,
            max: 10,
        },
        migrations: {
            tableName: "knex_migrations",
            directory: "migrations",
        },
    },
};
//# sourceMappingURL=knexFile.js.map