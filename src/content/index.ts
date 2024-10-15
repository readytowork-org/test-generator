import { UI_EVENTS, uiEvents } from "./constants.ts"

declare global {
  interface Window {
    pptRecorderAddedControlListeners: boolean
    eventListeners: EventRecorder
  }
}

interface HtmlElement {
  selector: unknown
  value: string
  tagName: string
  targetType: string
  action: string
  keyCode: number | null
  href: unknown
  coordinates: unknown
  targetObject: HTMLInputElement
  control?: string
}

interface Data {
  command: string
  data?: HtmlElement
}

export class EventRecorder {
  previousEvent: Event | undefined
  constructor() {
    console.log("added")
    this.boot()
  }

  boot = () => {
    if (!window.pptRecorderAddedControlListeners) {
      this.addWindowEventListeners(uiEvents)
      window.pptRecorderAddedControlListeners = true
    }
  }

  addWindowEventListeners = (events: UI_EVENTS[]) => {
    events.forEach((type) => {
      window.addEventListener(type, this.recordEvent, true)
    })
  }

  recordEvent = (e: WindowEventMap[UI_EVENTS]): void => {
    if (this.previousEvent && this.previousEvent.timeStamp === e.timeStamp) {
      return
    }

    this.previousEvent = e

    const target = e.target as HTMLInputElement & HTMLAnchorElement

    const keyCode = (e as KeyboardEvent).keyCode

    const selector = ""

    const msg: HtmlElement = {
      selector: selector,
      value: target!.value,
      tagName: target!.tagName,
      targetType: target!.type,
      action: e.type,
      keyCode: keyCode ? keyCode : null,
      href: target!.href ? target!.href : null,
      coordinates: getCoordinates(e),
      targetObject: target,
    }

    this.sendDataToBackend({ data: msg, command: "record-event" })
  }

  sendDataToBackend = (data: Data): void => {
    try {
      if (chrome.runtime && chrome.runtime.onConnect) {
        chrome.runtime.sendMessage(data)
      }
    } catch (err) {
      console.debug("caught error", err)
    }
  }
}

interface Coordinates {
  [key: Event["type"]]: boolean
}

function getCoordinates(evt: WindowEventMap[UI_EVENTS]) {
  const eventsWithCoordinates: Coordinates = {
    mouseup: true,
    mousedown: true,
    mousemove: true,
    mouseover: true,
  }

  const _evt = evt as MouseEvent

  return eventsWithCoordinates[evt.type]
    ? { x: _evt.clientX, y: _evt.clientY }
    : null
}

window.eventListeners = new EventRecorder()
