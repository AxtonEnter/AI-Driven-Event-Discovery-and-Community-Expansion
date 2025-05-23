
export const HelloResolver = {
  Query: {
    hello: async (
      _parent: any,
      _args: any) =>
      {return "Hello World!"}
  }
}