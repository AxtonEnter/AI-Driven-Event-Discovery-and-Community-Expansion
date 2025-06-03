import { knex } from "../db/index.js";
import { OrganizationsRow } from "../db/tables.js";


export async function getOrganizationByID(id: number): Promise<OrganizationsRow | undefined> {
  return await knex("organizations").select().where({id}).first();
}