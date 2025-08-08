import { knex } from "../db/index.js";

export async function getAllUpdates() {
  return await knex("updates").select("*").limit(100).orderBy('postedAt', 'desc');
}