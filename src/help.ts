export function renderHelp(): string {
  return [
    "shopify-theme-clean",
    "",
    "Aggressively cleans Shopify theme JSON templates and settings.",
    "",
    "Usage:",
    "  shopify-theme-clean [options]",
    "",
    "Options:",
    "  --path <dir>              Theme directory to clean. Defaults to the current directory.",
    "  --dry-run                 Print planned changes without writing files.",
    "  --yes                    Apply changes without interactive confirmation.",
    "  --json                   Print the cleanup report as JSON.",
    "  --keep-template <name>    Preserve an extra template JSON file. Repeat as needed.",
    "  -h, --help               Show this help message.",
    "",
    "Behavior:",
    "  Deletes non-core JSON files under templates/**/*.json.",
    "  Keeps core storefront templates and templates/customers/*.json.",
    "  Skips sections/**/*.json and never touches .liquid files.",
    "  Rewrites config/settings_data.json from config/settings_schema.json defaults/blanks.",
    "",
    "Examples:",
    "  shopify-theme-clean --path ./theme --dry-run",
    "  shopify-theme-clean --path ./theme --yes",
    "  shopify-theme-clean --path ./theme --keep-template page.about"
  ].join("\n");
}
