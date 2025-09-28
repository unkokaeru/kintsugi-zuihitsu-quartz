document.addEventListener("nav", () => {
  let isAnimating = false
  
  const triggerSunlitAnimation = () => {
    if (isAnimating) return
    isAnimating = true
    
    document.body.classList.add('sunlit-animation-ready')
    
    // Reset animation after it completes
    setTimeout(() => {
      isAnimating = false
    }, 2000) // 2 seconds to allow for the longer sunset animation
  }

  // Listen for theme changes
  document.addEventListener("themechange", (e: CustomEventMap["themechange"]) => {
    const theme = e.detail.theme
    
    if (theme === "dark") {
      document.body.classList.add('sunlit-dark')
    } else {
      document.body.classList.remove('sunlit-dark')
    }
    
    triggerSunlitAnimation()
  })

  // Set initial state based on current theme
  const currentTheme = document.documentElement.getAttribute("saved-theme")
  if (currentTheme === "dark") {
    document.body.classList.add('sunlit-dark')
  }
})