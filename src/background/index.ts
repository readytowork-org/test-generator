let activeTabId: number | undefined = undefined

interface PortMessage {
  command: string
}

class BackgroundWorker {
  constructor() {
    chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true })
    this.listenToPort()
  }

  listenToPort = () => {
    chrome.runtime.onConnect.addListener(async (port) => {
      console.log(
        port.name,
        port.sender,
        await chrome.tabs.query({ active: true, currentWindow: true }),
      )
      port.onMessage.addListener(async (msg) => {
        console.log("port", { msg })

        if (port.name === "ui-actions") {
          this.handleUIActions(port, msg)
        }

        if (port.name === "recordings") {
          this.handleContentActions(port, msg)
        }
      })
    })
  }

  handleContentActions = async (
    port: chrome.runtime.Port,
    msg: PortMessage,
  ) => {
    console.log(port, msg)
  }

  handleUIActions = async (port: chrome.runtime.Port, msg: PortMessage) => {
    switch (msg.command) {
      case "start-recording": {
        await this.injectContentScript()

        console.log("sender", port.sender)
        port.postMessage({
          command: "recording-started",
          data: activeTabId,
        })
        break
      }

      case "stop-recording": {
        activeTabId = undefined
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

    await chrome.scripting.executeScript({
      target: { tabId: tabs[0].id! },
      files: ["src/content/index.js"],
    })
  }
}

new BackgroundWorker()
console.log("called", new Date().toISOString())
