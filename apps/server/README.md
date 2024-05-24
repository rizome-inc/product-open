# Server

### Things to keep in mind
* In development mode, React renders components twice to make sure operations are pure. That can mean API calls are made twice; if that happens, make sure that the server operations are idempotent.

dev notes

Supabase local testing: https://github.com/orgs/supabase/discussions/1044 

The way Supabase auth works is:
1. User requests magic link on frontend
2. Frontend sends request to Supabase to generate magic link, which starts with our server URL
3. Supabase sends magic link email via Sendgrid
4. User clicks on link which goes to frontend, authenticates on server, and then redirects to /projects page


----

Data structure thoughts
- the perpetually nested structure of our JSON sucks to make changes to
- we're going to move to a DAG model in Q1
- can structure displayed on template / UI / schemas be different from how things are actually stored in db?
 - e.g. generate nesting and lineage based on identifiers / graph traversal, but store fields / hierarchies as flat arrays
 - I'm going to have to flatten all the fields anyway to perform cycle checks
- levels:
1. project
2. category
3. tab
4. field

- project is the origin node
- 2-4 share the following attributes:
 - id
 - name
 - index (used for relative ordering)

- projectId isn't necessary for 2 because categories are saved local to that project
- tab has categoryId
- field has tabId

- Can store whole thing as a single JsonObject. Would be on ProjectContent like:
{
  ...,
  // assuming we don't change db name now, though maybe should rename as `graph` since I'll need to port all data anyway
  formFields: {
    categories: [
      {
        id,
        name,
        index
      }, ...
    ],
    tabs: [
      {
        id,
        categoryId,
        name,
        index
      }, ...
    ],
    fields: [
      {
        id,
        tabId,
        name,
        index,
        type,
        value,
        etc
      }, ...
    ],
  }
}

decision logic
- decision logic will add / remove field nodes, which should be fine
  - I will need a special shape for DL nodes at least temporarily. Can migrate later if needed
  - Or could just save special shape for DL as a whole like I do today, and add the tabId, index keys

subtypes
- select type is way simpler than it used to be. I think it's easiest to remove subtypes and instead have selects be something like:
{
  type: "select",
  options: ["a", "b", "c"],
  value,
  index,
  etc
}

Implementation options:
- Postgres nodes and edges tables with recursive queries (Prisma raw): https://www.dylanpaulus.com/posts/postgres-is-a-graph-database/
- Json blobs with in-memory processing
- Graph DB

- I don't anticipate the graphs getting huge (e.g. more than 100 nodes / record), so take the options above with a grain of salt
 - That is to say, I think we should store a JSON blob and then load/parse our graph levels
 - If server load becomes a problem, we can juice the memory up a bit, and later refactor the data model

*Despite this*
Try to get it working before building this out