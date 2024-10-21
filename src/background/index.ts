import {
  RECORDED_EVENT,
  RECORDING_PORT,
  RECORDING_STARTED,
  RECORDING_STOPPED,
  START_RECORDING,
  STOP_RECORDING,
  UI_ACTIONS_PORT,
} from "../constants.ts"
import { PortMessage } from "../interfaces.ts"
import Tab = chrome.tabs.Tab
import Port = chrome.runtime.Port

let activeTabId: number | undefined = undefined

class BackgroundWorker {
  recordingPort?: Port
  uiActionsPort?: Port

  constructor() {
    // chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true })
    this.listenToPort()
  }

  listenToPort = () => {
    chrome.runtime.onConnect.addListener(async (port) => {
      switch (port.name) {
        case UI_ACTIONS_PORT:
          this.uiActionsPort = port
          this.uiActionsPort.onMessage.addListener(this.handleUIActions)
          break

        case RECORDING_PORT:
          this.recordingPort = port
          this.recordingPort.onMessage.addListener(this.handleContentActions)
          break
      }
    })
  }

  handleContentActions = async (msg: PortMessage) => {
    switch (msg.command) {
      case RECORDED_EVENT:
        console.log(RECORDING_PORT, msg)
        break
    }
  }

  handleUIActions = async (msg: PortMessage, port: chrome.runtime.Port) => {
    switch (msg.command) {
      case START_RECORDING: {
        const tabs = await chrome.tabs.query({
          active: true,
          currentWindow: true,
        })
        activeTabId = tabs[0].id!

        await this.injectContentScript(tabs[0])

        const msg = {
          command: RECORDING_STARTED,
          data: activeTabId,
        }
        port.postMessage(msg)

        this.recordingPort?.postMessage(msg)
        break
      }

      case STOP_RECORDING: {
        activeTabId = undefined
        port.postMessage({
          command: RECORDING_STOPPED,
        })
        break
      }
    }
  }

  injectContentScript = async (tab: Tab) => {
    activeTabId = tab.id!

    const ijScripts = await chrome.scripting.getRegisteredContentScripts()

    console.log({ ijScripts })
    if (ijScripts.length > 0) {
      return
    }

    await chrome.scripting.registerContentScripts([
      {
        id: "session-script",
        js: ["src/content/index.js"],
        matches: ["<all_urls>"],
        runAt: "document_idle",
        persistAcrossSessions: false,
      },
    ])
  }
}

new BackgroundWorker()
