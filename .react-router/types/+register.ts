import "react-router";

declare module "react-router" {
  interface Register {
    params: Params;
  }
}

type Params = {
  "/": {};
  "/docs": {};
  "/docs/*": {
    "*": string;
  };
  "/api/search": {};
};