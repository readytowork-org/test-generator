import {
  CODE_GENERATED,
  RECORDED_EVENT,
  RECORDING_PORT,
  RECORDING_STARTED,
  RECORDING_STOPPED,
  START_RECORDING,
  STOP_RECORDING,
  UI_ACTIONS_PORT,
} from "../constants.ts"
import { HtmlElement, PortMessage, TestFramework } from "../interfaces.ts"
import { Playwright } from "../code_gen/playwright"
import Tab = chrome.tabs.Tab

class BackgroundWorker {
  testFramework: TestFramework = "playwright"
  constructor() {
    chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true })
    chrome.action.onClicked.addListener(this.addSideBar)
    this.listenToPort()
  }

  addSideBar = (tab: Tab) => {
    chrome.sidePanel.setOptions(
      {
        tabId: tab.id,
        path: "side_panel.html",
      },
      async () => {
        await chrome.sidePanel.open({
          tabId: tab.id,
          windowId: tab.windowId,
        })
      },
    )
  }

  listenToPort = () => {
    chrome.runtime.onConnect.addListener(async (port) => {
      port.onMessage.addListener(async (msg) => {
        switch (port.name) {
          case UI_ACTIONS_PORT:
            this.handleUIActions(port, msg)
            break

          case RECORDING_PORT:
            this.handleContentActions(port, msg)
            break
        }
      })
    })
  }

  handleContentActions = async (_: chrome.runtime.Port, msg: PortMessage) => {
    switch (msg.command) {
      case RECORDED_EVENT:
        console.log(RECORDING_PORT, msg)
        break
    }
  }

  handleUIActions = async (port: chrome.runtime.Port, msg: PortMessage) => {
    switch (msg.command) {
      case START_RECORDING: {
        await this.injectContentScript()

        port.postMessage({
          command: RECORDING_STARTED,
        })
        break
      }

      case STOP_RECORDING: {
        if (msg.data) {
          this.generateTestScript(port, msg.data as HtmlElement[])
        }

        port.postMessage({
          command: RECORDING_STOPPED,
        })
        break
      }
    }
  }

  generateTestScript = async (
    port: chrome.runtime.Port,
    actions: HtmlElement[],
  ) => {
    switch (this.testFramework) {
      case "playwright": {
        const test = new Playwright().generateCode(actions)
        port.postMessage({
          command: CODE_GENERATED,
          data: test,
        })
        break
      }
    }
  }

  injectContentScript = async () => {
    const tabs = await chrome.tabs.query({
      active: true,
      currentWindow: true,
    })

    await chrome.scripting.insertCSS({
      target: { tabId: tabs[0].id! },
      files: ["src/content/hover.css"],
    })

    await chrome.scripting.executeScript({
      target: { tabId: tabs[0].id! },
      files: ["src/content/index.js"],
    })
  }
}

new BackgroundWorker()
