import path from "node:path";
import { formatJson } from "./files.js";
import { FileRewrite } from "./types.js";

const HELLO_WORLD_SECTION = `<section class="std-purge-hello-world">
  <h1>Hello world</h1>
</section>

{% schema %}
{
  "name": "Hello world",
  "settings": [],
  "presets": [
    {
      "name": "Hello world"
    }
  ]
}
{% endschema %}
`;

const INDEX_TEMPLATE = {
  sections: {
    hello_world: {
      type: "hello-world",
      settings: {}
    }
  },
  order: ["hello_world"]
};

export function buildDefaultThemeRewrites(themePath: string, existingFiles: string[]): FileRewrite[] {
  const rewrites = [buildFileRewrite(themePath, "templates/index.json", formatJson(INDEX_TEMPLATE))];

  if (!hasFile(themePath, existingFiles, "sections/hello-world.liquid")) {
    rewrites.unshift(buildFileRewrite(themePath, "sections/hello-world.liquid", HELLO_WORLD_SECTION));
  }

  return rewrites;
}

function buildFileRewrite(themePath: string, relativePath: string, content: string): FileRewrite {
  return {
    absolutePath: path.join(themePath, relativePath),
    relativePath,
    content
  };
}

function hasFile(themePath: string, existingFiles: string[], relativePath: string): boolean {
  return existingFiles.includes(path.join(themePath, relativePath));
}
