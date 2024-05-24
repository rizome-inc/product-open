# [Xylem](https://en.wikipedia.org/wiki/Xylem)

API contract package. Uses [ts-rest](https://ts-rest.com/).

## Overview

Xylem works like a local NPM package. It's included in the `package.json` of other packages / apps as

```json
"xylem": "workspace:*"
```

rather than a traditional NPM definition. `workspace` tells pnpm that the package is local, and `*` means "take the most recent version".

Node plays nicer with package and file imports when it can look at a single file for resolution rather than dive into a directory. For that reason, we define an `index.ts` file in every subdirectory of Xylem to centralize exports. 

This means that when our code is built, the compiled JavaScript will only recognize imports coming from `"xylem"`. This has two ramifications:

1. You may encounter a naming dispute, in which case you'll need to alias your exports or rename them
2. The TypeScript compiler may let you import files nested within Xylem's subdirectories, but this does not mean the code will actually run.

## Things to watch out for

### Always build after modifying!

You should run `pnpm build` in this directory after making any modifications to Xylem, and then install the node_modules of the apps to load in this version. The compiler will let you think you're getting away with a lot of stuff when it comes to linting and compiling, but then your code may not run. 

### File uploads

File uploads should happen in a multipart form. Contracts with file uploads need the following:

* `contentType: "multipart/form-data"`
* Body nesting is one level deep. Deeper nested structures should be stringified and then parsed in the relevant schema
* File array format example: `files: z.array(z.any()).max(3).optional()`. 
  * Can't use `z.instanceOf(File)` as type because when compiled to JS, the server will not recognize the Web File API type. 
  * ts-rest moves `files` out of `req.body`, so define it in the ts-rest contract body directly rather than in an exported schema to reduce confusion

Read [ts-rest docs](https://ts-rest.com/docs/core/form-data#server---express) for instruction on what ts-rest does to multipart uploads. `apps/server/main.ts` contains examples of temporary upload middleware.


## Misc

todo: consider looking into named exports so that not everything is imported from "xylem" in the apps.

ts-rest features of interest:

* [Contract type Intellisense](https://ts-rest.com/docs/core/#intellisense)
* [Base header](https://ts-rest.com/docs/core/#base-header) -- can use to specify what we expect Supabase headers to be
* [Request validation error handling](https://ts-rest.com/docs/express/#request-validation-error-handling)