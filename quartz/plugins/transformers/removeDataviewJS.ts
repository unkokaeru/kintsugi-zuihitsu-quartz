import { QuartzTransformerPlugin } from "../types"
import { Root } from "mdast"
import { visit } from "unist-util-visit"

export const RemoveDataviewJS: QuartzTransformerPlugin = () => {
  return {
    name: "RemoveDataviewJS",
    markdownPlugins() {
      return [
        () => {
          return (tree: Root) => {
            visit(tree, "code", (node, index, parent) => {
              // Check if this is a dataviewjs code block
              if (node.lang === "dataviewjs" || node.lang === "dataview") {
                // Remove the node by splicing it out of the parent's children array
                if (parent && typeof index === "number") {
                  parent.children.splice(index, 1)
                  return index // Return the index to skip the next node
                }
              }
            })
          }
        },
      ]
    },
  }
}