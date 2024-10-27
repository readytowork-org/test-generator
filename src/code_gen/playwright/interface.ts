import { SelectorsType } from "../../interfaces.ts"
import { UiEvents } from "../../content/constants.ts"

type FunctionsMap = (value: string) => string

export type PlayWrightFunctionMappings = {
  [key in SelectorsType]: FunctionsMap
}

export type PlayWrightActionsMappings = {
  [key in UiEvents]: FunctionsMap
}

export interface TestContents {
  function: string
  action: string
}
