import { title } from "process";
import { knex } from "../db/index.js";
import { EventsRow } from "../db/tables.js";
import { parse } from "csv-parse/sync";

export interface EventFilter {
  url?: string;
  title?: string;
  organization?: string;
  text?: string;
  status?: string;
}

export async function getEvents(username: string, searchText?: string, filters?: EventFilter): Promise<EventsRow[]> {
  return await knex("events")
  .select(`events.*`)
    .leftJoin(knex.raw(`"organizations" ON "organizations".cms_id = "organization"`))
    .where({user: username})
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

export async function deleteAllEvents(): Promise<boolean> {
  const result = await knex("events").delete();
  return result > 0;
}

/**
 * Insert multiple events from a CSV string.
 * CSV headers: orgId,url,rawText,images
 * images is a stringified array.
 */
export async function insertEventsFromCsv(csv: string, username?: string): Promise<void> {
  // Parse CSV
  const records = parse(csv, {
    columns: true,
    skip_empty_lines: true,
    trim: true
  });

  // Map CSV fields to events table fields
  const eventsToInsert = records.map((row: any) => ({
    organization: Number(row.orgId),
    title: row.url, // Assuming title is the same as url for now
    url: row.url,
    text: row.rawText,
    html: "", // Assuming html is not provided in CSV for now
    images: JSON.stringify(row.images), // store as JSON array
    user: username || null, // Set user if provided, otherwise null
  }));

  // Insert, ignore rows that violate constraints
  await knex("events")
    .insert(eventsToInsert)
    .onConflict()
    .ignore();
}