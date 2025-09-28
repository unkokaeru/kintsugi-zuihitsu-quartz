import { QuartzComponentConstructor, QuartzComponentProps } from "./types"

export default (() => {
  function SunlitEffect({ displayClass }: QuartzComponentProps) {
    return (
      <>
        <link rel="stylesheet" href="/static/styles/sunlit.css" />
        <script src="/static/js/sunlit.js" defer></script>
      </>
    )
  }

  SunlitEffect.css = `
    /* Include any additional styling needed */
  `

  return SunlitEffect
}) satisfies QuartzComponentConstructor
