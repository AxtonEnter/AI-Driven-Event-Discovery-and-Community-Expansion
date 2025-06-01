import { WarningKey } from "./Warning";

export enum ApprovalStatus {
    APPROVED,
    REJECTED,
}

export type EventItem = {
    url: string;
    tabTitle: string;
    parsedText: string;
    organization: Organization;
    imageUrls: string[];
    status: ApprovalStatus | null;
    hasWarnings: boolean;
    warnings: WarningKey[];
}

export type Organization = {
    name: string
}