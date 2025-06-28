import { knex } from "../db/index.js";
export async function getUserByUsername(username) {
    return await knex("users").select().where({ username });
}
//# sourceMappingURL=userRepo.js.map