import { acceptEvent, acceptEvents, getEvents, pendEvent, pendEvents, rejectEvent, rejectEvents } from "../repositories/eventsRepo.js";
import { getOrganizationByID, getOrganizationsIDsNamesUrls } from "../repositories/organizationRepo.js";
import { getTagsByEvent } from "../repositories/TagRepo.js";
import { getUserByUsername } from "../repositories/userRepo.js";
async function informWebScraper(orgs) {
    var options = {
        body: JSON.stringify({ orgs: orgs }),
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        method: "POST"
    };
    await fetch((process.env.WEBSCRAPER_INFORM_API_URL ?? ""), options).then(async function (res) {
        console.log(res.json());
        return await res.json();
    });
}
export const EventsResolver = {
    Event: {
        user: async (parent, _args) => {
            return parent.user && await getUserByUsername(parent.user);
        },
        organization: async (parent, _args) => {
            return parent.organization && await getOrganizationByID(parent.organization);
        },
        tags: async (parent, _args) => {
            return await getTagsByEvent(parent.id);
        },
    },
    Query: {
        events: async (_parent, args) => {
            return {
                pending: await getEvents(args.searchText, { status: "0", ...args.filters }),
                accepted: await getEvents(args.searchText, { status: "1", ...args.filters }),
                rejected: await getEvents(args.searchText, { status: "2", ...args.filters }),
            };
        },
    },
    Mutation: {
        rejectEvent: async (_parent, args) => {
            return rejectEvent(args.id, args.username, args.reason);
        },
        acceptEvent: async (_parent, args) => {
            return acceptEvent(args.id, args.username);
        },
        pendEvent: async (_parent, args) => {
            return pendEvent(args.id);
        },
        beginScrape: async (_parent, _args) => {
            return await getOrganizationsIDsNamesUrls().then(async (result) => {
                return await informWebScraper(result);
            });
        },
        rejectEvents: async (_parent, args) => {
            return rejectEvents(args.ids, args.username, args.reason);
        },
        acceptEvents: async (_parent, args) => {
            return acceptEvents(args.ids, args.username);
        },
        pendEvents: async (_parent, args) => {
            return pendEvents(args.ids);
        },
    }
};
//# sourceMappingURL=eventsResolver.js.map