/**
 * Centralized configuration for the blog post generator.
 * All environment variables and defaults are read here.
 */

// Required
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GH_USERNAME = process.env.GH_USERNAME;

// Optional
const GITHUB_TOKEN = process.env.GITHUB_TOKEN || "";
const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-2.5-flash";
const OUTPUT_DIR = process.env.OUTPUT_DIR || "./generated";
const GITHUB_API_BASE = "https://api.github.com";

// Comma-separated list of repo names to exclude from commit collection.
// Matches against both "owner/repo" and just "repo".
const rawIgnored = process.env.IGNORED_REPOS;
const IGNORED_REPOS = (rawIgnored && rawIgnored.trim() ? rawIgnored : "blog-post-generator")
  .split(",")
  .map((r) => r.trim())
  .filter(Boolean);

// Commits containing this keyword in their message are silently skipped.
const rawSkip = process.env.SKIP_KEYWORD;
const SKIP_KEYWORD = rawSkip && rawSkip.trim() ? rawSkip : "[skip-log]";

// Retry configuration for transient Gemini errors
const MAX_RETRIES = 3;
const RETRY_DELAYS = [10_000, 30_000, 60_000]; // 10s, 30s, 60s

/**
 * Validates that all required environment variables are set.
 * Throws with a clear message if any are missing.
 */
function validate() {
  if (!GEMINI_API_KEY) {
    throw new Error("Missing required environment variable: GEMINI_API_KEY");
  }
  if (!GH_USERNAME) {
    throw new Error("Missing required environment variable: GH_USERNAME");
  }
}

export default Object.freeze({
  GEMINI_API_KEY,
  GH_USERNAME,
  GITHUB_TOKEN,
  GEMINI_MODEL,
  OUTPUT_DIR,
  GITHUB_API_BASE,
  IGNORED_REPOS,
  SKIP_KEYWORD,
  MAX_RETRIES,
  RETRY_DELAYS,
  validate,
});
