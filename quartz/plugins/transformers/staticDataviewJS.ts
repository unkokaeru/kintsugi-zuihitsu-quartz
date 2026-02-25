import { QuartzTransformerPlugin } from "../types"
import { slugifyFilePath, FilePath } from "../../util/path"
import fs from "fs"
import path from "path"
import { BuildCtx } from "../../util/ctx"
import ignore, { Ignore } from "ignore"

/**
 * StaticDataviewJS: Replaces specific `dataviewjs` code blocks with statically computed
 * markdown content at build time, instead of removing them entirely.
 *
 * Currently supports the "unresolved links + stub headers" dataviewjs pattern:
 * - Finds wikilinks that don't resolve to any existing file (unresolved links)
 * - Finds headers whose only body content is "…" (stub headers)
 * - Renders the results as a markdown table with "Item" and "Found In" columns
 *
 * This plugin should be registered BEFORE RemoveDataviewJS so that matching
 * blocks are replaced with content rather than deleted.
 */
export const StaticDataviewJS: QuartzTransformerPlugin = () => {
  return {
    name: "StaticDataviewJS",
    textTransform(ctx: BuildCtx, src: string) {
      // Match dataviewjs code blocks
      const dataviewJsBlockRegex = /```dataviewjs\n([\s\S]*?)```/g

      return src.replace(dataviewJsBlockRegex, (fullMatch, codeContent: string) => {
        // Only process blocks that contain the unresolved links / stub headers pattern
        if (!codeContent.includes("unresolvedLinks")) {
          return fullMatch // Leave other dataviewjs blocks for RemoveDataviewJS to handle
        }

        return computeUnresolvedLinksTable(ctx)
      })
    },
  }
}

function buildIgnoreFilter(ctx: BuildCtx): Ignore {
  const ig = ignore()

  // Load .gitignore from the repository root (parent of content directory)
  try {
    const gitignorePath = path.join(ctx.argv.directory, "..", ".gitignore")
    const gitignoreContent = fs.readFileSync(gitignorePath, "utf-8")
    ig.add(gitignoreContent)
  } catch {
    // No .gitignore found — that's fine
  }

  // Also honour Quartz's own ignorePatterns from the config
  if (ctx.cfg.configuration.ignorePatterns.length > 0) {
    ig.add(ctx.cfg.configuration.ignorePatterns)
  }

  return ig
}

function computeUnresolvedLinksTable(ctx: BuildCtx): string {
  const mdFiles = ctx.allFiles.filter((f) => f.endsWith(".md"))

  // Build a gitignore-aware filter so we don't report links to intentionally ignored files
  const ig = buildIgnoreFilter(ctx)

  // Build a set of all slugs for fast exact lookup (lowercase for case-insensitive matching)
  const allSlugsSet = new Set<string>(ctx.allSlugs.map((s) => s.toLowerCase()))

  // Build a map: last path segment (lowercase) → list of full slugs (for "shortest" matching)
  const filenameToSlugs = new Map<string, string[]>()
  for (const slug of ctx.allSlugs) {
    const lastSegment = (slug.split("/").pop() || slug).toLowerCase()
    if (!filenameToSlugs.has(lastSegment)) {
      filenameToSlugs.set(lastSegment, [])
    }
    filenameToSlugs.get(lastSegment)!.push(slug)
  }

  const todoItems: Array<{ item: string; foundIn: string }> = []

  for (const filePath of mdFiles) {
    // Skip files in attached/ (matching the original dataviewjs behavior)
    if (filePath.startsWith("attached/")) continue

    let content: string
    try {
      const fullPath = path.join(ctx.argv.directory, filePath)
      content = fs.readFileSync(fullPath, "utf-8")
    } catch {
      continue
    }

    // Clean filename without path or extension
    const cleanName = path.basename(filePath, ".md")

    // --- Unresolved Links ---
    // Strip fenced code blocks to avoid false positives from wikilinks in code
    const contentNoCode = content.replace(/^```[^\n]*\n[\s\S]*?^```$/gm, "")

    // Find all wikilinks (including embeds ![[...]])
    const wikilinkRegex = /!?\[\[([^\[\]\|#\\]+?)(?:#[^\[\]\|#\\]+)?(?:\\?\|[^\[\]#]*)?\]\]/g
    let wlMatch: RegExpExecArray | null
    while ((wlMatch = wikilinkRegex.exec(contentNoCode)) !== null) {
      const rawTarget = wlMatch[1]?.trim()
      if (!rawTarget) continue

      // Slugify the target the same way Quartz resolves links
      const slugified = slugifyFilePath(rawTarget as FilePath)
      const filenamePart = (slugified.split("/").pop() || slugified).toLowerCase()

      // Check resolution using "shortest" strategy (matching quartz.config.ts):
      // 1. Exact slug match (case-insensitive)
      // 2. Filename-only match against any slug's last segment (case-insensitive)
      const exactMatch = allSlugsSet.has(slugified.toLowerCase())
      const shortestMatch =
        filenameToSlugs.has(filenamePart) &&
        (filenameToSlugs.get(filenamePart)?.length ?? 0) > 0

      if (!exactMatch && !shortestMatch) {
        // Skip targets that would be gitignored or match Quartz ignorePatterns
        const targetAsFile = slugified.endsWith(".md") ? slugified : slugified + ".md"
        if (ig.ignores(targetAsFile) || ig.ignores(slugified)) {
          continue
        }

        todoItems.push({
          item: `[[${rawTarget}]]`,
          foundIn: `[[${cleanName}]]`,
        })
      }
    }

    // --- Stub Headers (body is just "…") ---
    const headerRegex = /^(#{1,6})\s+(.*?)\s*\n([\s\S]*?)(?=\n#{1,6}\s|\n*$)/gm
    let hMatch: RegExpExecArray | null
    while ((hMatch = headerRegex.exec(content)) !== null) {
      const headerText = hMatch[2].trim()
      const body = hMatch[3].trim()
      if (body === "\u2026") {
        // "…" character
        todoItems.push({
          item: `[[${cleanName}#${headerText}|${headerText}]]`,
          foundIn: `[[${cleanName}]]`,
        })
      }
    }
  }

  // Deduplicate
  const seen = new Set<string>()
  const data: Array<[string, string]> = []
  for (const t of todoItems) {
    const key = t.item + "|" + t.foundIn
    if (!seen.has(key)) {
      seen.add(key)
      data.push([t.item, t.foundIn])
    }
  }

  // Sort by foundIn, then item
  data.sort((a, b) => {
    if (a[1].toLowerCase() === b[1].toLowerCase()) {
      return a[0].toLowerCase().localeCompare(b[0].toLowerCase())
    }
    return a[1].toLowerCase().localeCompare(b[1].toLowerCase())
  })

  // Generate markdown output
  if (data.length === 0) {
    return "\u2705 No unresolved links or stub headers found!"
  }

  let table = "| Item | Found In |\n| --- | --- |\n"
  for (const [item, foundIn] of data) {
    table += `| ${item} | ${foundIn} |\n`
  }
  return table.trimEnd()
}
