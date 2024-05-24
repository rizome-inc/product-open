import { base } from "./base";
import { Prisma, PrismaClient } from "@prisma/client";
import { liveblocksClient } from "../../src/lib/liveblocks";
import { v4 as uuidgen } from "uuid";

/**
 * Cleanup requirement for https://github.com/rizome-inc/Product/pull/138
 */

const fn = async () => {
  const db = new PrismaClient();
  const flows = (
    await db.project.findMany({
      select: {
        id: true,
        roomId: true,
        organizationId: true,
      },
      where: {
        roomId: {
          not: null,
        },
      },
    })
  ).filter((f) => !f.roomId!.startsWith("org_"));
  for await (const flow of flows) {
    const currentRoomId = flow.roomId!;
    const newRoomId = `org_${flow.organizationId}:${uuidgen()}`;
    try {
      await liveblocksClient.updateRoomId({
        currentRoomId,
        newRoomId,
      });
      await db.project.update({
        where: {
          id: flow.id,
        },
        data: {
          roomId: newRoomId,
        },
      });
    } catch (e) {
      console.error(e);
    }
  }
  console.log(`Updated room ids of ${flows.length} rooms`);
};

base(fn);

export {};
