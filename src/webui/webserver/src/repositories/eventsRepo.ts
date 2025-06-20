import { knex } from "../db/index.js";
import { EventsRow } from "../db/tables.js";

export interface EventFilter {
  url?: string;
  title?: string;
  organization?: string;
  text?: string;
  status?: string;
}

export async function getEvents(searchText?: string, filters?: EventFilter): Promise<EventsRow[]> {
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
              query.where(key, value); // Exact match for status
            } else if (key === "organization") {
              query.where("name", "LIKE", `%${value}%`); // refer to "name" col of organizations join
            } else {
              query.where(key, "LIKE", `%${value}%`); // Partial match for other fields
            }
          }
        });
      }
    })
    .select();
}


export async function rejectEvent(id: number, username: string, reason: string): Promise<void> {
  await knex("events").update({user: username, rejectedreason: reason, status: 2}).where({id});
}

export async function rejectEvents(ids: number[], username: string, reason: string): Promise<void> {
  await knex("events").update({user: username, rejectedreason: reason, status: 2}).whereIn('id', ids);
}

export async function acceptEvent(id: number, username: string): Promise<void> {
  await knex("events").update({user: username, status: 1}).where({id});
}

export async function acceptEvents(ids: number[], username: string): Promise<void> {
  await knex("events").update({user: username, status: 1}).whereIn('id', ids);
}

export async function pendEvent(id: number): Promise<void> {
  await knex("events").update({user: null, status: 0}).where({id});
}

export async function pendEvents(ids: number[]): Promise<void> {
  await knex("events").update({user: null, status: 0}).whereIn('id', ids);
}