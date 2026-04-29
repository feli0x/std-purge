# std-purge

`std-purge` is a tiny CLI for clearing up STDs: Shopify Template Debris.

It aggressively cleans generated Shopify theme JSON templates and sets up a valid starter page, because untreated STDs can spread across branches, reviews, and eventually your dignity.

## What It Does

- Deletes non-core JSON templates under `templates/**/*.json`
- Keeps Shopify's core storefront templates
- Keeps `templates/customers/*.json`
- Leaves existing `.liquid` templates and custom sections alone
- Rewrites `templates/index.json` as a valid starter page using the built-in `custom-liquid` section
- Leaves `config/settings_schema.json` and `config/settings_data.json` alone
- Lets you preserve specific templates when the test comes back negative

## What It Does Not Do

- Diagnose your real problems
- Delete `.liquid` files
- Clean your Shopify admin
- Make your theme good, only less contagious

## Usage

Get tested first:

```sh
npx std-purge --path ./theme --dry-run
```

Start treatment:

```sh
npx std-purge --path ./theme --write
```

Keep one template in quarantine:

```sh
npx std-purge --path ./theme --keep page.about --write
```

Print lab results for scripts:

```sh
npx std-purge --path ./theme --dry-run --json
```

## Options

```text
-p, --path <dir>      Theme directory to clean. Defaults to the current directory.
-d, --dry-run         Print planned changes without writing files.
-w, --write           Apply changes without interactive confirmation.
-j, --json            Print the cleanup report as JSON.
-k, --keep <name>     Preserve an extra template JSON file. Repeat as needed.
-h, --help            Show help.
```

## Recommended Ritual

1. Commit or stash your work.
2. Run `npx std-purge --path ./theme --dry-run`.
3. Read the report like a responsible adult who definitely knows where those templates came from.
4. Run `npx std-purge --path ./theme --write`.
5. Tell your theme it is clean now, but should still make better choices.

## Why

Shopify theme development can leave behind template experiments, demo alternates, and settings data that made sense three branches ago. `std-purge` treats those STDs early, before `product.alt.final-final-please-use-this-one.json` becomes a permanent part of the family medical history.
