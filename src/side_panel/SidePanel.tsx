import { FC, useEffect } from "react"
import {
  Box,
  Button,
  ButtonGroup,
  Dialog,
  DialogContent,
  DialogTitle,
  Divider,
} from "@mui/material"
import { GENERATE_CODE, START_RECORDING, STOP_RECORDING } from "../constants.ts"
import { useSidePanel } from "./useSidePanel.tsx"
import { RecordedActionsList, renderChildrenWithHooksHoc } from "../components"
import { FormProvider } from "react-hook-form"
import { useRecordedActionsList } from "../components/organisms/RecordedActionsList/hook.tsx"
import { ActionsFormValues } from "../interfaces.ts"
import { CopyBlock, sunburst } from "react-code-blocks"

const RecordedActionsListHoc = renderChildrenWithHooksHoc(
  RecordedActionsList,
  useRecordedActionsList,
)

const SidePanel: FC = () => {
  const { postActionMessage, form } = useSidePanel()
  const recording = form.watch("recording")
  const codePreview = form.watch("codePreview")

  useEffect(() => {
    if (!codePreview.preview) {
      const id = setTimeout(() => {
        form.setValue("codePreview", {
          code: "",
          preview: codePreview.preview,
        })
      }, 1000)
      return () => clearTimeout(id)
    }
  }, [codePreview.preview])

  const onPreviewClose = () => {
    form.setValue("codePreview", {
      code: codePreview.code,
      preview: false,
    })
  }

  return (
    <>
      <Box
        display={"flex"}
        sx={{
          width: "100%",
          height: "100%",
          padding: "16px",
          alignItems: "center",
          flexDirection: "column",
        }}
      >
        <FormProvider<ActionsFormValues> {...form}>
          <RecordedActionsListHoc />
        </FormProvider>
        <Divider />
        <ButtonGroup variant={"contained"}>
          <Button
            sx={{
              textTransform: "none",
            }}
            onClick={() => {
              postActionMessage({
                command: recording ? STOP_RECORDING : START_RECORDING,
              })
            }}
          >
            {`${recording ? "Stop" : "Start"} Recording`}
          </Button>
          {recording && (
            <Button
              sx={{
                textTransform: "none",
              }}
              onClick={() => {
                postActionMessage({
                  command: GENERATE_CODE,
                })
              }}
            >
              {`Code Preview`}
            </Button>
          )}
        </ButtonGroup>
      </Box>
      <Dialog
        open={codePreview.preview}
        onClose={() => {
          onPreviewClose()
        }}
      >
        <DialogTitle sx={{ m: 0, p: 2 }} id={"customized-dialog-title"}>
          {"Code Preview"}
        </DialogTitle>
        <DialogContent
          dividers
          sx={{
            padding: "0px 0px 16px 0px",
          }}
        >
          <CopyBlock
            language={"tsx"}
            text={codePreview.code}
            showLineNumbers={true}
            theme={sunburst}
            codeBlock={true}
          />
        </DialogContent>
      </Dialog>
    </>
  )
}

export default SidePanel
