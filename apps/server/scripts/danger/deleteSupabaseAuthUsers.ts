import { base } from "../cleanup/base";
import { Command } from "commander";
import { createAdminClient } from "../../src/lib/supabase";

// Updating `base` to potentially run functions with arguments is a pain so we just use a global var
let INCLUDE;

const fn = async () => {
  const client = createAdminClient();
  // Supabase paginates to 50 users. If you have more than that just run this twice
  const {
    data: { users },
    error,
  } = await client.auth.admin.listUsers();
  if (error) {
    throw error;
  }
  let filteredUsers = users;
  if (INCLUDE) {
    filteredUsers = users.filter((u) => u.email!.includes(INCLUDE));
    console.log(`Found ${filteredUsers.length} users who match string "${INCLUDE}"`);
  }

  for await (const u of filteredUsers) {
    await client.auth.admin.deleteUser(u.id);
  }
  console.log(`Deleted ${filteredUsers.length} users`);
};

const program = new Command();

program.option("-i, --include <string>", "emails include this string");

program.parse(process.argv);

const options = program.opts();

if (options.include) {
  INCLUDE = options.include;
}

base(fn);

export {};
