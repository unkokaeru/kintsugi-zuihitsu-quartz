import { QuartzTransformerPlugin } from "../types"
import { Root, Html } from "mdast"
import { visit } from "unist-util-visit"

export const RemoveSpacedRepetition: QuartzTransformerPlugin = () => {
  return {
    name: "RemoveSpacedRepetition",
    markdownPlugins() {
      return [
        () => {
          return (tree: Root) => {
            visit(tree, "html", (node: Html, index, parent) => {
              // Check if this is a spaced repetition HTML comment
              if (node.value.trim().startsWith("<!--SR:") && node.value.trim().endsWith("-->")) {
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