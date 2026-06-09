# Blog Post Generator

<p align="center">
  <a href="https://nodejs.org"><img src="https://img.shields.io/badge/Node.js-%3E%3D_18-339933?style=for-the-badge&logo=nodedotjs&logoColor=white" alt="Node.js Version"></a>
  <a href="https://aistudio.google.com/"><img src="https://img.shields.io/badge/Gemini_AI-Powered-4285F4?style=for-the-badge&logo=google-gemini&logoColor=white" alt="Gemini AI"></a>
  <a href="LICENSE"><img src="https://img.shields.io/github/license/ioNihal/blog-post-generator?style=for-the-badge&color=8A2BE2" alt="License"></a>
  <a href="https://github.com/ioNihal/blog-post-generator/stargazers"><img src="https://img.shields.io/github/stars/ioNihal/blog-post-generator?style=for-the-badge&color=ffd700" alt="GitHub Stars"></a>
  <a href="https://github.com/ioNihal/blog-post-generator/network/members"><img src="https://img.shields.io/github/forks/ioNihal/blog-post-generator?style=for-the-badge&color=00bfff" alt="GitHub Forks"></a>
  <a href="https://github.com/ioNihal/blog-post-generator/pulls"><img src="https://img.shields.io/badge/PRs-welcome-brightgreen?style=for-the-badge" alt="PRs Welcome"></a>
</p>

Turns your daily GitHub commits into personal developer journal entries using AI. Runs on GitHub Actions, generates `.mdx` files automatically.

## How it works

```
GitHub Events API → Discover active repos
         ↓
Commits API → Fetch commit messages
         ↓
Gemini AI → Generate journal entry
         ↓
Save as .mdx → Commit to repo
```

Every day, the pipeline:

1. Finds all repositories you pushed to in the last 24 hours
2. Fetches commit messages from each repo
3. Sends them to Google Gemini to generate a developer journal entry
4. Saves the result as an `.mdx` file with frontmatter

The generated posts are calm, concise summaries of your day - not changelogs, not commit dumps.

## Quick Setup

### 1. Fork this repository

### 2. Get a Gemini API key

Go to [Google AI Studio](https://aistudio.google.com/) and create a free API key.

### 3. Configure your repository

Go to your forked repo's **Settings → Secrets and variables → Actions**:

**Secrets** (required):

| Name             | Value                    |
| ---------------- | ------------------------ |
| `GEMINI_API_KEY` | Your Google AI Studio key |

**Variables** (required):

| Name          | Value              |
| ------------- | ------------------ |
| `GH_USERNAME` | Your GitHub username |

**Variables** (optional):

| Name              | Value                              | Default              |
| ----------------- | ---------------------------------- | -------------------- |
| `IGNORED_REPOS`   | Comma-separated repos to skip      | `blog-post-generator` |
| `SKIP_KEYWORD`    | Skip commits containing this text  | `[skip-log]`         |
| `GIT_USER_NAME`   | Git commit author name             | `daily-blog-bot`     |
| `GIT_USER_EMAIL`  | Git commit author email            | `bot@blog-post-generator` |

### 4. Done

The workflow runs daily at **18:30 UTC**. You can also trigger it manually from the **Actions** tab → **Daily Blog** → **Run workflow**.

> **Note:** GitHub Actions scheduled workflows can be delayed by 30-90 minutes during high demand periods. This is a GitHub limitation, not a bug.

## Skipping Commits

Add `[skip-log]` anywhere in your commit message to exclude it from the journal:

```bash
git commit -m "update env vars [skip-log]"
```

You can change the keyword via the `SKIP_KEYWORD` variable.

## Customizing the Blog Style

The AI prompt lives in [`src/prompt.txt`](src/prompt.txt). Edit it to change the tone, length, structure, or format of generated posts. The file uses two placeholders:

- `{{DATE}}` - replaced with today's date
- `{{COMMITS}}` - replaced with the formatted commit data

## Local Development

```bash
# Clone and install
git clone https://github.com/ioNihal/blog-post-generator.git
cd blog-post-generator
npm install

# Set environment variables
cp .env.example .env
# Edit .env with your values

# Run the pipeline
npm run generate
```

## Configuration Reference

All settings are configurable via environment variables:

| Variable         | Required | Description                              | Default              |
| ---------------- | -------- | ---------------------------------------- | -------------------- |
| `GEMINI_API_KEY` | Yes      | Google AI Studio API key                 | -                    |
| `GH_USERNAME`    | Yes      | GitHub username to fetch commits for     | -                    |
| `GITHUB_TOKEN`   | No       | GitHub token for higher rate limits      | -                    |
| `GEMINI_MODEL`   | No       | Gemini model to use                      | `gemini-2.5-flash`   |
| `OUTPUT_DIR`     | No       | Directory for generated files            | `./generated`        |
| `IGNORED_REPOS`  | No       | Comma-separated repos to exclude         | `blog-post-generator` |
| `SKIP_KEYWORD`   | No       | Keyword to skip specific commits         | `[skip-log]` |

## Example Output

```markdown
---
title: "Auth, Audit, and the Middleware Maze"
description: "Building the foundation for leave management with authentication, auditing, and service-layer architecture."
date: 2026-06-08
---

Today was focused on laying the groundwork for the leave management system.

I started by cleaning up the project structure and moving middleware into
a more organized location. It's a small change, but keeping the codebase
tidy early helps avoid headaches later.

The biggest task was implementing authentication. I added sign-in functionality,
password hashing, JWT-based authentication, and middleware for protecting routes.

Overall, it was a productive session.
```

## Project Structure

```
├── src/
│   ├── config.js      # Configuration and environment variables
│   ├── github.js      # GitHub API integration
│   ├── gemini.js      # Gemini AI integration
│   ├── writer.js      # MDX file writer
│   └── prompt.txt     # Customizable AI prompt template
├── scripts/
│   └── generate.js    # Pipeline entrypoint
├── generated/         # Output directory for .mdx files
├── .github/workflows/
│   └── daily-blog.yml # GitHub Actions workflow
├── .env.example       # Environment variable template
└── package.json
```

## License

MIT - see [LICENSE](LICENSE).

---

## 👨‍💻 About the Author

This project is created and maintained by **Nihal (ioNihal)**.

> I am a software developer based in Kasaragod, India, looking for early-career opportunities in frontend, backend, or full-stack development. I enjoy building automations, developer tools, and clean, user-friendly applications.

* **Portfolio:** [ionihal.vercel.app](https://ionihal.vercel.app)
* **GitHub:** [@ioNihal](https://github.com/ioNihal)

Feel free to connect if you have job opportunities, collaboration ideas, or feedback! If you find this project useful, please consider leaving a ⭐ on the repository.
