// @ts-nocheck
import sunlitScript from "./scripts/sunlit.inline"
import styles from "./styles/sunlit.scss"
import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"

const Sunlit: QuartzComponent = ({ displayClass }: QuartzComponentProps) => {
  return (
    <div id="sunlit-dappled-light" class={displayClass}>
      <div id="sunlit-glow"></div>
      <div id="sunlit-glow-bounce"></div>
      <div class="sunlit-perspective">
        <div id="sunlit-leaves">
          <svg style="width: 0; height: 0; position: absolute;">
            <defs>
              <filter id="sunlit-wind" x="-20%" y="-20%" width="140%" height="140%">
                <feTurbulence type="fractalNoise" numOctaves="2" seed="1">
                  <animate 
                    attributeName="baseFrequency" 
                    dur="16s" 
                    keyTimes="0;0.33;0.66;1"
                    values="0.005 0.003;0.01 0.009;0.008 0.004;0.005 0.003" 
                    repeatCount="indefinite" 
                  />
                </feTurbulence>
                <feDisplacementMap in="SourceGraphic">
                  <animate 
                    attributeName="scale" 
                    dur="20s" 
                    keyTimes="0;0.25;0.5;0.75;1" 
                    values="45;55;75;55;45"
                    repeatCount="indefinite" 
                  />
                </feDisplacementMap>
              </filter>
            </defs>
          </svg>
        </div>
        <div id="sunlit-blinds">
          <div class="sunlit-shutters">
            <div class="sunlit-shutter"></div>
            <div class="sunlit-shutter"></div>
            <div class="sunlit-shutter"></div>
            <div class="sunlit-shutter"></div>
            <div class="sunlit-shutter"></div>
            <div class="sunlit-shutter"></div>
            <div class="sunlit-shutter"></div>
            <div class="sunlit-shutter"></div>
            <div class="sunlit-shutter"></div>
            <div class="sunlit-shutter"></div>
            <div class="sunlit-shutter"></div>
            <div class="sunlit-shutter"></div>
            <div class="sunlit-shutter"></div>
            <div class="sunlit-shutter"></div>
            <div class="sunlit-shutter"></div>
            <div class="sunlit-shutter"></div>
          </div>
          <div class="sunlit-vertical">
            <div class="sunlit-bar"></div>
            <div class="sunlit-bar"></div>
          </div>
        </div>
      </div>
      <div id="sunlit-progressive-blur">
        <div></div>
        <div></div>
        <div></div>
        <div></div>
      </div>
    </div>
  )
}

Sunlit.beforeDOMLoaded = sunlitScript
Sunlit.css = styles

export default (() => Sunlit) satisfies QuartzComponentConstructor