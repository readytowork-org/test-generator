import { FC, useEffect } from "react"
import { Box } from "@mui/material"
import { HTML5Backend } from "react-dnd-html5-backend"
import { RecordedElementListItem } from "../../atoms"
import { DndProvider } from "react-dnd"
import { UseRecordedActionsListFn } from "./hook.tsx"

export const RecordedActionsList: FC<UseRecordedActionsListFn> = ({
  fields,
  moveRow,
  deleteRow,
}) => {
  useEffect(() => {
    const list = document.getElementById("action-list")
    if (list) {
      list.scrollTo(0, list.scrollHeight)
    }
  }, [fields])

  return (
    <Box
      id={"action-list"}
      onSubmit={(event) => {
        event.preventDefault()
      }}
      sx={{
        width: "100%",
        height: "100%",
        overflow: "hidden auto",
        marginBottom: "16px",
        scrollBehavior: "smooth",

        "& > :not(:last-child)": {
          marginBottom: "8px",
        },
      }}
    >
      <DndProvider backend={HTML5Backend}>
        {fields.map((action, index) => {
          return (
            <RecordedElementListItem
              key={action.id}
              data={action}
              index={index}
              moveRow={moveRow}
              deleteRow={deleteRow}
            />
          )
        })}
      </DndProvider>
    </Box>
  )
}
