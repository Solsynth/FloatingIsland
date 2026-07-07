import { readdir } from "node:fs/promises";
import { join } from "node:path";

export default defineEventHandler(async () => {
  const emailsDir = join(process.cwd(), "app", "emails");
  const files = await readdir(emailsDir);

  const templates = files
    .filter((f) => f.endsWith(".vue"))
    .map((f) => ({
      name: f.replace(/\.vue$/, ""),
      displayName: f.replace(/\.vue$/, "").replace(/([A-Z])/g, " $1").trim(),
      filename: f,
    }));

  return { templates };
});
