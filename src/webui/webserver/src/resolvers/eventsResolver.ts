import { EventsRow } from "../db/tables.js";
import { acceptEvent, getEvents, pendEvent, rejectEvent } from "../repositories/eventsRepo.js"
import { getOrganizationByID } from "../repositories/organizationRepo.js";
import { getUserByUsername } from "../repositories/userRepo.js";

export const EventsResolver = {
  Event: {
    user: async (
      parent: EventsRow,
      _args: any) => {
        return parent.user && await getUserByUsername(parent.user);
    },
    organization: async (
      parent: EventsRow,
      _args: any) => {
        return parent.organization && await getOrganizationByID(parent.organization);
    },
  },

  Query: {
    events: async (
      _parent: any,
      _args: any) => {
        return await getEvents();
    },
  },

  Mutation: {
    rejectEvent: async (
      _parent: any,
      args: {id: number, username: string, reason: string}) => {
        return rejectEvent(args.id, args.username, args.reason);
    },
    acceptEvent: async (
      _parent: any,
      args: {id: number, username: string}) => {
        return acceptEvent(args.id, args.username);
    },
    pendEvent: async (
      _parent: any,
      args: {id: number}) => {
        return pendEvent(args.id);
    },
  }
}