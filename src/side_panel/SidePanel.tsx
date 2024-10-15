import { useEffect, useState } from "react"
import { Box, Button } from "@mui/material"

function SidePanel() {
  const [state, setState] = useState(false)
  const port = chrome.runtime.connect({ name: "ui-actions" })

  useEffect(() => {
    console.log("listener addded")
    port.onMessage.addListener((message, port) => {
      console.log("UI", { message, port })
      setState((prevState) => !prevState)
    })
  }, [port.onMessage])

  return (
    <Box
      sx={{
        width: "100%",
        height: "100%",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Button
        onClick={() => {
          port.postMessage({ command: "start-recording" })
        }}
      >
        {`${state ? "Pause" : "Start"} Recording`}
      </Button>
      <Button
        onClick={() => {
          port.postMessage({ command: "stop-recording" })
        }}
      >
        Stop Recording
      </Button>
    </Box>
  )
}

export default SidePanel
