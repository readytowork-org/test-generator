import { HtmlElement } from "../../interfaces.ts"
import { PLAY_WRIGHT_ACTIONS, PLAY_WRIGHT_FUNCTIONS } from "./constants.tsx"

export class Playwright {
  #template = (contents: string[]) => `import { test } from '@playwright/test';

test({{title}}, async ({ page }) => {
${contents.map((value) => ` await page.${value}`).join("\n")}
});
`

  generateCode = (actions: HtmlElement[]) => {
    const decoded = actions.map((action) => {
      const _function = PLAY_WRIGHT_FUNCTIONS[action.selectedSelector.type](
        action.selectedSelector.key,
      )
      const _action = PLAY_WRIGHT_ACTIONS[action.action](action.value)

      return `${_function}.${_action};`
    })

    return this.#template(decoded)
  }
}
