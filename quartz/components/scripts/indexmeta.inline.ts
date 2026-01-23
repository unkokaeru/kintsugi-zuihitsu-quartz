// Move content-meta below H1 on index page
document.addEventListener("nav", () => {
  if (document.body.getAttribute("data-slug") !== "index") return

  const contentMeta = document.querySelector(".page-header .content-meta") as HTMLElement
  const articleH1 = document.querySelector("article > h1:first-of-type") as HTMLElement

  if (contentMeta && articleH1) {
    // Clone the content-meta to show it after the H1
    const clonedMeta = contentMeta.cloneNode(true) as HTMLElement
    clonedMeta.classList.add("index-content-meta")
    clonedMeta.style.display = "block"
    clonedMeta.style.textAlign = "center"
    clonedMeta.style.marginTop = "0.5rem"
    clonedMeta.style.marginBottom = "1.5rem"
    clonedMeta.style.fontSize = "0.9rem"
    clonedMeta.style.opacity = "0.8"

    // Insert after the H1
    articleH1.insertAdjacentElement("afterend", clonedMeta)
  }
})
