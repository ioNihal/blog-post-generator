/**
 * GitHub API integration for fetching user commits.
 *
 * Two-step approach:
 *   1. Events API → discover which repos had PushEvents recently
 *   2. Commits API → fetch actual commit data per repo
 *
 * This works around GitHub's removal of commit data from PushEvent payloads.
 */

import config from "./config.js";

/**
 * Makes an authenticated GET request to the GitHub API.
 *
 * @param {string} url - Full GitHub API URL
 * @returns {Promise<{data: any, linkHeader: string|null}>}
 */
async function githubFetch(url) {
  const headers = {
    Accept: "application/vnd.github+json",
    "User-Agent": "blog-post-generator",
    "X-GitHub-Api-Version": "2022-11-28",
  };

  if (config.GITHUB_TOKEN) {
    headers.Authorization = `Bearer ${config.GITHUB_TOKEN}`;
  }

  const response = await fetch(url, { headers });

  if (!response.ok) {
    throw new Error(
      `GitHub API error: ${response.status} ${response.statusText} for ${url}`
    );
  }

  const data = await response.json();
  const linkHeader = response.headers.get("link");

  return { data, linkHeader };
}

/**
 * Extracts the "next" page URL from a GitHub Link header.
 *
 * @param {string|null} linkHeader
 * @returns {string|null}
 */
function getNextPageUrl(linkHeader) {
  if (!linkHeader) return null;
  const match = linkHeader.match(/<([^>]+)>;\s*rel="next"/);
  return match ? match[1] : null;
}

/**
 * Uses the Events API to discover which repositories the user
 * pushed to within the given time window.
 *
 * @param {Date} since - Cutoff date
 * @returns {Promise<Set<string>>} Set of "owner/repo" names
 */
async function discoverActiveRepos(since) {
  const activeRepos = new Set();

  let url = `${config.GITHUB_API_BASE}/users/${config.GH_USERNAME}/events?per_page=100`;
  let page = 0;

  while (url && page < 10) {
    page++;
    console.log(`📄 Fetching events page ${page}...`);

    const { data: events, linkHeader } = await githubFetch(url);

    if (!Array.isArray(events) || events.length === 0) break;

    let allTooOld = true;

    for (const event of events) {
      const eventDate = new Date(event.created_at);

      if (eventDate < since) continue;
      allTooOld = false;

      if (event.type !== "PushEvent") continue;

      const repoName = event.repo?.name;
      if (!repoName) continue;

      // Skip repos in the ignore list
      const shortName = repoName.split("/").pop();
      if (
        config.IGNORED_REPOS.includes(shortName) ||
        config.IGNORED_REPOS.includes(repoName)
      ) {
        continue;
      }

      activeRepos.add(repoName);
    }

    if (allTooOld) break;
    url = getNextPageUrl(linkHeader);
  }

  return activeRepos;
}

/**
 * Fetches commits from a specific repository, filtered by author and time.
 *
 * @param {string} repoFullName - "owner/repo" format
 * @param {Date} since - Only include commits after this date
 * @returns {Promise<Array<{repository: string, message: string, timestamp: string}>>}
 */
async function fetchRepoCommits(repoFullName, since) {
  const commits = [];
  const sinceISO = since.toISOString();

  const url = `${config.GITHUB_API_BASE}/repos/${repoFullName}/commits?author=${config.GH_USERNAME}&since=${sinceISO}&per_page=100`;

  try {
    const { data } = await githubFetch(url);

    if (!Array.isArray(data)) return commits;

    for (const item of data) {
      const message = item.commit?.message || "(no message)";

      // Skip commits flagged with the skip keyword
      if (message.includes(config.SKIP_KEYWORD)) {
        console.log(`   ⏭ Skipping flagged commit: ${message.slice(0, 60)}...`);
        continue;
      }

      commits.push({
        repository: repoFullName,
        message,
        timestamp: item.commit?.author?.date || item.commit?.committer?.date || "",
      });
    }
  } catch (error) {
    console.warn(`⚠️  Could not fetch commits for ${repoFullName}: ${error.message}`);
  }

  return commits;
}

/**
 * Fetches all commits from the last 24 hours across all repositories.
 *
 * @returns {Promise<Array<{repository: string, message: string, timestamp: string}>>}
 */
export async function fetchCommitsLast24Hours() {
  const since = new Date(Date.now() - 24 * 60 * 60 * 1000);

  console.log(`⏰ Fetching commits since: ${since.toISOString()}`);
  console.log(`👤 GitHub user: ${config.GH_USERNAME}`);

  const activeRepos = await discoverActiveRepos(since);

  if (activeRepos.size === 0) {
    console.log("✅ No push activity found in the last 24 hours");
    return [];
  }

  console.log(`Active repos: ${[...activeRepos].join(", ")}`);

  const allCommits = [];

  for (const repo of activeRepos) {
    console.log(`🔍 Fetching commits from ${repo}...`);
    const repoCommits = await fetchRepoCommits(repo, since);
    console.log(`   → ${repoCommits.length} commit(s)`);
    allCommits.push(...repoCommits);
  }

  console.log(`✅ Found ${allCommits.length} total commit(s) in the last 24 hours`);
  return allCommits;
}

/**
 * Groups a flat list of commits by repository name.
 *
 * @param {Array<{repository: string, message: string, timestamp: string}>} commits
 * @returns {Record<string, Array<{message: string, timestamp: string}>>}
 */
export function groupByRepository(commits) {
  const grouped = {};

  for (const commit of commits) {
    if (!grouped[commit.repository]) {
      grouped[commit.repository] = [];
    }

    grouped[commit.repository].push({
      message: commit.message,
      timestamp: commit.timestamp,
    });
  }

  return grouped;
}
