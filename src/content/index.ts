import {
  CLICK_EVENTS,
  ELEMENTS_EVENTS,
  IGNORE_TAGS,
  INPUT_EVENTS,
  MOUSE_EVENTS,
  UiEvents,
} from "./constants.ts"
import { Data, HtmlElement, Selectors } from "../interfaces.ts"
import { RECORDED_EVENT, RECORDING_PORT } from "../constants.ts"
import { v4 as uuidv4 } from "uuid"

declare global {
  interface Window {
    pptRecorderAddedControlListeners: boolean
    clientScript: EventRecorder
  }
}

export class EventRecorder {
  previousEvent: Event | undefined
  port = chrome.runtime.connect({ name: RECORDING_PORT })

  constructor() {
    this.port.onMessage.addListener((message, port) => {
      console.log("backend to content", { message, port })
    })
    this.boot()
  }

  boot = () => {
    if (!window.pptRecorderAddedControlListeners) {
      this.addWindowEventListeners([
        ...CLICK_EVENTS,
        ...MOUSE_EVENTS,
        ...INPUT_EVENTS,
      ])
      this.addHoverEffects()
      window.pptRecorderAddedControlListeners = true
    }
  }

  addHoverEffects = () => {
    const testGenHover = document.createElement("div")
    testGenHover.id = "test-gen-hover"
    testGenHover.className = "test-gen-hover"

    const testGenHoverTooltip = document.createElement("span")
    testGenHoverTooltip.id = "test-gen-hover-tooltip"
    testGenHoverTooltip.className = "test-gen-hover-tooltip"

    document.body.appendChild(testGenHover)
    document.body.appendChild(testGenHoverTooltip)

    document.body.addEventListener("mouseover", this.onMouseOver)
  }

  onMouseOver = (event: MouseEvent) => {
    const element = event.target! as EventTarget as HTMLElement
    if (element) {
      const _testGenHover = document.getElementById("test-gen-hover")

      const _testGenHoverTooltip = document.getElementById(
        "test-gen-hover-tooltip",
      )

      const selector = getAllSelectors(element)
        .filter((value) => value.key != "")
        .sort((a, b) => a.priority - b.priority)

      if (
        !selector.length ||
        IGNORE_TAGS.includes(element!.tagName.toLowerCase())
      ) {
        _testGenHover!.style.display = "none"
        _testGenHoverTooltip!.innerHTML = ""
        _testGenHoverTooltip!.style.display = "none"
        return
      }

      const firstSelector = selector[0]

      if (!firstSelector["key"]) {
        _testGenHover!.style.display = "none"
        _testGenHoverTooltip!.innerHTML = ""
        _testGenHoverTooltip!.style.display = "none"
        return
      }

      const rect = element.getBoundingClientRect()

      _testGenHover!.style.top = `${document.documentElement.scrollTop + rect.top}px`
      _testGenHover!.style.left = `${document.documentElement.scrollLeft + rect.left}px`
      _testGenHover!.style.height = `${rect.height}px`
      _testGenHover!.style.width = `${rect.width}px`

      _testGenHover!.style.display = "block"
      _testGenHoverTooltip!.innerHTML = firstSelector.key
      _testGenHoverTooltip!.style.display = "block"

      _testGenHoverTooltip!.style.top = `calc(${_testGenHover!.style.top} + ${_testGenHover!.style.height} + 7px)`
      _testGenHoverTooltip!.style.left = _testGenHover!.style.left
    }
  }

  addWindowEventListeners = (events: UiEvents[]) => {
    events.forEach((type) => {
      window.addEventListener(type, this.recordEvent, true)
    })
  }

  recordEvent = (e: WindowEventMap[UiEvents]): void => {
    if (this.previousEvent && this.previousEvent.timeStamp === e.timeStamp) {
      return
    }
    this.previousEvent = e

    const target = e.target as HTMLInputElement & HTMLAnchorElement

    if (
      IGNORE_TAGS.includes(target!.tagName.toLowerCase()) ||
      !ELEMENTS_EVENTS[(target.role ?? target.tagName).toLowerCase()].includes(
        e.type as UiEvents,
      )
    ) {
      return
    }

    const keyCode = (e as KeyboardEvent).code

    const selector = getAllSelectors(target)
      .filter((value) => value.key != "")
      .sort((a, b) => a.priority - b.priority)

    if (!selector[0].key) {
      return
    }

    const msg: HtmlElement = {
      selectors: selector,
      selectedSelector: selector[0],
      value: target!.value,
      tagName: target!.tagName.toLowerCase(),
      role: target!.role,
      targetType: target!.type,
      action: e.type as UiEvents,
      keyCode: keyCode ? keyCode : null,
      href: target!.href ? target!.href : null,
      coordinates: getCoordinates(e),
      id: uuidv4(),
    }

    this.sendDataToBackend({ data: msg, command: RECORDED_EVENT })
  }

  sendDataToBackend = (data: Data): void => {
    try {
      if (this.port) {
        this.port.postMessage(data)
      }
    } catch (err) {
      console.debug("caught error", err)
    }
  }
}

interface Coordinates {
  [key: Event["type"]]: boolean
}

function getCoordinates(evt: WindowEventMap[UiEvents]) {
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

const getAllSelectors = (element: HTMLElement): Selectors => {
  const selectors: Selectors = []

  for (let i = 0; i < element.attributes.length; i++) {
    const attr = element.attributes[i]
    if (attr.name !== "id" && attr.name !== "class") {
      // Test ID (check for common variations)
      if (
        attr.name === "data-testid" ||
        attr.name === "data-cy" ||
        attr.name.toLowerCase().includes("testid")
      ) {
        selectors.push({
          key: attr.value,
          type: "testId",
          priority: 1,
        })
      }
    }
  }

  //  ID
  if (element.getAttribute("id")) {
    selectors.push({
      key: element.id,
      type: "id",
      priority: 2,
    })
  }

  if (["INPUT", "TEXTAREA", "SELECT"].includes(element.tagName)) {
    const label = document.querySelector(
      `label[for="${element.id}"]`,
    ) as HTMLInputElement
    if (label && label.textContent) {
      selectors.push({
        key: `"${label.textContent.trim()}"`,
        type: "label",
        priority: 3,
      })
    }
  }

  // Placeholder
  if (element.getAttribute("placeholder")) {
    selectors.push({
      key: `${element.getAttribute("placeholder")}`,
      type: "placeholder",
      priority: 4,
    })
  }

  // Title Attribute
  if (element.getAttribute("title")) {
    selectors.push({
      key: `${element.getAttribute("title")}`,
      type: "title",
      priority: 5,
    })
  }

  // Text Content (basic)
  if (element.textContent && element.textContent?.trim() !== "") {
    selectors.push({
      key: element.textContent.trim(),
      type: "text content",
      priority: 6,
    })
  }

  // Classes
  if (element.classList.length > 0) {
    selectors.push({
      key: Array.from(element.classList)
        .map((c) => `.${c}`)
        .join(""),
      type: "css",
      priority: 7,
    })
  }

  return selectors
}

window.clientScript = new EventRecorder()
