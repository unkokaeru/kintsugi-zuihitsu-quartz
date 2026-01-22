// @ts-ignore
import script from "./scripts/progressbar.inline"
import styles from "./styles/progressbar.scss"
import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"
import { classNames } from "../util/lang"

const ProgressBar: QuartzComponent = ({ displayClass }: QuartzComponentProps) => {
  return <div class={classNames(displayClass, "progress-bar")} role="progressbar" aria-label="Reading progress" />
}

ProgressBar.afterDOMLoaded = script
ProgressBar.css = styles

export default (() => ProgressBar) satisfies QuartzComponentConstructor
