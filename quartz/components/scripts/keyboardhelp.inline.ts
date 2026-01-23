document.addEventListener("nav", () => {
  const closeButtons = document.querySelectorAll(".close-help")
  
  closeButtons.forEach((button) => {
    const handleClick = () => {
      const modal = button.closest(".keyboard-help-modal") as HTMLElement
      if (modal) {
        modal.style.display = "none"
      }
    }
    
    button.addEventListener("click", handleClick)
    window.addCleanup(() => button.removeEventListener("click", handleClick))
  })
})
