import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import SidePanel from "./side_panel/SidePanel.tsx"
import { createTheme, CssBaseline, ThemeProvider } from "@mui/material"

const darkTheme = createTheme({
  palette: {
    mode: "dark",
  },
})

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <SidePanel />
    </ThemeProvider>
  </StrictMode>,
)
