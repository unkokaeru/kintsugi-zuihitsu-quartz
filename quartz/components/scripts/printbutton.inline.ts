document.addEventListener("nav", () => {
  const printButtons = document.querySelectorAll(".print-button")
  
  printButtons.forEach((button) => {
    const handleClick = () => {
      window.print()
    }
    
    button.addEventListener("click", handleClick)
    window.addCleanup(() => button.removeEventListener("click", handleClick))
  })
})
