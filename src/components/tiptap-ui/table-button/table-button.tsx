/* eslint-disable react-refresh/only-export-components */
import * as React from "react"
import { isNodeSelection, type Editor } from "@tiptap/react"

// --- Hooks ---
import { useTiptapEditor } from "@/hooks/use-tiptap-editor"

// --- Icons ---
import { TableIcon } from "@/components/tiptap-icons/table-icon"

// --- Lib ---
import { isNodeInSchema } from "@/lib/tiptap-utils"

// --- UI Primitives ---
import type { ButtonProps } from "@/components/tiptap-ui-primitive/button"
import { Button } from "@/components/tiptap-ui-primitive/button"

export interface TableButtonProps extends Omit<ButtonProps, "type"> {
  /**
   * The TipTap editor instance.
   */
  editor?: Editor | null
  /**
   * Optional text to display alongside the icon.
   */
  text?: string
  /**
   * Whether the button should hide when the table is not available.
   * @default false
   */
  hideWhenUnavailable?: boolean
  /**
   * Number of rows to insert in the table.
   * @default 3
   */
  rows?: number
  /**
   * Number of columns to insert in the table.
   * @default 3
   */
  cols?: number
  /**
   * Whether to include a header row.
   * @default true
   */
  withHeaderRow?: boolean
}

export function canInsertTable(editor: Editor | null): boolean {
  if (!editor) return false

  try {
    return editor.can().insertTable({ rows: 3, cols: 3, withHeaderRow: true })
  } catch {
    return false
  }
}

export function isTableActive(editor: Editor | null): boolean {
  if (!editor) return false
  return editor.isActive("table")
}

export function insertTable(
  editor: Editor | null,
  rows: number = 3,
  cols: number = 3,
  withHeaderRow: boolean = true
): boolean {
  if (!editor) return false
  return editor
    .chain()
    .focus()
    .insertTable({ rows, cols, withHeaderRow })
    .run()
}

export function isTableButtonDisabled(
  editor: Editor | null,
  canInsert: boolean,
  userDisabled: boolean = false
): boolean {
  if (!editor) return true
  if (userDisabled) return true
  if (!canInsert) return true
  return false
}

export function shouldShowTableButton(params: {
  editor: Editor | null
  hideWhenUnavailable: boolean
  tableInSchema: boolean
  canInsert: boolean
}): boolean {
  const { editor, hideWhenUnavailable, tableInSchema, canInsert } = params

  if (!tableInSchema || !editor) {
    return false
  }

  if (hideWhenUnavailable) {
    if (isNodeSelection(editor.state.selection) || !canInsert) {
      return false
    }
  }

  return Boolean(editor?.isEditable)
}

export function useTableState(
  editor: Editor | null,
  disabled: boolean = false,
  hideWhenUnavailable: boolean = false
) {
  const tableInSchema = isNodeInSchema("table", editor)

  const canInsert = canInsertTable(editor)
  const isDisabled = isTableButtonDisabled(editor, canInsert, disabled)
  const isActive = isTableActive(editor)

  const shouldShow = React.useMemo(
    () =>
      shouldShowTableButton({
        editor,
        hideWhenUnavailable,
        tableInSchema,
        canInsert,
      }),
    [editor, hideWhenUnavailable, tableInSchema, canInsert]
  )

  const handleInsert = React.useCallback(
    (rows: number = 3, cols: number = 3, withHeaderRow: boolean = true) => {
      if (!isDisabled && editor) {
        return insertTable(editor, rows, cols, withHeaderRow)
      }
      return false
    },
    [editor, isDisabled]
  )

  const shortcutKey = "Ctrl-Alt-t"
  const label = "Insert Table"

  return {
    tableInSchema,
    canInsert,
    isDisabled,
    isActive,
    shouldShow,
    handleInsert,
    shortcutKey,
    label,
  }
}

export const TableButton = React.forwardRef<HTMLButtonElement, TableButtonProps>(
  (
    {
      editor: providedEditor,
      text,
      hideWhenUnavailable = false,
      rows = 3,
      cols = 3,
      withHeaderRow = true,
      className = "",
      disabled,
      onClick,
      children,
      ...buttonProps
    },
    ref
  ) => {
    const editor = useTiptapEditor(providedEditor)

    const {
      isDisabled,
      isActive,
      shouldShow,
      handleInsert,
      shortcutKey,
      label,
    } = useTableState(editor, disabled, hideWhenUnavailable)

    const handleClick = React.useCallback(
      (e: React.MouseEvent<HTMLButtonElement>) => {
        onClick?.(e)

        if (!e.defaultPrevented && !isDisabled) {
          handleInsert(rows, cols, withHeaderRow)
        }
      },
      [onClick, isDisabled, handleInsert, rows, cols, withHeaderRow]
    )

    if (!shouldShow || !editor || !editor.isEditable) {
      return null
    }

    return (
      <Button
        type="button"
        className={className.trim()}
        disabled={isDisabled}
        data-style="ghost"
        data-active-state={isActive ? "on" : "off"}
        data-disabled={isDisabled}
        role="button"
        tabIndex={-1}
        aria-label="table"
        aria-pressed={isActive}
        tooltip={label}
        shortcutKeys={shortcutKey}
        onClick={handleClick}
        {...buttonProps}
        ref={ref}
      >
        {children || (
          <>
            <TableIcon className="tiptap-button-icon" />
            {text && <span className="tiptap-button-text">{text}</span>}
          </>
        )}
      </Button>
    )
  }
)

TableButton.displayName = "TableButton"

export default TableButton
