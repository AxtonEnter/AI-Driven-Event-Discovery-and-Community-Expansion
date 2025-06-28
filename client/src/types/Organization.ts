import { Region } from "./Region";

export type Organization = {
    id: number;
    email?: string;
    name?: string;
    koa_url: string;
    org_url: string;
    org_events_url?: string;
    region?: Region;
}