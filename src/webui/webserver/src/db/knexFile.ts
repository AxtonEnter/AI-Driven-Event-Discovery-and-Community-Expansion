import type { Knex } from "knex";
import path from "path";
import process from "process";

const __dirname = path.resolve(path.dirname(''))

process.loadEnvFile(__dirname + "/.env");

// Update with your config settings.

export const config: { [key: string]: Knex.Config } = {
    development: {
    client: "pg",
    connection: {
      connectionString: process.env.DATABASE_URL,
      ssl: false,
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
