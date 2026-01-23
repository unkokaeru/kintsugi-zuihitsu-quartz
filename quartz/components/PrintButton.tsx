// @ts-ignore
import script from "./scripts/printbutton.inline"
import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"
import { i18n } from "../i18n"
import { classNames } from "../util/lang"
import style from "./styles/print.scss"

const PrintButton: QuartzComponent = ({ displayClass, cfg }: QuartzComponentProps) => {
  return (
    <button
      class={classNames(displayClass, "print-button")}
      aria-label={i18n(cfg.locale).components.printButton?.title || "Print this page"}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
        aria-hidden="true"
      >
        <title>{i18n(cfg.locale).components.printButton?.title || "Print"}</title>
        <polyline points="6 9 6 2 18 2 18 9"></polyline>
        <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path>
        <rect x="6" y="14" width="12" height="8"></rect>
      </svg>
    </button>
  )
}

PrintButton.css = style
PrintButton.afterDOMLoaded = script

export default (() => PrintButton) satisfies QuartzComponentConstructor
