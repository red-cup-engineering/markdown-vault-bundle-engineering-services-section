import { sha256Digest } from "@red-cup-engineering/semiotic-content-address-system";
import { readMarkdownFrontmatter } from "@red-cup-engineering/markdown-engineering-services-section/read-markdown-frontmatter";

import { decodeReferencesValue } from "@red-cup-engineering/csl-json-engineering-services-section/csl-references";
import { formatAuthorsFull } from "@red-cup-engineering/csl-json-engineering-services-section/record-formatting";
import { issuedYear } from "@red-cup-engineering/csl-json-engineering-services-section";

/**
 * Frontmatter attributes rendered as carrier metadata rather than as a
 * relation. Every other attribute is an open-vocabulary vault relation key
 * (per resolve-markdown-vault-relation-keys-service) and is rendered generically.
 */
const METADATA_KEYS = Object.freeze([
  "title", "name", "description", "date-created", "date-modified", "date-updated",
  "authors", "aliases", "keywords", "tags", "type", "text-type", "id", "region", "subject", "references",
]);


function displayName(path, frontmatter) {
  if (typeof frontmatter.title === "string" && frontmatter.title.trim() !== "") return frontmatter.title.trim();
  if (typeof frontmatter.name === "string" && frontmatter.name.trim() !== "") return frontmatter.name.trim();
  const base = path.slice(path.lastIndexOf("/") + 1);
  return base.replace(/\.mdx?$/iu, "");
}

function formatValue(value) {
  if (Array.isArray(value)) return value.map((item) => formatValue(item)).join(", ");
  if (value !== null && typeof value === "object") return JSON.stringify(value);
  return String(value);
}

function renderReferencesBlock(references) {
  if (references == null) return null;
  const { items, dialect } = decodeReferencesValue(references);
  const expected = typeof references === "object" ? Object.keys(references).length : 1;
  if (dialect === "mixed" || items.length !== expected) {
    throw new TypeError("reference block contains records that cannot be decoded as CSL");
  }
  if (!items.length) return null;
  const ids = new Set();
  for (const item of items) {
    if (typeof item.id !== "string" || !item.id.trim() || ids.has(item.id)) {
      throw new TypeError("reference records require distinct authored identifiers");
    }
    ids.add(item.id);
  }
  const lines = [...items].sort((left, right) => left.id.localeCompare(right.id, "en")).map((item) => {
    const detail = [item.title, formatAuthorsFull(item.author ?? item.editor), issuedYear(item.issued)]
      .filter((value) => value !== undefined && value !== null && value !== "").join(" — ");
    return detail === "" ? `- **${item.id}**` : `- **${item.id}**: ${detail}`;
  });
  return ["**References:**", ...lines].join("\n");
}

function renderRelationsBlock(frontmatter) {
  const keys = Object.keys(frontmatter)
    .filter((key) => !METADATA_KEYS.includes(key))
    .sort((left, right) => left.localeCompare(right, "en"));
  if (keys.length === 0) return null;
  const lines = keys.map((key) => `- **${key}**: ${formatValue(frontmatter[key])}`);
  return ["**Relations:**", ...lines].join("\n");
}

function countWords(text) {
  const trimmed = text.trim();
  return trimmed === "" ? 0 : trimmed.split(/\s+/u).length;
}

/**
 * Render one Markdown carrier as a self-tracing bundle block: a heading
 * naming the carrier and its repository-relative path, a readable
 * (non-YAML) header block for its description/references/relations, and its body.
 * @param {{path: string, markdown: string}} carrier
 * @returns {{path: string, name: string, digest: string, text: string, wordCount: number}}
 * @throws {TypeError} when path or markdown is missing or the wrong type.
 */
export function renderMarkdownVaultCarrier({ path, markdown }) {
  if (typeof path !== "string" || path === "") throw new TypeError("path is required");
  if (typeof markdown !== "string") throw new TypeError("markdown must be a string");
  const digest = sha256Digest(markdown);
  const { frontmatter, body } = readMarkdownFrontmatter(markdown, { absentFrontmatter: "empty" });
  const name = displayName(path, frontmatter);
  const lines = [`### ${name}`, "", `*Carrier: \`${path}\`*`];
  if (typeof frontmatter.description === "string" && frontmatter.description.trim() !== "") {
    lines.push("", `**Description:** ${frontmatter.description.trim()}`);
  }
  const references = renderReferencesBlock(frontmatter.references);
  if (references !== null) lines.push("", references);
  const relations = renderRelationsBlock(frontmatter);
  if (relations !== null) lines.push("", relations);
  lines.push("", body.trim());
  const text = `${lines.join("\n").trimEnd()}\n`;
  return Object.freeze({ path, name, digest, text, wordCount: countWords(text) });
}
