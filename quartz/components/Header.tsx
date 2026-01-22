import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"

const Header: QuartzComponent = ({ children }: QuartzComponentProps) => {
  return children.length > 0 ? (
    <>
      <a href="#quartz-body" class="skip-to-content">
        Skip to content
      </a>
      <header>{children}</header>
    </>
  ) : null
}

Header.css = `
header {
  display: flex;
  flex-direction: row;
  align-items: center;
  margin: 2rem 0;
  gap: 1.5rem;
}

header h1 {
  margin: 0;
  flex: auto;
}

.skip-to-content {
  position: absolute;
  left: -9999px;
  z-index: 999;
  padding: 1em;
  background-color: var(--light);
  color: var(--dark);
  text-decoration: none;
  border-radius: 0.25rem;
  border: 1px solid var(--gray);
}

.skip-to-content:focus {
  left: 50%;
  transform: translateX(-50%);
  top: 1rem;
}
`

export default (() => Header) satisfies QuartzComponentConstructor
