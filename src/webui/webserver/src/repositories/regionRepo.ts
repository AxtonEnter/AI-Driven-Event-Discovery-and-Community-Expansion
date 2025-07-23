import { knex } from "../db/index.js";
import { RegionsRow } from "../db/tables.js";


export async function getRegionByName(name: string): Promise<RegionsRow | undefined> {
  return await knex("regions").select().where({name: name}).first();
}

export async function getRegions(): Promise<RegionsRow[]> {
  return await knex("regions").select();
}

export async function insertRegion(name: string, koa_url?: string): Promise<void> {
  await knex("regions").insert({name, koa_url})
}

export async function deleteRegion(id: number): Promise<boolean> {
  const result = await knex("regions").where({ id }).delete();
  return result > 0;
}

export async function deleteAllRegions(): Promise<boolean> {
  const result = await knex("regions").delete();
  return result > 0;
}