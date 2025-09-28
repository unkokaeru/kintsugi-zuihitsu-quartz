import { QuartzTransformerPlugin } from "../types"
import { Root, Code } from "mdast"
import { visit } from "unist-util-visit"
import { VFile } from "vfile"
import { FilePath } from "../../util/path"
import * as fs from "fs"
import * as path from "path"

export interface Options {
  // No options needed for now
}

interface FolderOverviewConfig {
  id?: string
  folderPath: string
  title?: string
  showTitle?: boolean
  depth?: number
  includeTypes?: string[]
  style?: string
  disableFileTag?: boolean
  sortBy?: string
  sortByAsc?: boolean
  showEmptyFolders?: boolean
  onlyIncludeSubfolders?: boolean
  storeFolderCondition?: boolean
  showFolderNotes?: boolean
  disableCollapseIcon?: boolean
  alwaysCollapse?: boolean
  autoSync?: boolean
  allowDragAndDrop?: boolean
}

function parseSimpleYaml(yamlString: string): FolderOverviewConfig {
  const config: any = {}
  const lines = yamlString.trim().split('\n')
  
  for (const line of lines) {
    const trimmedLine = line.trim()
    if (!trimmedLine || trimmedLine.startsWith('#')) continue
    
    if (trimmedLine.includes(':')) {
      const [key, ...valueParts] = trimmedLine.split(':')
      const value = valueParts.join(':').trim()
      
      if (key.trim() === 'includeTypes') {
        // Handle array values that follow on next lines
        continue
      } else if (trimmedLine.startsWith('- ')) {
        // Handle array items
        const arrayKey = 'includeTypes' // Simple assumption for our use case
        if (!config[arrayKey]) config[arrayKey] = []
        config[arrayKey].push(trimmedLine.substring(2).trim())
      } else {
        // Handle simple key-value pairs
        const parsedValue = parseValue(value)
        config[key.trim()] = parsedValue
      }
    } else if (trimmedLine.startsWith('- ')) {
      // Handle array items when we're in an array context
      if (!config.includeTypes) config.includeTypes = []
      config.includeTypes.push(trimmedLine.substring(2).trim())
    }
  }
  
  return config as FolderOverviewConfig
}

function parseValue(value: string): any {
  if (value === 'true') return true
  if (value === 'false') return false
  if (value === 'null' || value === '') return null
  if (/^\d+$/.test(value)) return parseInt(value, 10)
  if (value.startsWith('"') && value.endsWith('"')) return value.slice(1, -1)
  return value
}

export const FolderOverview: QuartzTransformerPlugin<Partial<Options>> = () => {
  return {
    name: "FolderOverview",
    markdownPlugins() {
      return [
        () => {
          return async (tree: Root, file: VFile) => {
            const replacements: Array<{ node: Code; replacement: any }> = []

            visit(tree, "code", (node: Code) => {
              if (node.lang === "folder-overview") {
                try {
                  // Parse the YAML configuration
                  const config = parseSimpleYaml(node.value) as FolderOverviewConfig
                  
                  // Get the current file's directory
                  const currentFilePath = file.path as FilePath
                  const currentDir = path.dirname(currentFilePath)
                  
                  // Determine the target folder
                  let targetFolder: string
                  if (config.folderPath === "" || !config.folderPath) {
                    // Empty folderPath means current directory
                    targetFolder = currentDir
                  } else {
                    // Resolve relative to current directory
                    targetFolder = path.resolve(currentDir, config.folderPath)
                  }

                  // Generate the folder listing
                  const listContent = generateFolderListing(targetFolder, config, currentFilePath)
                  
                  // Create replacement nodes
                  const replacement = {
                    type: "paragraph",
                    children: [
                      {
                        type: "html",
                        value: listContent
                      }
                    ]
                  }

                  replacements.push({ node, replacement })
                } catch (error) {
                  console.warn(`Failed to process folder-overview in ${file.path}:`, error)
                  // Leave the original code block if parsing fails
                }
              }
            })

            // Apply replacements
            for (const { node, replacement } of replacements) {
              visit(tree, (visitNode, index, visitParent) => {
                if (visitNode === node && visitParent && typeof index === 'number') {
                  visitParent.children[index] = replacement
                  return false
                }
              })
            }
          }
        }
      ]
    }
  }
}

function generateFolderListing(
  folderPath: string, 
  config: FolderOverviewConfig, 
  currentFilePath: FilePath
): string {
  try {
    if (!fs.existsSync(folderPath)) {
      return `<p><em>Folder not found: ${folderPath}</em></p>`
    }

    const items = fs.readdirSync(folderPath, { withFileTypes: true })
    const includeTypes = config.includeTypes || ["folder", "markdown"]
    const sortByAsc = config.sortByAsc !== false
    
    let entries: Array<{ name: string, isFolder: boolean, path: string }> = []

    for (const item of items) {
      const itemPath = path.join(folderPath, item.name)
      
      if (item.isDirectory() && includeTypes.includes("folder")) {
        // Skip empty folders if configured
        if (!config.showEmptyFolders && isFolderEmpty(itemPath)) {
          continue
        }
        entries.push({
          name: item.name,
          isFolder: true,
          path: itemPath
        })
      } else if (item.isFile() && includeTypes.includes("markdown")) {
        // Only include markdown files
        if (item.name.endsWith('.md')) {
          // Skip the current file itself
          if (itemPath !== currentFilePath) {
            entries.push({
              name: item.name.replace(/\.md$/, ''), // Remove .md extension
              isFolder: false,
              path: itemPath
            })
          }
        }
      }
    }

    // Sort entries
    if (config.sortBy === "name" || !config.sortBy) {
      entries.sort((a, b) => {
        const comparison = a.name.localeCompare(b.name, undefined, { 
          numeric: true, 
          sensitivity: "base" 
        })
        return sortByAsc ? comparison : -comparison
      })
    }

    // Generate the HTML list
    if (entries.length === 0) {
      return `<p><em>No items found in this folder.</em></p>`
    }

    let html = "<ul>\n"
    for (const entry of entries) {
      if (entry.isFolder) {
        // For folders, create a link to the folder page
        const relativePath = path.relative(path.dirname(currentFilePath), entry.path)
        const slug = relativePath.replace(/\\/g, "/") // Convert Windows paths to URL format
        html += `  <li><strong><a href="${slug}/">${entry.name}/</a></strong></li>\n`
      } else {
        // For markdown files, create a link to the file
        const relativePath = path.relative(path.dirname(currentFilePath), entry.path)
        const slug = relativePath.replace(/\\/g, "/").replace(/\.md$/, "") // Convert Windows paths and remove .md
        html += `  <li><a href="${slug}">${entry.name}</a></li>\n`
      }
    }
    html += "</ul>"

    // Add title if configured
    if (config.showTitle && config.title) {
      const folderName = path.basename(folderPath)
      const title = config.title.replace("{{folderName}}", folderName)
      html = `<h3>${title}</h3>\n${html}`
    }

    return html
  } catch (error) {
    console.warn(`Error generating folder listing for ${folderPath}:`, error)
    return `<p><em>Error generating folder listing: ${error}</em></p>`
  }
}

function isFolderEmpty(folderPath: string): boolean {
  try {
    const items = fs.readdirSync(folderPath)
    return items.length === 0
  } catch {
    return true
  }
}