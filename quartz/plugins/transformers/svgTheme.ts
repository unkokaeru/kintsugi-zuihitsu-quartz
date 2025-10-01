import { QuartzTransformerPlugin } from "../types"
import { Root as HTMLRoot } from "hast"
import { Element } from "hast"
import { visit } from "unist-util-visit"
import { VFile } from "vfile"
import { BuildCtx } from "../../util/ctx"
import path from "path"
import fs from "fs"

interface Options {
  /**
   * Custom CSS class to add to themed SVGs
   * Default: "themed-svg"
   */
  cssClass?: string
  
  /**
   * Directory where SVG variants will be stored
   * Default: "themed-svgs"
   */
  variantDir?: string
}

const defaultOptions: Options = {
  cssClass: "themed-svg",
  variantDir: "themed-svgs"
}

// Track processed SVGs to avoid duplicates
const processedSvgs = new Set<string>()

export const SvgTheme: QuartzTransformerPlugin<Partial<Options>> = (userOpts) => {
  const opts: Options = { ...defaultOptions, ...userOpts }

  return {
    name: "SvgTheme",
    htmlPlugins(ctx) {
      return [
        // First pass - process all img tags
        () => {
          return (tree: HTMLRoot, file: VFile) => {
            visit(tree, "element", (node: Element) => {
              if (node.tagName === "img" && node.properties?.src) {
                const src = node.properties.src as string
                if (src.endsWith(".svg")) {
                  // Process the SVG file and create variants
                  processSvgFile(src, ctx, opts)
                  
                  // Add themed class and data attributes for JavaScript to use
                  const currentClass = (node.properties.className as string[]) || []
                  if (!currentClass.includes(opts.cssClass!)) {
                    node.properties.className = [...currentClass, opts.cssClass!]
                  }
                  
                  // Add data attribute to store original src for theme switching
                  node.properties['data-original-src'] = src
                }
              }
            })
          }
        },
        // Second pass - catch any HTML img tags that were processed by rehype-raw
        () => {
          return (tree: HTMLRoot, file: VFile) => {
            visit(tree, "element", (node: Element) => {
              if (node.tagName === "img" && node.properties?.src) {
                const src = node.properties.src as string
                if (src.endsWith(".svg")) {
                  // Check if already processed
                  const hasClass = (node.properties.className as string[])?.includes(opts.cssClass!)
                  if (!hasClass) {
                    // Add themed class and data attributes
                    const currentClass = (node.properties.className as string[]) || []
                    node.properties.className = [...currentClass, opts.cssClass!]
                    node.properties['data-original-src'] = src
                  }
                }
              }
            })
          }
        }
      ]
    },
    externalResources() {
      return {
        js: [
          {
            script: generateThemeSwapScript(opts),
            loadTime: "afterDOMReady",
            contentType: "inline"
          }
        ]
      }
    }
  }
}

