import type { Identifier, XYCoord } from "dnd-core"
import { FC, useRef } from "react"
import { useDrag, useDrop } from "react-dnd"
import {
  Card,
  CardHeader,
  IconButton,
  InputBase,
  MenuItem,
  Select,
  Typography,
  useTheme,
} from "@mui/material"
import { ActionsFormValues, HtmlElement } from "../../../interfaces.ts"
import {
  CLICK_EVENTS,
  INPUT_EVENTS,
  MOUSE_EVENTS,
} from "../../../content/constants.ts"
import { CloseIcon } from "../../../icons/close.tsx"
import { useFormContext } from "react-hook-form"

const ItemTypes = {
  CARD: "card",
}

export interface CardProps {
  index: number
  data: HtmlElement
  moveRow: (dragIndex: number, hoverIndex: number) => void
  deleteRow: (index: number) => void
}

interface DragItem {
  index: number
  id: string
  type: string
}

export const RecordedElementListItem: FC<CardProps> = ({
  index,
  moveRow,
  data,
  deleteRow,
}) => {
  const theme = useTheme()
  const ref = useRef<HTMLDivElement>(null)
  const { register, setValue } = useFormContext<ActionsFormValues>()

  const [{ handlerId }, drop] = useDrop<
    DragItem,
    void,
    { handlerId: Identifier | null }
  >({
    accept: ItemTypes.CARD,
    collect(monitor) {
      return {
        handlerId: monitor.getHandlerId(),
      }
    },

    hover(item: DragItem, monitor) {
      if (!ref.current) {
        return
      }
      const dragIndex = item.index
      const hoverIndex = index

      // Don't replace items with themselves
      if (dragIndex === hoverIndex) {
        return
      }

      // Determine rectangle on screen
      const hoverBoundingRect = ref.current?.getBoundingClientRect()

      // Get vertical middle
      const hoverMiddleY =
        (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2

      // Determine mouse position
      const clientOffset = monitor.getClientOffset()

      // Get pixels to the top
      const hoverClientY = (clientOffset as XYCoord).y - hoverBoundingRect.top

      // Only perform the move when the mouse has crossed half of the items height
      // When dragging downwards, only move when the cursor is below 50%
      // When dragging upwards, only move when the cursor is above 50%

      // Dragging downwards
      if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) {
        return
      }

      // Dragging upwards
      if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) {
        return
      }

      // Time to actually perform the action
      moveRow(dragIndex, hoverIndex)

      // Note: we're mutating the monitor item here!
      // Generally it's better to avoid mutations,
      // but it's good here for the sake of performance
      // to avoid expensive index searches.
      item.index = hoverIndex
    },
  })

  const [{ isDragging }, drag] = useDrag({
    type: ItemTypes.CARD,
    item: () => {
      return { id: data.id, index }
    },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  })

  const opacity = isDragging ? 0 : 1
  drag(drop(ref))

  return (
    <Card
      ref={ref}
      style={{ opacity }}
      sx={{
        padding: "10px 18px",
      }}
      data-handler-id={handlerId}
    >
      <CardHeader
        avatar={
          <Typography variant={"body1"} color={"textDisabled"}>
            {index + 1}
          </Typography>
        }
        action={
          <IconButton
            aria-label={"delete"}
            size={"small"}
            onClick={() => deleteRow(index)}
          >
            <CloseIcon fill={theme.palette.text.disabled} />
          </IconButton>
        }
        title={
          <Typography
            variant={"body1"}
            display={"flex"}
            flexWrap={"wrap"}
            gap={"8px"}
          >
            {[...CLICK_EVENTS, ...MOUSE_EVENTS].includes(data.action) ? (
              `Click on `
            ) : (
              <>
                {`Enter`}
                <InputBase
                  {...register(`actions.${index}.value`)}
                  defaultValue={data.value}
                  slotProps={{
                    input: {
                      sx: {
                        padding: "unset",
                        color: theme.palette.primary.main,
                      },
                    },
                  }}
                  inputComponent={(props) => {
                    return (
                      <input
                        {...props}
                        size={
                          // eslint-disable-next-line react/prop-types
                          (props["value"] || props.defaultValue || "").length
                        }
                      />
                    )
                  }}
                />
                {`in the`}
              </>
            )}
            <Select
              {...register(`actions.${index}.selectedSelector.key`)}
              defaultValue={data.selectedSelector.key}
              sx={{
                maxWidth: "calc(100vw - 180px)",
              }}
              slotProps={{
                input: {
                  sx: {
                    padding: "unset",
                    color: theme.palette.primary.main,
                    border: "none",
                    "& p": {
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    },
                  },
                },
              }}
              input={<InputBase />}
              renderValue={(selected) => {
                return (
                  <Typography variant={"body1"} color={"primary"}>
                    {selected}
                  </Typography>
                )
              }}
              onChange={(event) => {
                const select = data.selectors.find(
                  (value) => value.key == event.target.value,
                )
                if (!select) {
                  return
                }
                setValue(`actions.${index}.selectedSelector`, select)
              }}
            >
              {data.selectors.map((item) => {
                return (
                  <MenuItem
                    key={item.type}
                    value={item.key}
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                    }}
                  >
                    <Typography
                      variant={"body1"}
                      sx={{
                        textOverflow: "ellipsis",
                        maxWidth: "calc(100vw - 64px)",
                        overflow: "hidden",
                      }}
                    >
                      {item.key}
                    </Typography>
                    <Typography
                      variant={"body2"}
                      color={"textDisabled"}
                    >{`By: ${item.type}`}</Typography>
                  </MenuItem>
                )
              })}
            </Select>
            {INPUT_EVENTS.includes(data.action)
              ? "field"
              : `${data.tagName.toLowerCase()}`}
          </Typography>
        }
      />
    </Card>
  )
}
