import * as React from "react"

/**
 * Bridges the Radix-style `asChild` API to Base UI's `render` prop.
 *
 * Base UI components don't understand `asChild`; instead they accept a `render`
 * prop that replaces the rendered element while merging the component's own
 * props (className, handlers, aria/data attributes) onto it. This helper lets
 * our shadcn-style wrappers keep exposing the familiar `asChild` prop:
 *
 *   <DropdownMenuTrigger asChild><Button>…</Button></DropdownMenuTrigger>
 *
 * When `asChild` is set and a single valid element child is passed, that element
 * is forwarded via `render`; otherwise children render normally.
 */
export function asChildProps(
  asChild: boolean | undefined,
  children: React.ReactNode
): { render: React.ReactElement } | { children: React.ReactNode } {
  if (asChild && React.isValidElement(children)) {
    return { render: children as React.ReactElement }
  }
  return { children }
}
