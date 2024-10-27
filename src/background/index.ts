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

let activeTabId: number | undefined = undefined

class BackgroundWorker {
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
          data: activeTabId,
        })
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

  injectContentScript = async () => {
    const tabs = await chrome.tabs.query({
      active: true,
      currentWindow: true,
    })
    activeTabId = tabs[0].id!

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
