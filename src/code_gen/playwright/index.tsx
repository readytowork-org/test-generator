import { HtmlElement } from "../../interfaces.ts"
import { CodeGen } from "../interface.ts"

export class PlaywrightCodeGen extends CodeGen {
  template = (
    title: string = "",
    contents: string[],
  ) => `import { test } from '@playwright/test';

test(${title || "Test title"}}, async ({ page }) => {
${contents.map((value) => ` await page.${value}`).join("\n")}
});
`

  generateCode = (actions: HtmlElement[]) => {
    const decoded = actions.map((action) => {
      const _function = this.config.function[action.selectedSelector.type](
        action.selectedSelector.key,
      )
      const _action = this.config.action[action.action](action.value)

      return `${_function}.${_action};`
    })

    return this.template("", decoded)
  }
}
