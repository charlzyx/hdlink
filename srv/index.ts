import { init } from "./db";
import { matcher } from "./route";

init();

Bun.serve({
  fetch(req) {
    const url = new URL(req.url);
    const match = matcher.find((x) => x.path == url.pathname);
    if (match) {
      return match.handler(req);
    }
    return new Response("404!");
  },
  port: 3003,
});
