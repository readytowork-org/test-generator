import {
  PlayWrightActionsMappings,
  PlayWrightFunctionMappings,
} from "./interface.ts"

export const PLAY_WRIGHT_FUNCTIONS: PlayWrightFunctionMappings = {
  "text content": (value) => `getByText("${value}")`,
  css: (value) => `locator("css=${value}")`,
  id: (value) => `locator(#"${value}")`,
  label: (value) => `getByLabel("${value}")`,
  placeholder: (value) => `getByPlaceholder("${value}")`,
  title: (value) => `getByTitle("${value}")`,
  testId: (value) => `getByTestId("${value}")`,
}

export const PLAY_WRIGHT_ACTIONS: PlayWrightActionsMappings = {
  change: (value) => `fill("${value}")`,
  click: () => `click()`,
  dblclick: () => `dblclick()`,
  select: (value) => `selectOption("${value}")`,
}
