export type UiEvents = "click" | "dblclick" | "change" | "select" | "mousedown"

export const CLICK_EVENTS: UiEvents[] = ["click"]
export const MOUSE_EVENTS: UiEvents[] = ["mousedown"]
export const INPUT_EVENTS: UiEvents[] = ["change", "select"]

export const ELEMENTS_EVENTS: { [k: string]: UiEvents[] } = {
  input: [...CLICK_EVENTS, ...INPUT_EVENTS],
  textarea: [...CLICK_EVENTS, ...INPUT_EVENTS],
  select: [...CLICK_EVENTS, ...INPUT_EVENTS],
  a: CLICK_EVENTS,
  button: CLICK_EVENTS,
  option: CLICK_EVENTS,
  label: CLICK_EVENTS,
  div: CLICK_EVENTS,
  span: CLICK_EVENTS,
  img: CLICK_EVENTS,
  li: CLICK_EVENTS,
  ul: CLICK_EVENTS,
  combobox: MOUSE_EVENTS,
  presentation: CLICK_EVENTS,
}

export const IGNORE_TAGS = ["BODY", "svg", "path"]
