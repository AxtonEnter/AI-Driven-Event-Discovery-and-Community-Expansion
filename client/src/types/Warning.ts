export type WarningKey =
    | "adultsOnly"
    | "fakeEvent"
    | "incorrectDate"
    | "incorrectDescription"
    | "eventCancelled"
    | "linkInaccessible"

export const Warning: Record<WarningKey, string> = {
    adultsOnly: "Adults Only",
    fakeEvent: "Fake Event",
    incorrectDate: "Incorrect Date",
    incorrectDescription: "Incorrect Description",
    eventCancelled: "Event Cancelled",
    linkInaccessible: "Link Inaccessible",
};