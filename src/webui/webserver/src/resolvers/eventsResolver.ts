import { ApolloContext } from "../context.js";
import { EventsRow } from "../db/tables.js";
import { acceptEvent, acceptEvents, deleteAllEvents, EventFilter, getEvents, insertEventsFromCsv, pendEvent, pendEvents, rejectEvent, rejectEvents } from "../repositories/eventsRepo.js"
import { getOrganizationByCMSID, getOrganizationByID, getOrganizationsIDsNamesUrls, MinimalOrganizationsRow } from "../repositories/organizationRepo.js";
import { getTagsByEvent } from "../repositories/TagRepo.js";
import { getUserByUsername } from "../repositories/userRepo.js";

async function informWebScraper(orgs: MinimalOrganizationsRow[]) {
  var options = {
    body: JSON.stringify({orgs: orgs}),
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    method: "POST"
  }
  
  await fetch((process.env.WEBSCRAPER_INFORM_API_URL ?? ""), options).then(async function (res) {
    //Currently the compiler will not allow us to parse res.json() since it is typed as 'unknown'
    //To fix this, we will simply lie to the compiler and say it is 'any'
    console.log(res.json());
    return await res.json() as any;
  })
}


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
        return parent.organization && await getOrganizationByCMSID(parent.organization);
    },
    tags: async (
      parent: EventsRow,
      _args: any) => {
        return await getTagsByEvent(parent.id);
    },
    images: async (
      parent: EventsRow,
      _args: any) => {
        // var imagesStringFixed = parent.images ? parent.images.substring(1, parent.images.length - 1) : [];
        // return parent.images ? imagesStringFixed : [];
        return [];
    }
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
    beginScrape: async (
      _parent: any,
      _args: any) => {
      return await getOrganizationsIDsNamesUrls().then(async (result) => {
        return await informWebScraper(result)
      })
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
    deleteAllEvents: async (
      _parent: any,
      _args: any) => {
        return await deleteAllEvents();
    },
    importEvents: async (
      _parent: any,
      args: {csv: string},
      context: ApolloContext) => {
        return await insertEventsFromCsv(args.csv, context.user.username).then(() => true);
    },
  }
}