function processSvgFile(src: string, ctx: BuildCtx, opts: Options) {
  // Skip if already processed
  const normalizedSrc = src.replace(/^\.\//, '')
  if (processedSvgs.has(normalizedSrc)) {
    return
  }
  
  try {
    // Decode URL-encoded paths
    const decodedSrc = decodeURIComponent(normalizedSrc)
    
    // Try both content and public directories with both encoded and decoded paths
    const baseDir = process.cwd() // Use current working directory instead
    const possiblePaths = [
      path.join(baseDir, 'content', decodedSrc),
      path.join(baseDir, 'content', normalizedSrc),
      path.join(baseDir, 'public', decodedSrc),
      path.join(baseDir, 'public', normalizedSrc)
    ]
    
    let svgPath = ''
    for (const testPath of possiblePaths) {
      if (fs.existsSync(testPath)) {
        svgPath = testPath
        break
      }
    }
    
    if (svgPath && fs.existsSync(svgPath)) {
      const svgContent = fs.readFileSync(svgPath, 'utf-8')
      
      // Generate both light and dark variants for all SVGs
      const lightVariantContent = generateLightVariant(svgContent)
      const darkVariantContent = generateDarkVariant(svgContent)
      
      // Create variant filenames using the decoded path
      const extension = path.extname(decodedSrc)
      const baseName = path.basename(decodedSrc, extension)
      const dirName = path.dirname(decodedSrc)
      
      const lightVariantName = `${baseName}-light${extension}`
      const darkVariantName = `${baseName}-dark${extension}`
      const lightVariantPath = path.join(dirName, opts.variantDir!, lightVariantName)
      const darkVariantPath = path.join(dirName, opts.variantDir!, darkVariantName)
      
      // Ensure variant directory exists in public
      const fullVariantDir = path.join(baseDir, 'public', dirName, opts.variantDir!)
      if (!fs.existsSync(fullVariantDir)) {
        fs.mkdirSync(fullVariantDir, { recursive: true })
      }
      
      // Write both variant files to public directory
      const fullLightVariantPath = path.join(baseDir, 'public', lightVariantPath)
      const fullDarkVariantPath = path.join(baseDir, 'public', darkVariantPath)
      
      fs.writeFileSync(fullLightVariantPath, lightVariantContent)
      fs.writeFileSync(fullDarkVariantPath, darkVariantContent)
      
      console.log(`Generated SVG variants: ${fullLightVariantPath} and ${fullDarkVariantPath}`)
      processedSvgs.add(normalizedSrc)
    } else {
      console.warn(`SVG file not found: ${src}`)
      console.warn(`Tried paths:`, possiblePaths)
    }
  } catch (error) {
    console.warn(`Failed to process SVG: ${src}`, error)
  }
}

function analyzeSvgColors(svgContent: string): boolean {
  // Simple heuristic: check for common light colors
  const lightColorPatterns = [
    /#fff/i, /white/i, /#f{6}/i, /#f{3}/i,
    /#[e-f][0-9a-f]{5}/i, /#[e-f][0-9a-f]{2}/i
  ]
  
  const darkColorPatterns = [
    /#000/i, /black/i, /#0{6}/i, /#0{3}/i,
    /#[0-3][0-9a-f]{5}/i, /#[0-3][0-9a-f]{2}/i
  ]
  
  let lightMatches = 0
  let darkMatches = 0
  
  lightColorPatterns.forEach(pattern => {
    const matches = svgContent.match(new RegExp(pattern.source, 'gi'))
    if (matches) lightMatches += matches.length
  })
  
  darkColorPatterns.forEach(pattern => {
    const matches = svgContent.match(new RegExp(pattern.source, 'gi'))
    if (matches) darkMatches += matches.length
  })
  
  // If no clear pattern, assume light (safer default)
  return lightMatches >= darkMatches
}

function generateDarkVariant(svgContent: string): string {
  // Dark variant - for dark mode display (should be white/light)
  return svgContent
    .replace(/#ffffff/gi, '#ffffff')  // Keep white as white for dark mode
    .replace(/white/gi, 'white')
    .replace(/#fff/gi, '#fff')
    .replace(/fill="none"/gi, 'fill="none"') // Preserve none fills
    .replace(/stroke="#000000"/gi, 'stroke="#ffffff"') // Make black strokes white
    .replace(/stroke="black"/gi, 'stroke="white"')
}

function generateLightVariant(svgContent: string): string {
  // Light variant - for light mode display (should be black/dark)
  return svgContent
    .replace(/#ffffff/gi, '#000000')  // Convert white to black for light mode
    .replace(/white/gi, 'black')
    .replace(/#fff/gi, '#000')
    .replace(/fill="none"/gi, 'fill="none"') // Preserve none fills
    .replace(/stroke="#ffffff"/gi, 'stroke="#000000"') // Make white strokes black
    .replace(/stroke="white"/gi, 'stroke="black"')
    .replace(/#000000/gi, '#000000')  // Keep black as black
    .replace(/black/gi, 'black')
    .replace(/#000/gi, '#000')
    .replace(/stroke="#000000"/gi, 'stroke="#000000"')
    .replace(/stroke="black"/gi, 'stroke="black"')
}

function generateThemeSwapScript(opts: Options): string {
  return `
// SVG Theme Swapper - Automatically switch SVG variants based on theme
(function() {
  const VARIANT_DIR = '${opts.variantDir}';
  const SVG_CLASS = '${opts.cssClass}';
  
  function updateSvgSources() {
    const currentTheme = document.documentElement.getAttribute('saved-theme') || 'light';
    
    // Find all SVG images - both processed ones with themed-svg class and unprocessed HTML img tags
    let svgImages = document.querySelectorAll('img.' + SVG_CLASS + '[data-original-src]');
    
    // Also find HTML img tags that might not have been processed by the transformer
    const unprocessedSvgImages = document.querySelectorAll('img[src$=".svg"]:not(.' + SVG_CLASS + ')');
    unprocessedSvgImages.forEach(img => {
      // Add the class and data attribute to unprocessed images
      img.classList.add(SVG_CLASS);
      img.setAttribute('data-original-src', img.getAttribute('src'));
    });
    
    // Get all themed SVG images (both originally processed and newly added)
    svgImages = document.querySelectorAll('img.' + SVG_CLASS + '[data-original-src]');
    
    svgImages.forEach(img => {
      const originalSrc = img.getAttribute('data-original-src');
      if (!originalSrc || !originalSrc.endsWith('.svg')) return;
      
      // Parse the original path
      const pathParts = originalSrc.split('/');
      const filename = pathParts.pop();
      const extension = filename.includes('.') ? '.' + filename.split('.').pop() : '';
      const baseName = filename.replace(extension, '');
      const directory = pathParts.join('/');
      
      // Determine which variant to use
      let targetSrc = originalSrc;
      
      if (currentTheme === 'light') {
        // In light mode, use light variant (which is dark colored for visibility)
        const lightVariant = directory + '/' + VARIANT_DIR + '/' + baseName + '-light' + extension;
        targetSrc = './' + lightVariant;
      } else {
        // In dark mode, use dark variant (which is light colored for visibility)
        const darkVariant = directory + '/' + VARIANT_DIR + '/' + baseName + '-dark' + extension;
        targetSrc = './' + darkVariant;
      }
      
      // Update src if different
      if (img.src !== targetSrc) {
        // Test if variant exists by trying to load it
        const testImg = new Image();
        testImg.onload = () => {
          img.src = targetSrc;
        };
        testImg.onerror = () => {
          // Fallback to original if variant doesn't exist
          img.src = originalSrc;
        };
        testImg.src = targetSrc;
      }
    });
  }
  
  // Update on page load
  updateSvgSources();
  
  // Update when theme changes
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.type === 'attributes' && 
          mutation.attributeName === 'saved-theme' && 
          mutation.target === document.documentElement) {
        updateSvgSources();
      }
    });
  });
  
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['saved-theme']
  });
  
  // Also listen for storage events (in case theme is changed in another tab)
  window.addEventListener('storage', (e) => {
    if (e.key === 'theme') {
      updateSvgSources();
    }
  });
})();
`.trim()
}