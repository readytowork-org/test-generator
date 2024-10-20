import { FC } from "react"
import { Box, Button, ButtonGroup, Divider } from "@mui/material"
import {
  PAUSE_RECORDING,
  START_RECORDING,
  STOP_RECORDING,
} from "../constants.ts"
import { useSidePanel } from "./useSidePanel.tsx"
import { RecordedActionsList, renderChildrenWithHooksHoc } from "../components"
import { FormProvider } from "react-hook-form"
import { useRecordedActionsList } from "../components/organisms/RecordedActionsList/hook.tsx"
import { ActionsFormValues } from "../interfaces.ts"

const RecordedActionsListHoc = renderChildrenWithHooksHoc(
  RecordedActionsList,
  useRecordedActionsList,
)

const SidePanel: FC = () => {
  const { postActionMessage, recording, form } = useSidePanel()

  return (
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
              command: recording ? PAUSE_RECORDING : START_RECORDING,
            })
          }}
        >
          {`${recording ? "Pause" : "Start"} Recording`}
        </Button>
        <Button
          sx={{
            textTransform: "none",
          }}
          onClick={() => {
            postActionMessage({ command: STOP_RECORDING })
          }}
        >
          {"Stop Recording"}
        </Button>
      </ButtonGroup>
    </Box>
  )
}

export default SidePanel
