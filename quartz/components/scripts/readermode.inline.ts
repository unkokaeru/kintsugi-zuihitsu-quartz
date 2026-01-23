let isReaderMode = false

// Typography settings
interface ReaderSettings {
  fontSize: number // 0.8 to 1.4 rem
  lineWidth: number // 50 to 100 (percentage of available width)
  background: "default" | "sepia" | "warm"
}

const defaultSettings: ReaderSettings = {
  fontSize: 1.0,
  lineWidth: 60, // 60% of available width as default
  background: "default",
}

function loadSettings(): ReaderSettings {
  try {
    const saved = localStorage.getItem("reader-settings")
    if (saved) {
      const parsed = JSON.parse(saved)
      // Migrate old pixel-based values to percentage
      if (parsed.lineWidth > 100) {
        parsed.lineWidth = 60 // Reset to default percentage
      }
      return { ...defaultSettings, ...parsed }
    }
    return defaultSettings
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
  root.style.setProperty("--reader-font-size", `${settings.fontSize}rem`)
  root.style.setProperty("--reader-line-width", `${settings.lineWidth}%`)
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

    // Font size slider
    const fontSizeSlider = settingsPanel.querySelector("[data-setting=\"fontSize\"]") as HTMLInputElement
    if (fontSizeSlider) {
      fontSizeSlider.value = String(settings.fontSize)
      fontSizeSlider.addEventListener("input", () => {
        settings.fontSize = parseFloat(fontSizeSlider.value)
        applySettings(settings)
        saveSettings(settings)
      })
    }

    // Line width slider
    const lineWidthSlider = settingsPanel.querySelector("[data-setting=\"lineWidth\"]") as HTMLInputElement
    if (lineWidthSlider) {
      lineWidthSlider.value = String(settings.lineWidth)
      lineWidthSlider.addEventListener("input", () => {
        settings.lineWidth = parseFloat(lineWidthSlider.value)
        applySettings(settings)
        saveSettings(settings)
      })
    }

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
