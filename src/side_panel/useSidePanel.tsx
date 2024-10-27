import { useCallback, useEffect } from "react"
import {
  CODE_GENERATED,
  RECORDED_EVENT,
  RECORDING_STARTED,
  RECORDING_STOPPED,
  STOP_RECORDING,
  UI_ACTIONS_PORT,
} from "../constants.ts"
import { ActionsFormValues, HtmlElement, PortMessage } from "../interfaces.ts"
import { useForm, UseFormReturn } from "react-hook-form"
import Port = chrome.runtime.Port

export interface useSidePanelFn {
  postActionMessage: (msg: PortMessage) => void
  form: UseFormReturn<ActionsFormValues>
}

export const useSidePanel = (): useSidePanelFn => {
  const actionPort = chrome.runtime.connect({ name: UI_ACTIONS_PORT })
  const form = useForm<ActionsFormValues>({
    values: {
      actions: [],
      recording: false,
      codePreview: {
        preview: false,
        code: "",
      },
    },
  })

  useEffect(() => {
    actionPort.onMessage.addListener((msg: PortMessage) => {
      switch (msg.command) {
        case RECORDING_STARTED:
          form.setValue("recording", true)
          break
        case RECORDING_STOPPED:
          form.setValue("recording", false)
          break
        case CODE_GENERATED: {
          form.setValue("codePreview", {
            code: msg.data as string,
            preview: true,
          })
          break
        }
      }
    })
  }, [actionPort.onMessage])

  const handleRecordingsEvents = useCallback(
    async (port: Port) => {
      port.onMessage.addListener(async (msg: PortMessage) => {
        switch (msg.command) {
          case RECORDED_EVENT: {
            const actions = form.getValues("actions")
            form.setValue("actions", [...actions, msg.data as HtmlElement])
            break
          }
        }
      })
    },
    [form],
  )

  useEffect(() => {
    const has = chrome.runtime.onConnect.hasListener(handleRecordingsEvents)
    if (!has) {
      console.log("reg :: handleRecordingsEvents")
      chrome.runtime.onConnect.addListener(handleRecordingsEvents)
    }
  }, [handleRecordingsEvents])

  const postActionMessage = useCallback((msg: PortMessage) => {
    console.log("actions", form.getValues("actions"))

    actionPort.postMessage({
      ...msg,
      data: msg.command === STOP_RECORDING ? form.getValues("actions") : null,
    })
  }, [])

  return {
    postActionMessage,
    form,
  }
}
