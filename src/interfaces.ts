import { UiEvents } from "./content/constants.ts"

export type SelectorsType =
  | "testId"
  | "id"
  | "label"
  | "placeholder"
  | "css"
  | "text content"
  | "title"
  | "xpath"

export interface ActionsFormValues {
  actions: HtmlElement[]
}

export interface PortMessage {
  command: string
  data?: HtmlElement | object
}

export interface SelectorsObj {
  key: string
  type: SelectorsType
  priority: number
}

export type Selectors = SelectorsObj[]

export interface HtmlElement {
  selectors: Selectors
  value: string
  tagName: string
  targetType: string
  action: UiEvents
  keyCode: string | null
  href: unknown
  coordinates: unknown
  control?: string
  id: string
  selectedSelector: SelectorsObj
}

export interface Data {
  command: string
  data?: HtmlElement
}
