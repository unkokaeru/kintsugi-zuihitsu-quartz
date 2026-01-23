let keySequence = ""
let sequenceTimeout: number | null = null

const keyboardShortcuts: Record<string, () => void> = {
  // Single key shortcuts
  "/": () => {
    const searchButton = document.querySelector(".search-button") as HTMLElement
    if (searchButton) {
      searchButton.click()
      setTimeout(() => {
        const searchInput = document.querySelector(".search-bar") as HTMLInputElement
        searchInput?.focus()
      }, 100)
    }
  },
  r: () => {
    const readerModeButton = document.querySelector(".readermode") as HTMLElement
    readerModeButton?.click()
  },
  "?": () => {
    const helpModal = document.querySelector(".keyboard-help-modal") as HTMLElement
    if (helpModal) {
      helpModal.style.display = helpModal.style.display === "none" ? "flex" : "none"
    }
  },

  // Two-key sequences
  gh: () => {
    window.location.href = "/"
  },
  gt: () => {
    const firstTocLink = document.querySelector(".toc-content a") as HTMLElement
    firstTocLink?.focus()
  },
}

// Single key handlers for j/k navigation
function navigateSection(direction: "next" | "prev") {
  const headers = Array.from(
    document.querySelectorAll("article h1[id], article h2[id], article h3[id]"),
  )

  if (headers.length === 0) return

  const currentScrollPos = window.scrollY
  let targetHeader: Element | null = null

  if (direction === "next") {
    targetHeader =
      headers.find((header) => {
        const rect = header.getBoundingClientRect()
        return rect.top > 100
      }) || null
  } else {
    // prev
    targetHeader =
      [...headers]
        .reverse()
        .find((header) => {
          const rect = header.getBoundingClientRect()
          return rect.top < -100
        }) || headers[0]
  }

  if (targetHeader) {
    targetHeader.scrollIntoView({ behavior: "smooth", block: "start" })
  }
}

function handleKeyPress(e: KeyboardEvent) {
  // Ignore if user is typing in an input field
  const target = e.target as HTMLElement
  if (
    target.tagName === "INPUT" ||
    target.tagName === "TEXTAREA" ||
    target.isContentEditable
  ) {
    return
  }

  const key = e.key

  // Handle single-key shortcuts that don't require sequence
  if (key === "j") {
    e.preventDefault()
    navigateSection("next")
    return
  }

  if (key === "k") {
    e.preventDefault()
    navigateSection("prev")
    return
  }

  // Handle key sequences (g + h, g + t)
  if (sequenceTimeout) {
    clearTimeout(sequenceTimeout)
  }

  keySequence += key

  // Check if we have a matching shortcut
  if (keyboardShortcuts[keySequence]) {
    e.preventDefault()
    keyboardShortcuts[keySequence]()
    keySequence = ""
  } else if (keySequence.length === 1) {
    // Check for single-key shortcuts
    if (keyboardShortcuts[key]) {
      e.preventDefault()
      keyboardShortcuts[key]()
      keySequence = ""
    } else {
      // Wait for potential second key
      sequenceTimeout = setTimeout(() => {
        keySequence = ""
      }, 1000)
    }
  } else {
    // Invalid sequence, reset
    keySequence = ""
  }
}

function closeHelpModal(e: MouseEvent) {
  const modal = document.querySelector(".keyboard-help-modal") as HTMLElement
  if (modal && e.target === modal) {
    modal.style.display = "none"
  }
}

document.addEventListener("nav", () => {
  document.addEventListener("keydown", handleKeyPress)
  const modal = document.querySelector(".keyboard-help-modal") as HTMLElement
  if (modal) {
    modal.addEventListener("click", closeHelpModal)
  }
  window.addCleanup(() => {
    document.removeEventListener("keydown", handleKeyPress)
    if (modal) {
      modal.removeEventListener("click", closeHelpModal)
    }
  })
})
