default: help

# From https://dwmkerr.com/makefile-help-command/
.PHONY: help
help: # Show help for each of the Makefile recipes.
	@grep -E '^[a-zA-Z0-9 -]+:.*#'  Makefile | sort | while read -r l; do printf "\033[1;32m$$(echo $$l | cut -f 1 -d':')\033[00m:$$(echo $$l | cut -f 2- -d'#')\n"; done

### Common commands ###

.PHONY: build-prod
build-prod: # Run all build:prod commands in parallel
	pnpm run --parallel -r build:prod


### Server ###

.PHONY: start-supabase
start-supabase: # Start Supabase containers and open auth and database views
	cd apps/server && npx supabase start ;\
	open http://localhost:54323/project/default/auth/users ;\
	open http://localhost:54323/project/default/sql/1

.PHONY: stop-supabase
stop-supabase: # Stop Supabase containers
	cd apps/server && npx supabase stop


### Web ###


### Packages ###



### Project initialization ###

.PHONY: init
init: # Initialize the monorepo for the first time
	echo "Installing root node_modules...\n"
	pnpm install && echo "Installing app and package node_modules...\n" ;\
	pnpm --filter web install && echo "Initializing web .env.local file" && pnpm --filter web create:env;\
	pnpm --filter server install && echo "Initializing server .env file" && pnpm --filter server create:env ;\
	echo "Logging into Supabase...\n" ;\
	cd apps/server && npx supabase login && echo "Starting Supabase containers...\n" && npx supabase start ;\
	echo "Running databse migrations...\n" ;\
	pnpm --filter server prisma:migrate-reset ;\
	echo "Done! Check package.json for dev and prod run commands"