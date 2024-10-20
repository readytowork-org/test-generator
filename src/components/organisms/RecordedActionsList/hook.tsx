import { CardProps } from "../../atoms"
import {
  FieldArrayWithId,
  useFieldArray,
  useFormContext,
} from "react-hook-form"
import { ActionsFormValues } from "../../../interfaces.ts"

export interface UseRecordedActionsListFn
  extends Pick<CardProps, "moveRow" | "deleteRow"> {
  fields: FieldArrayWithId<ActionsFormValues, "actions", "id">[]
}

export const useRecordedActionsList = (): UseRecordedActionsListFn => {
  const { control } = useFormContext<ActionsFormValues>()

  const { fields, remove, move } = useFieldArray({
    control,
    name: "actions",
  })

  return {
    moveRow: move,
    deleteRow: remove,
    fields,
  }
}
