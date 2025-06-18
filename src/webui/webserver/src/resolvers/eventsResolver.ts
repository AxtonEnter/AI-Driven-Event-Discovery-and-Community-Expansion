import { EventsRow } from "../db/tables.js";
import { acceptEvent, acceptEvents, EventFilter, getEvents, pendEvent, pendEvents, rejectEvent, rejectEvents } from "../repositories/eventsRepo.js"
import { getOrganizationByID } from "../repositories/organizationRepo.js";
import { getTagsByEvent } from "../repositories/TagRepo.js";
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
    tags: async (
      parent: EventsRow,
      _args: any) => {
        return await getTagsByEvent(parent.id);
    },
  },

  Query: {
    events: async (
      _parent: any,
      args: {searchText?: string, filters?: EventFilter}) => {
        return {
          pending: await getEvents(args.searchText, {status: "0", ...args.filters}),
          accepted: await getEvents(args.searchText, {status: "1", ...args.filters}),
          rejected: await getEvents(args.searchText, {status: "2", ...args.filters}),
        };
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
    rejectEvents: async (
      _parent: any,
      args: {ids: number[], username: string, reason: string}) => {
        return rejectEvents(args.ids, args.username, args.reason);
    },
    acceptEvents: async (
      _parent: any,
      args: {ids: number[], username: string}) => {
        return acceptEvents(args.ids, args.username);
    },
    pendEvents: async (
      _parent: any,
      args: {ids: number[],}) => {
        return pendEvents(args.ids);
    },
  }
}