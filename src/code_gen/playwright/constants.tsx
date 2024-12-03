import { ActionsMappings, FunctionMappings } from "../interface.ts"

export const PLAYWRIGHT_FUNCTIONS: FunctionMappings = {
  "text content": (value) => `getByText("${value}")`,
  css: (value) => `locator("css=${value}")`,
  id: (value) => `locator("#${value}")`,
  label: (value) => `getByLabel("${value}")`,
  placeholder: (value) => `getByPlaceholder("${value}")`,
  title: (value) => `getByTitle("${value}")`,
  testId: (value) => `getByTestId("${value}")`,
}

export const PLAYWRIGHT_ACTIONS: ActionsMappings = {
  change: (value) => `fill("${value}")`,
  click: () => `click()`,
  mousedown: () => `click()`,
  dblclick: () => `dblclick()`,
  select: (value) => `selectOption("${value}")`,
}
