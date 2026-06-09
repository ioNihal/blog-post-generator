/**
 * Entrypoint for the blog post generator pipeline.
 * Orchestrates: fetch commits → group → generate blog using prompt → save as markdown file.
 */

import config from "../src/config.js";
import { fetchCommitsLast24Hours, groupByRepository } from "../src/github.js";
import { generateBlog } from "../src/gemini.js";
import { saveBlogPost, saveNoActivityPost } from "../src/writer.js";

async function main() {
  console.log("Blog Post Generator - starting pipeline\n");

  // Validate environment
  config.validate();

  // Step 1: Fetch commits from the last 24 hours
  const commits = await fetchCommitsLast24Hours();

  // Step 2: No commits → write a rest-day post and exit
  if (commits.length === 0) {
    console.log("No commits found in the last 24 hours");
    saveNoActivityPost();
    console.log("\n✅ Pipeline complete (no activity)");
    return;
  }

  // Step 3: Group commits by repository
  const grouped = groupByRepository(commits);
  const repoCount = Object.keys(grouped).length;

  console.log(`Commits grouped across ${repoCount} repository(ies):`);
  for (const [repo, repoCommits] of Object.entries(grouped)) {
    console.log(`   ${repo}: ${repoCommits.length} commit(s)`);
  }

  // Step 4: Generate blog post via Gemini
  const blog = await generateBlog(grouped);

  // Step 5: Save the .mdx file
  const savedPath = saveBlogPost(blog);

  console.log(`\n✅ Pipeline complete`);
  console.log(`   Title: ${blog.title}`);
  console.log(`   File:  ${savedPath}`);
}

main().catch((error) => {
  console.error("\n❌ Pipeline failed:", error.message);
  process.exit(1);
});
