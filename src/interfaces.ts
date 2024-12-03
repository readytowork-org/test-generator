import { UiEvents } from "./content/constants.ts"

export type SelectorsType =
  | "testId"
  | "id"
  | "label"
  | "placeholder"
  | "css"
  | "text content"
  | "title"

export interface ActionsFormValues {
  actions: HtmlElement[]
  recording: boolean
  codePreview: { code: string; preview: boolean }
}

export interface PortMessage {
  command: string
  data?: HtmlElement | HtmlElement[] | object | string
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
  role: string | null
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
