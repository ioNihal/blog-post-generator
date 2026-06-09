# Contributing

Thanks for your interest in contributing to Blog Post Generator.

## Getting Started

1. Fork the repository
2. Clone your fork:
   ```bash
   git clone https://github.com/your-username/blog-post-generator.git
   cd blog-post-generator
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. Copy the environment template:
   ```bash
   cp .env.example .env
   ```
5. Fill in your `GEMINI_API_KEY` and `GH_USERNAME` in `.env`

## Development

Run the pipeline locally:

```bash
npm run generate
```

Check syntax across all modules:

```bash
node --check scripts/generate.js
node --check src/config.js
node --check src/github.js
node --check src/gemini.js
node --check src/writer.js
```

## Project Structure

- `src/config.js` - All configuration and environment variables
- `src/github.js` - GitHub API integration (events + commits)
- `src/gemini.js` - Gemini AI integration (prompt + generation + retry)
- `src/writer.js` - MDX file output
- `src/prompt.txt` - AI prompt template (customizable)
- `scripts/generate.js` - Pipeline entrypoint

## Pull Requests

- Keep changes focused and minimal
- Follow the existing code style (ESM, async/await, JSDoc comments)
- Test locally before submitting
- Describe what your PR does and why

## Reporting Issues

Open an issue with:
- What you expected to happen
- What actually happened
- Steps to reproduce
- Relevant logs or error messages

## Code Style

- ES Modules (`import`/`export`)
- Async/await (no callbacks)
- JSDoc comments on exported functions
- Descriptive variable names
- No unnecessary dependencies
