import { knex } from "../db/index.js";
import { RegionsRow } from "../db/tables.js";


export async function getRegionByName(name: string): Promise<RegionsRow | undefined> {
  return await knex("regions").select().where({koa_url: name}).first();
}