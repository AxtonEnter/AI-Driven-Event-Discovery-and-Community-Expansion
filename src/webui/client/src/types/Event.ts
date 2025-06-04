import { Organization } from "./Organization";
import { Tag } from "./Tag";
import { User } from "./User";

export enum ApprovalStatus {
    APPROVED,
    REJECTED,
}

export type EventItem = {
  id: number;
  url: string;
  title: string;
  html: string;
  text?: string;
  addedat: Date;
  statuschangedat?: Date;
  rejectedreason?: string;
  user?: User;
  organization?: Organization;
  tags: Tag[]
}