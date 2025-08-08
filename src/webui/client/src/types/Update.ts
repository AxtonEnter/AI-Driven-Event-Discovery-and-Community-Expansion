export type Update = {
  orgId: string;
  organization?: {
    id: number;
    name: string;
  };
  value: string;
  postedAt: Date;
};