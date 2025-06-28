import { knex } from "../db/index.js";
export async function getEvents(searchText, filters) {
    return await knex("events")
        .select(`events.*`)
        .leftJoin(knex.raw(`"organizations" ON "organizations".id = "organization"`))
        .where((query) => {
        if (searchText) {
            query.where((subQuery) => {
                subQuery
                    .orWhere("url", "LIKE", `%${searchText}%`)
                    .orWhere("title", "LIKE", `%${searchText}%`)
                    .orWhere("html", "LIKE", `%${searchText}%`)
                    .orWhere("text", "LIKE", `%${searchText}%`)
                    .orWhere("name", "LIKE", `%${searchText}%`);
            });
        }
        if (filters) {
            Object.entries(filters).forEach(([key, value]) => {
                if (value) {
                    if (key === "status") {
                        query.where(key, value);
                    }
                    else if (key === "organization") {
                        query.where("name", "LIKE", `%${value}%`);
                    }
                    else {
                        query.where(key, "LIKE", `%${value}%`);
                    }
                }
            });
        }
    })
        .select();
}
export async function rejectEvent(id, username, reason) {
    await knex("events").update({ user: username, rejectedreason: reason, status: 2 }).where({ id });
}
export async function rejectEvents(ids, username, reason) {
    await knex("events").update({ user: username, rejectedreason: reason, status: 2 }).whereIn('id', ids);
}
export async function acceptEvent(id, username) {
    await knex("events").update({ user: username, status: 1 }).where({ id });
}
export async function acceptEvents(ids, username) {
    await knex("events").update({ user: username, status: 1 }).whereIn('id', ids);
}
export async function pendEvent(id) {
    await knex("events").update({ user: null, status: 0 }).where({ id });
}
export async function pendEvents(ids) {
    await knex("events").update({ user: null, status: 0 }).whereIn('id', ids);
}
//# sourceMappingURL=eventsRepo.js.map