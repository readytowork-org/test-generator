export type UiEvents =
  | "click"
  | "dblclick"
  | "change"
  | "select"
  | "submit"
  | "load"
  | "unload"

export const CLICK_EVENTS: UiEvents[] = ["click", "dblclick"]
export const INPUT_EVENTS: UiEvents[] = ["change", "select", "submit"]

export const elements = [
  "input",
  "textarea",
  "a",
  "button",
  "select",
  "option",
  "label",
  "h1",
  "h2",
  "h3",
  "h4",
  "h5",
  "h6",
  "div",
  "span",
  "img",
]
