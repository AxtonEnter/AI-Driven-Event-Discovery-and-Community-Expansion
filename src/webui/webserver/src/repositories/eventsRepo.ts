import { knex } from "../db/index.js";
import { EventsRow } from "../db/tables.js";

export async function getEvents(): Promise<EventsRow[]> {
  return await knex("events").select();
}

export async function rejectEvent(id: number, username: string, reason: string): Promise<void> {
  await knex("events").update({user: username, rejectedreason: reason, status: 2}).where({id});
}

export async function acceptEvent(id: number, username: string): Promise<void> {
  await knex("events").update({user: username, status: 1}).where({id});
}

export async function pendEvent(id: number): Promise<void> {
  await knex("events").update({user: null, status: 0}).where({id});
}