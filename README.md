# Rizome

This is the Rizome monorepo.

The repo is a [pnpm workspace]([https://classic.yarnpkg.com/en/docs/workspaces#search](https://pnpm.io/workspaces)). There are two apps, `web` and `server`, along with a shared API contract library, `xylem`.

It uses [Nx](https://nx.dev/getting-started/intro) to cache pnpm actions (still experimental), define dependency build pipelines (still experimental), and enable Railway monorepo deployment configuration (working).

## Getting started

### Setup

Make sure that you have [Docker](https://www.docker.com/get-started) installed.

After cloning this repo for the first time, run `make init`. This command does the following:

1. Installs monorepo root node_modules
2. Installs `/apps` subdirectory node_modules
3. Prompts you to log into Supabase
4. Downloads the Supabase images and starts the local containers
5. Generates Prisma types, runs migrations and seeds database

After your project is set up, go to Railway and add our Sendgrid API key to `/apps/server/.env` 

#### Troubleshooting

* If you encounter an error like: "error during connect: this error may indicate that the docker daemon is not running", be sure to launch the docker dekstop app and try again.


### Running scripts and commands

The root-level `package.json` defines pnpm scripts to install, build, start (dev) and start (prod) the apps. You can also cd into any of the apps and run pnpm scripts and commands there too. Scripts follow the pattern of `<action>:<app>`. 

Actions:

* `install`
* `build`
* `start`
* `dev`

Apps

* `server`
* `web`

The `Makefile` defines some convenience functions as well. Run `make help` to see what's available.

For example, if you want to run the web and server apps with hot reloading, you would open two terminal tabs and run the following:

Tab 1: `make start-supabase ; pnpm dev:server`

Tab 2: `pnpm dev:web`

## Cleanup scripts

Simple data cleanup in QA and production can be performed with the [Supabase SQL editor](https://supabase.com/dashboard/project/xglpdqovssokhjyequxu/editor). 

When making more complex changes--for example something that affects every user--we want accuracy guarantees such as idempotency or time-bound execution, or just a historical record of the changes made. 

In the latter case, we write cleanup scripts that are run directly in the QA and prod environments via Railway. The scripts are located in `apps/server/scripts/cleanup`.

*Warning*: The Railway CLI allows you to run local code using the secrets of a deployed environment. If you want feedback from another engineer on your cleanup script, be sure to make a PR before using the `railway run` command.

### Getting started

1. `brew install railway`
2. `cd apps/server`
3. `railway login --browserless`
4. `railway link` and make prompt selections to link the `server` service in `qa`

### Running scripts

From the `apps/server` directory,

1. Test that your script works locally with `pnpm ts-node scripts/cleanup/<script>.ts`
2. `railway environment` and pick where you want to run the script. It's good practice to test in QA first unless you're targeting specific production data
3. `railway run pnpm ts-node scripts/cleanup/<script>.ts`

For more information, see the [Railway CLI docs](https://docs.railway.app/develop/cli).

If running in prod, test locally against prod data (see the database section below)

## Continuous Integration

### Committing code

You'll want to commit code from the repository root; otherwise, git may not pick up changed files in different apps/packages.

We use a [Husky](https://typicode.github.io/husky/) pre-commit step which does the following:

1. Install shared node_modules and those for individual apps/packages
2. Run each app/project's `typecheck` command
3. Run `server`'s `lint` command
4. Run `server`'s `format` command
5. Run `git add -u` to pick up modified files affected by `format`. _Warning: this effectively means all updated files will always be committed. If you don't want this behavior, figure out a better way to commit files impacted by `prettier --write`._

### Merging in GitHub

When a commit is merged into the `qa` branch, Railway will automatically deploy it to our QA environment (the frontend can be accessed at https://web-rizome-qa.up.railway.app/login).

Similarly, commits merged to `main` are deployed in the Prod environment. 

Each environment has its own database hosted with [Supabase](https://supabase.com/dashboard/project/tvrwyqwuohyjxqocjsuz), and file storage attached to the Railway server instance. In the future, we'll migrate file storage and authentication to Supabase, and each environment will continue to have its own versions of those features. 

## Contributing

All PRs should be made to the `qa` branch and tested in our QA environment. Once manual testing is complete, you can make a PR from the `qa` branch to `main` and merge it in. 

`qa` --> `main`: use a rebase commit

Anything else to `qa` or `main`: use a squash commit

Using a rebase commit when merging from `qa` to `main` ensures that `qa` will stay in line with `main`, which makes it easier to update and maintain.

We don't have any strict PR or branch rules so we can be flexible in emergencies.


## Database

We use a PostgreSQL database hosted by Supabase in QA and prod. 

### Seeding the QA database
If the data in QA gets corrupted somehow, you can reset it using the same seed script that is run for local development. _Note: you must have configured the Railway CLI locally first--see [Cleanup scripts](#cleanup-scripts)_

1. Go into the Supabase `qa` SQL editor panel and drop the database. You'll have to research how to do this; instructions are not provided here because you have to be really careful you're not dropping production, so I'm forcing you to think about it.
2. `cd apps/server`
3. `railway environment` and select `qa`.
4. `railway run pnpm ts-node prisma/seed.ts`

### Dump production db to local

1. If you haven't already, download pgAdmin and connect your local db instance
2. In `apps/server` run `pnpm supabase db dump -f supabase/schema.sql` and `pnpm supabase db dump -f supabase/seed.sql --data-only`
3. Connect to the local db in pgAdmin and open a query panel
4. Copy the contents of `schema.sql` into the panel and run it
5. Delete the panel contents, copy the contents of `seed.sql` into the panel, and run it
6. Using pgAdmin or the Supabase local table editor, verify production data is present
7. Delete both SQL files from your computer (should be ignored via git, but better safe than sorry)

## Liveblocks webhooks

[Liveblocks](https://liveblocks.io/dashboard/7IhtWZsGbxSwdYDJwM45g) stores our flow chart and comment data in its own infrastructure. [Every 5 seconds](https://liveblocks.io/docs/platform/webhooks), Liveblocks checks for project updates and calls a webhook in our server with those updates. The webhook in turn updates the corresponding `projects` record in our database.

If you want to test the webhook locally you'll need to install [ngrok](https://ngrok.com/) or another SSL tunnel utility and update the webhook target URL in the Liveblocks dashboard. _Make sure you are updating our development project, not prod._

## Troubleshooting

### Changes to Liveblocks user metadata are not reflected in QA
The only way we've figured out how to fix this is to delete all of the rooms with the script `scripts/danger/deleteLiveblocksRooms.ts`. There may be a better way. It should go without saying that this should not be used in prod

### I made too many Supabase test accounts
If you're ok just dumping the database and starting over, running `pnpm prisma migrate reset` will take care of this for you. Otherwise, read on.

`scripts/danger/deleteSupabaseAuthUsers.ts` will delete up to 50 Supabase auth accounts per run. The script takes an optional `-i, --include` argument if you only want to delete users whose emails include a certain string. For example, the following execution will delete up to 50 Supabase auth users whose emails contain the string `duncan`: `pnpm ts-node scripts/danger/deleteSupabaseAuthUsers.ts -i duncan`

Do not use in prod unless you're super careful!

## Resources

Packages: see https://blog.nrwl.io/setup-a-monorepo-with-pnpm-workspaces-and-speed-it-up-with-nx-bc5d97258a7e for further setup
