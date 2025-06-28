import { knex } from "../db/index.js";


export async function getUserByUsername(username: string) {
  return await knex("users").select().where({username});
}