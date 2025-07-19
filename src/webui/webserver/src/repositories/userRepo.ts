import { knex } from "../db/index.js";


export async function getUserByUsername(username: string) {
  return await knex("users").select().where({username});
}

export async function createUser(username: string, role: string = "guest") {
  const [user] = await knex("users").insert({username, role}).returning("*");
  return user;
}