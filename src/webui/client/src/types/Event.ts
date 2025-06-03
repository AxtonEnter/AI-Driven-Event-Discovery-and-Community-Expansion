import { Organization } from "./Organization";
import { User } from "./User";

import { WarningKey } from "./Warning";

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
  hasWarnings?: boolean;
  warnings?: WarningKey[];
}