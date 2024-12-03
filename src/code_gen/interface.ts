import { HtmlElement, SelectorsType } from "../interfaces.ts"
import { UiEvents } from "../content/constants.ts"

type FunctionsMap = (value: string) => string

export type FunctionMappings = {
  [key in SelectorsType]: FunctionsMap
}

export type ActionsMappings = {
  [key in UiEvents]: FunctionsMap
}

export interface TestContents {
  function: FunctionMappings
  action: ActionsMappings
}

export interface ICodeGen {
  readonly config: TestContents
}

export abstract class CodeGen implements ICodeGen {
  readonly config: TestContents

  constructor(config: TestContents) {
    this.config = config
  }

  public generateCode(_actions: HtmlElement[]): string {
    throw new Error("Function not implemented")
  }

  protected template(_title: string, _contents: string[]): string {
    throw new Error("Function not implemented")
  }
}
