import { useEffect, useState } from "react"
import {
  RECORDED_EVENT,
  RECORDING_STARTED,
  RECORDING_STOPPED,
  UI_ACTIONS_PORT,
} from "../constants.ts"
import { ActionsFormValues, PortMessage } from "../interfaces.ts"
import { useForm, UseFormReturn } from "react-hook-form"
import Port = chrome.runtime.Port

export interface useSidePanelFn {
  recording: boolean
  postActionMessage: (msg: PortMessage) => void
  form: UseFormReturn<ActionsFormValues>
}

export const useSidePanel = (): useSidePanelFn => {
  const [recording, setRecording] = useState(false)
  const actionPort = chrome.runtime.connect({ name: UI_ACTIONS_PORT })
  const form = useForm<ActionsFormValues>({
    values: {
      actions: [],
    },
  })

  useEffect(() => {
    actionPort.onMessage.addListener((msg: PortMessage) => {
      switch (msg.command) {
        case RECORDING_STARTED:
          setRecording(true)
          break
        case RECORDING_STOPPED:
          setRecording(false)
          break
      }
    })
  }, [actionPort.onMessage])

  useEffect(() => {
    console.log("added")
    chrome.runtime.onConnect.addListener(async (port: Port) => {
      console.log("UI connected", port)

      port.onMessage.addListener(async (msg) => {
        console.log("addListener fire")

        switch (msg.command) {
          case RECORDED_EVENT: {
            const actions = form.getValues("actions")
            form.setValue("actions", [...actions, msg.data])
            break
          }
        }
      })
    })
  }, [])

  const postActionMessage = (msg: PortMessage) => {
    actionPort.postMessage(msg)
  }

  return {
    recording,
    postActionMessage,
    form,
  }
}
