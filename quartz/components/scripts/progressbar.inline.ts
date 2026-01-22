function updateProgressBar() {
  const progressBar = document.querySelector(".progress-bar") as HTMLElement
  if (!progressBar) return

  const article = document.querySelector("article")
  if (!article) return

  const windowHeight = window.innerHeight
  const documentHeight = article.scrollHeight
  const scrollTop = window.scrollY
  const articleTop = article.offsetTop

  // Calculate how far through the article we've scrolled
  const scrollableHeight = documentHeight - windowHeight
  const scrolled = Math.max(0, scrollTop - articleTop)
  const progress = Math.min(100, (scrolled / scrollableHeight) * 100)

  progressBar.style.width = `${progress}%`
  progressBar.setAttribute("aria-valuenow", Math.round(progress).toString())
}

document.addEventListener("nav", () => {
  const progressBar = document.querySelector(".progress-bar") as HTMLElement
  if (progressBar) {
    progressBar.setAttribute("aria-valuemin", "0")
    progressBar.setAttribute("aria-valuemax", "100")
    progressBar.setAttribute("aria-valuenow", "0")
  }

  // Update on scroll
  updateProgressBar()
  window.addEventListener("scroll", updateProgressBar, { passive: true })
  window.addEventListener("resize", updateProgressBar, { passive: true })

  window.addCleanup(() => {
    window.removeEventListener("scroll", updateProgressBar)
    window.removeEventListener("resize", updateProgressBar)
  })
})
