// @ts-ignore
import script from "./scripts/keyboard.inline"
import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"
import { classNames } from "../util/lang"

const KeyboardHelp: QuartzComponent = ({ displayClass }: QuartzComponentProps) => {
  return (
    <div class={classNames(displayClass, "keyboard-help-modal")} style="display: none;">
      <div class="keyboard-help-content">
        <h2>Keyboard Shortcuts</h2>
        <button class="close-help" onClick="this.closest('.keyboard-help-modal').style.display='none'">
          ×
        </button>
        <div class="shortcuts-grid">
          <div class="shortcut-section">
            <h3>Navigation</h3>
            <div class="shortcut-item">
              <kbd>j</kbd>
              <span>Next section</span>
            </div>
            <div class="shortcut-item">
              <kbd>k</kbd>
              <span>Previous section</span>
            </div>
            <div class="shortcut-item">
              <kbd>g</kbd> <kbd>h</kbd>
              <span>Go home</span>
            </div>
            <div class="shortcut-item">
              <kbd>g</kbd> <kbd>t</kbd>
              <span>Focus Table of Contents</span>
            </div>
          </div>
          <div class="shortcut-section">
            <h3>Actions</h3>
            <div class="shortcut-item">
              <kbd>/</kbd>
              <span>Focus search</span>
            </div>
            <div class="shortcut-item">
              <kbd>r</kbd>
              <span>Toggle reader mode</span>
            </div>
            <div class="shortcut-item">
              <kbd>?</kbd>
              <span>Show this help</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

KeyboardHelp.css = `
.keyboard-help-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000;
  backdrop-filter: blur(4px);
}

.keyboard-help-content {
  background: var(--light);
  border-radius: 8px;
  padding: 2rem;
  max-width: 600px;
  width: 90%;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  position: relative;
}

.keyboard-help-content h2 {
  margin-top: 0;
  color: var(--dark);
  font-size: 1.5rem;
  margin-bottom: 1.5rem;
}

.keyboard-help-content h3 {
  color: var(--secondary);
  font-size: 1.1rem;
  margin-top: 0;
  margin-bottom: 1rem;
}

.close-help {
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: none;
  border: none;
  font-size: 2rem;
  color: var(--darkgray);
  cursor: pointer;
  line-height: 1;
  padding: 0;
  width: 2rem;
  height: 2rem;
}

.close-help:hover {
  color: var(--dark);
}

.shortcuts-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
}

@media (max-width: 600px) {
  .shortcuts-grid {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }
}

.shortcut-section {
  display: flex;
  flex-direction: column;
}

.shortcut-item {
  display: flex;
  align-items: center;
  margin-bottom: 0.75rem;
  gap: 0.75rem;
}

.shortcut-item kbd {
  background: var(--lightgray);
  border: 1px solid var(--gray);
  border-radius: 4px;
  padding: 0.25rem 0.5rem;
  font-family: var(--codeFont);
  font-size: 0.9rem;
  color: var(--dark);
  min-width: 2rem;
  text-align: center;
  box-shadow: 0 2px 0 var(--gray);
}

.shortcut-item span {
  color: var(--darkgray);
  font-size: 0.95rem;
}
`

KeyboardHelp.afterDOMLoaded = script

export default (() => KeyboardHelp) satisfies QuartzComponentConstructor
