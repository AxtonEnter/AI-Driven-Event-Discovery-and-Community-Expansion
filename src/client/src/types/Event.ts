export enum ApprovalStatus {
    APPROVED,
    REJECTED,
}

export type EventItem = {
    url: string;
    shortDesc: string;
    details: string;
    imageUrls: string[];
    status: ApprovalStatus | null;
    startDateTime: Date;
    endDateTime: Date;
    
}