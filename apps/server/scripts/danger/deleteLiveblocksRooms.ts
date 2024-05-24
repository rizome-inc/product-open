import { liveblocksClient } from "../../src/lib/liveblocks";
import { base } from "../cleanup/base";

const fn = async () => {
  let { data: rooms } = await liveblocksClient.getRooms();
  while (rooms.length > 0) {
    for await (const r of rooms) {
      await liveblocksClient.deleteRoom(r.id);
    }
    console.log(`deleted ${rooms.length} rooms`);
    rooms = (await liveblocksClient.getRooms()).data;
  }
};

base(fn);

export {};
