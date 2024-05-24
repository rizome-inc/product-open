import { Liveblocks } from "@liveblocks/node";
import { LIVEBLOCKS_SECRET_KEY } from "./secrets";

export const liveblocksClient = new Liveblocks({
  secret: LIVEBLOCKS_SECRET_KEY,
});
