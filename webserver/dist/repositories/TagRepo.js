import { knex } from "../db/index.js";
export async function getTagsByEvent(id) {
    return await knex("tags").select("tags.*", "events.id")
        .innerJoin("events_tags", "events_tags.tag", "=", "tags.name")
        .innerJoin("events", "events.id", "=", "events_tags.event")
        .where("events.id", "=", id);
}
//# sourceMappingURL=TagRepo.js.map