/**
 * Gemini API integration for generating blog posts from commit data.
 * Handles prompt building, API calls with retry logic, and response validation.
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { GoogleGenAI } from "@google/genai";
import config from "./config.js";

// safely extract directory path regardless of where the terminal or workflow runs the script
const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * Reads the prompt template and interpolates commit data.
 *
 * @param {Record<string, Array<{message: string, timestamp: string}>>} groupedCommits
 * @returns {string} The final prompt string
 */
function buildPrompt(groupedCommits) {
  const today = new Date().toISOString().split("T")[0];

  const commitSummary = Object.entries(groupedCommits)
    .map(([repo, commits]) => {
      const lines = commits
        .map((c) => `  - [${c.timestamp}] ${c.message}`)
        .join("\n");
      return `Repository: ${repo}\n${lines}`;
    })
    .join("\n\n");

  const template = fs.readFileSync(
    path.join(__dirname, "prompt.txt"),
    "utf-8"
  );

  return template
    .replace("{{DATE}}", today)
    .replace("{{COMMITS}}", commitSummary);
}

/**
 * Validates the parsed Gemini response has all required fields.
 *
 * @param {any} parsed - Parsed JSON response
 * @param {string} rawText - Raw response for error logging
 * @returns {{filename: string, title: string, description: string, content: string}}
 */
function validateResponse(parsed, rawText) {
  const requiredFields = ["filename", "title", "description", "content"];

  for (const field of requiredFields) {
    if (!parsed[field] || typeof parsed[field] !== "string") {
      console.error("❌ Gemini response missing required field:", field);
      console.error("Raw response:", rawText);
      throw new Error(`Gemini response missing or invalid field: "${field}"`);
    }
  }

  return parsed;
}

/**
 * Generates a blog post using Gemini with retry logic for transient errors.
 *
 * @param {Record<string, Array<{message: string, timestamp: string}>>} groupedCommits
 * @returns {Promise<{filename: string, title: string, description: string, content: string}>}
 */
export async function generateBlog(groupedCommits) {
  const ai = new GoogleGenAI({ apiKey: config.GEMINI_API_KEY });
  const prompt = buildPrompt(groupedCommits);

  console.log("Sending commit data to Gemini...");

  let rawText;

  for (let attempt = 1; attempt <= config.MAX_RETRIES; attempt++) {
    try {
      const response = await ai.models.generateContent({
        model: config.GEMINI_MODEL,
        contents: prompt,
        config: {
          responseMimeType: "application/json",
        },
      });

      rawText = response.text;
      console.log("Received response from Gemini");
      break;
    } catch (error) {
      const isRetryable =
        error.message?.includes("503") ||
        error.message?.includes("UNAVAILABLE") ||
        error.message?.includes("429") ||
        error.message?.includes("RESOURCE_EXHAUSTED") ||
        error.message?.includes("high demand") ||
        error.message?.includes("overloaded");

      if (isRetryable && attempt < config.MAX_RETRIES) {
        const delay = config.RETRY_DELAYS[attempt - 1];
        console.warn(
          `⚠️ Gemini attempt ${attempt}/${config.MAX_RETRIES} failed: ${error.message}`
        );
        console.warn(`   Retrying in ${delay / 1000}s...`);
        await new Promise((resolve) => setTimeout(resolve, delay));
      } else {
        throw new Error(
          `Gemini API failed after ${attempt} attempt(s): ${error.message}`
        );
      }
    }
  }

  // Parse JSON response
  let parsed;
  try {
    parsed = JSON.parse(rawText);
  } catch (parseError) {
    console.error("❌ Gemini returned invalid JSON. Raw response:");
    console.error(rawText);
    throw new Error(
      `Failed to parse Gemini response as JSON: ${parseError.message}`
    );
  }

  return validateResponse(parsed, rawText);
}
