/**
 * Handles writing generated blog posts and no-activity placeholders
 * as .mdx files with YAML frontmatter.
 */

import fs from "fs";
import config from "./config.js";

/**
 * Writes the generated blog post as an .mdx file with frontmatter.
 *
 * @param {{filename: string, title: string, description: string, content: string}} blog
 * @returns {string} Path to the saved file
 */
export function saveBlogPost(blog) {
  const today = new Date().toISOString().split("T")[0];

  // Titles/descriptions are quoted to prevent YAML syntax errors from colons
  const mdxContent = `---
title: "${blog.title.replace(/"/g, '\\"')}"
description: "${blog.description.replace(/"/g, '\\"')}"
date: ${today}
---

${blog.content}
`;

  fs.mkdirSync(config.OUTPUT_DIR, { recursive: true });

  const filePath = `${config.OUTPUT_DIR}/${blog.filename}.mdx`;
  fs.writeFileSync(filePath, mdxContent, "utf-8");

  console.log(`💾 Blog saved to: ${filePath}`);
  return filePath;
}

/**
 * Creates a placeholder blog post when no commits were found.
 *
 * @returns {string} Path to the saved file
 */
export function saveNoActivityPost() {
  const today = new Date().toISOString().split("T")[0];

  const mdxContent = `---
title: "Rest Day"
description: "No development activity detected today."
date: ${today}
---

No commits were detected across any of my repositories in the last 24 hours.

Sometimes the best code is the code you don't write. Whether it was a day of planning, learning, reviewing, or simply recharging - not every day needs to produce a commit.

Back at it tomorrow.
`;

  fs.mkdirSync(config.OUTPUT_DIR, { recursive: true });

  const filePath = `${config.OUTPUT_DIR}/no-work-log-${today}.mdx`;
  fs.writeFileSync(filePath, mdxContent, "utf-8");

  console.log(`💾 No-activity log saved to: ${filePath}`);
  return filePath;
}
