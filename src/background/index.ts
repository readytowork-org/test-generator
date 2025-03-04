import {
  CACHE_ACTION,
  CODE_GENERATED,
  GENERATE_CODE,
  RECORDED_EVENT,
  RECORDING_PORT,
  RECORDING_STARTED,
  RECORDING_STOPPED,
  START_RECORDING,
  STOP_RECORDING,
  UI_ACTIONS_PORT,
} from "../constants.ts"
import { HtmlElement, PortMessage } from "../interfaces.ts"
import { PlaywrightCodeGen } from "../code_gen/playwright"
import {
  PLAYWRIGHT_ACTIONS,
  PLAYWRIGHT_FUNCTIONS,
} from "../code_gen/playwright/constants.tsx"
import { CodeGen } from "../code_gen/interface.ts"
import Tab = chrome.tabs.Tab

class BackgroundWorker {
  testFramework: CodeGen = new PlaywrightCodeGen({
    action: PLAYWRIGHT_ACTIONS,
    function: PLAYWRIGHT_FUNCTIONS,
  })

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
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
          if (tabs.length > 0) {
            const pageUrl = tabs[0].url;
            console.log("Current webpage URL:", pageUrl);
      
            if (pageUrl) {
              chrome.storage.local.get(CACHE_ACTION, (result) => {
                const storedData =  JSON.parse(result[CACHE_ACTION] || "{}");
                const pageData = storedData[pageUrl] || null;
      
                console.log("Retrieved Data for Page:===", pageData, result,result[CACHE_ACTION] );
      
                port.postMessage({
                  command: RECORDING_STARTED,
                  data: pageData, // Send back the stored data if available
                });
              });
            } else {
              console.error("Error: pageUrl is undefined");
            port.postMessage({ command: RECORDING_STARTED });
            }
          } else {
            console.error("No active tab found.");
            port.postMessage({ command: RECORDING_STARTED });
          }
        });
        break
      }

      case STOP_RECORDING: {
        console.log(STOP_RECORDING, msg.data)
        if (msg.data) {
          this.generateTestScript(port, msg.data as HtmlElement[])
        }

        port.postMessage({
          command: RECORDING_STOPPED,
          data:msg.data
        })
        break
      }

      case GENERATE_CODE: {
        if (msg.data) {
          this.generateTestScript(port, msg.data as HtmlElement[])
        }
        break
      }
    }
  }

  generateTestScript = async (
    port: chrome.runtime.Port,
    actions: HtmlElement[],
  ) => {
    const test = this.testFramework.generateCode(actions)

    port.postMessage({
      command: CODE_GENERATED,
      data: test,
    })
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
