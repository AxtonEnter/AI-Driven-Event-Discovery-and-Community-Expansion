
export interface EventsRow {
  id: number;
  url: string;
  title: string;
  html: string;
  text?: string;
  addedat: Date;
  status: number;
  statuschangedat?: Date;
  rejectedreason?: string;
  user?: string;
  organization?: number;
  images: string;
}

export interface EventsTagsRow {
  event: number;
  tag: string;
}

export interface OrganizationsRow {
  id: number;
  email?: string;
  name?: string;
  koa_url: string;
  org_url: string;
  org_events_url?: string;
  region?: string;
  cms_id?: number;
}

export interface RegionsRow {
  koa_url?: string;
  name: string;
}

export interface TagsRow {
  name: string;
  desc?: string;
  color: string;
}

export interface URLHashesRow {
  url: string;
  hash: string;
}

export interface UsersRow {
  username: string;
  role?: string;
  password: string;
}