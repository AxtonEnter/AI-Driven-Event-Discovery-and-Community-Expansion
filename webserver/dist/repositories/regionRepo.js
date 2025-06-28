import { knex } from "../db/index.js";
export async function getRegionByName(name) {
    return await knex("regions").select().where({ name: name }).first();
}
export async function getRegions() {
    return await knex("regions").select();
}
export async function insertRegion(name, koa_url) {
    await knex("regions").insert({ name, koa_url });
}
//# sourceMappingURL=regionRepo.js.map