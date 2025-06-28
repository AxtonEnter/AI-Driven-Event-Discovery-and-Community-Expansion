import { knex } from "../db/index.js";
import { TagsRow } from "../db/tables.js";

interface TagsRowWithEventID extends TagsRow {
  eventid: number
}


export async function getTagsByEvent(id: number): Promise<TagsRowWithEventID[]> {
  return await knex("tags").select("tags.*", "events.id")
    .innerJoin("events_tags", "events_tags.tag", "=", "tags.name")
    .innerJoin("events", "events.id", "=", "events_tags.event")
    .where("events.id", "=", id);
}