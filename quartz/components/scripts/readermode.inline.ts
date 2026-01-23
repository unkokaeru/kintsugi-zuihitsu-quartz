let isReaderMode = false

// Typography settings
interface ReaderSettings {
  fontSize: "small" | "medium" | "large"
  lineWidth: "narrow" | "medium" | "wide"
  background: "default" | "sepia" | "warm"
}

const defaultSettings: ReaderSettings = {
  fontSize: "medium",
  lineWidth: "medium",
  background: "default",
}

function loadSettings(): ReaderSettings {
  try {
    const saved = localStorage.getItem("reader-settings")
    return saved ? { ...defaultSettings, ...JSON.parse(saved) } : defaultSettings
  } catch {
    return defaultSettings
  }
}

function saveSettings(settings: ReaderSettings) {
  try {
    localStorage.setItem("reader-settings", JSON.stringify(settings))
  } catch {
    // Ignore storage errors
  }
}

function applySettings(settings: ReaderSettings) {
  const root = document.documentElement
  root.setAttribute("reader-font-size", settings.fontSize)
  root.setAttribute("reader-line-width", settings.lineWidth)
  root.setAttribute("reader-background", settings.background)
}

const emitReaderModeChangeEvent = (mode: "on" | "off") => {
  const event: CustomEventMap["readermodechange"] = new CustomEvent("readermodechange", {
    detail: { mode },
  })
  document.dispatchEvent(event)
}

document.addEventListener("nav", () => {
  const settings = loadSettings()
  applySettings(settings)

  const switchReaderMode = () => {
    isReaderMode = !isReaderMode
    const newMode = isReaderMode ? "on" : "off"
    document.documentElement.setAttribute("reader-mode", newMode)
    emitReaderModeChangeEvent(newMode)

    // Toggle settings panel
    const settingsPanel = document.querySelector(".reader-settings-panel") as HTMLElement
    if (settingsPanel) {
      settingsPanel.style.display = isReaderMode ? "block" : "none"
    }
  }

  for (const readerModeButton of document.getElementsByClassName("readermode")) {
    readerModeButton.addEventListener("click", switchReaderMode)
    window.addCleanup(() => readerModeButton.removeEventListener("click", switchReaderMode))
  }

  // Set initial state
  document.documentElement.setAttribute("reader-mode", isReaderMode ? "on" : "off")

  // Setup settings panel
  const settingsPanel = document.querySelector(".reader-settings-panel") as HTMLElement
  if (settingsPanel) {
    settingsPanel.style.display = "none"

    // Font size controls
    const fontSizeButtons = settingsPanel.querySelectorAll("[data-font-size]")
    fontSizeButtons.forEach((button) => {
      button.addEventListener("click", () => {
        const size = button.getAttribute("data-font-size") as ReaderSettings["fontSize"]
        settings.fontSize = size
        applySettings(settings)
        saveSettings(settings)
        updateActiveButtons()
      })
    })

    // Line width controls
    const lineWidthButtons = settingsPanel.querySelectorAll("[data-line-width]")
    lineWidthButtons.forEach((button) => {
      button.addEventListener("click", () => {
        const width = button.getAttribute("data-line-width") as ReaderSettings["lineWidth"]
        settings.lineWidth = width
        applySettings(settings)
        saveSettings(settings)
        updateActiveButtons()
      })
    })

    // Background controls
    const backgroundButtons = settingsPanel.querySelectorAll("[data-background]")
    backgroundButtons.forEach((button) => {
      button.addEventListener("click", () => {
        const bg = button.getAttribute("data-background") as ReaderSettings["background"]
        settings.background = bg
        applySettings(settings)
        saveSettings(settings)
        updateActiveButtons()
      })
    })

    function updateActiveButtons() {
      fontSizeButtons.forEach((btn) => {
        btn.classList.toggle("active", btn.getAttribute("data-font-size") === settings.fontSize)
      })
      lineWidthButtons.forEach((btn) => {
        btn.classList.toggle("active", btn.getAttribute("data-line-width") === settings.lineWidth)
      })
      backgroundButtons.forEach((btn) => {
        btn.classList.toggle(
          "active",
          btn.getAttribute("data-background") === settings.background,
        )
      })
    }

    updateActiveButtons()
  }
})
