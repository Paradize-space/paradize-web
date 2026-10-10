import { initBotId } from "botid/client/core";

// Vercel BotID: an invisible check that the browser posting the waitlist
// form is a real one. It attaches its proof only to the routes listed
// here, and `checkBotId()` in the route verifies it. A route missing from
// this list fails that check.
initBotId({
  protect: [{ path: "/api/waitlist", method: "POST" }],
});
