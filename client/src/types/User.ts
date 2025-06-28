export type User = {
  username: string;
  role?: string; //Never use this attribute to determine site access. Use server-side checks.
}