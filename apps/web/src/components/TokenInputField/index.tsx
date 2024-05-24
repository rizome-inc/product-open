import { mergeSxStyles } from "@/util/misc";
import Collapse from "@mui/material/Collapse";
import Stack from "@mui/material/Stack";
import * as React from "react";
import { mergeRefs } from "react-merge-refs";
import { InputField, InputFieldProps } from "../InputField";

export type TokenProps = {
  onDelete: () => void;
};

export type TokenInputFieldProps<TDataItem extends { id: number | string }> = InputFieldProps & {
  items: TDataItem[];
  onRenderToken: (item: TDataItem, index: number, props: TokenProps) => React.ReactNode;
  onTransformInputValue: (value: string) => Promise<TDataItem | null>;
  onItemsChanged: (items: TDataItem[]) => void;
  wrapTokens?: boolean;
};

export function TokenInputField<TDataItem extends { id: number | string }>({
  items,
  onRenderToken,
  onTransformInputValue,
  onItemsChanged,
  inputRef: externalInputRef,
  onFocus,
  onBlur,
  sx,
  wrapTokens,
  ...restProps
}: TokenInputFieldProps<TDataItem>) {
  const inputRef = React.useRef<HTMLInputElement>();
  const [inputValue, setInputValue] = React.useState<string>("");
  const [focused, setFocused] = React.useState<boolean>(false);

  const tokenProps = React.useMemo(() => {
    return items.map<TokenProps>((item) => ({
      onDelete: () => onItemsChanged?.(items.filter((x) => x.id !== item.id)),
    }));
  }, [items, onItemsChanged]);

  const convertInputToDataItem = async () => {
    const inputValue = inputRef.current?.value?.trim();
    if (inputValue) {
      const item = await onTransformInputValue(inputValue);
      if (!item) {
        setInputValue("");
        return;
      }
      const nextItems = items.slice();
      nextItems.push(item);
      onItemsChanged(nextItems);
      setInputValue("");
      setTimeout(() => {
        inputRef.current?.scrollIntoView({ behavior: "smooth" });
      });
    }
  };

  const onInputKeyDown = async (event: React.KeyboardEvent<HTMLInputElement>) => {
    if ((event.key === "Tab" || event.key === " ") && inputValue) {
      event.preventDefault();
      await convertInputToDataItem();
    } else if (event.key === "Backspace" && !inputValue) {
      onItemsChanged(items.slice(0, items.length - 1));
    }
  };

  const onInputChanged = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  const blur = async (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    onBlur?.(e);
    if (!e.defaultPrevented) {
      setFocused(false);
      await convertInputToDataItem();
    }
  };

  const focus = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    onFocus?.(e);
    if (!e.defaultPrevented) {
      setFocused(true);
    }
  };

  const onClick = () => {
    if (!focused) {
      setFocused(true);
      setTimeout(() => {
        inputRef.current?.focus();
        inputRef.current?.scrollIntoView({ behavior: "smooth" });
      });
    }
  };

  const renderInputField = () => (
    <InputField
      {...restProps}
      inputRef={externalInputRef ? mergeRefs([inputRef, externalInputRef]) : inputRef}
      onChange={onInputChanged}
      onKeyDown={onInputKeyDown}
      sx={{
        padding: 0,
        "& .MuiTextField-root input": {
          padding: 0,
        },
        "& input": {
          minWidth: 100,
          padding: 0,
        },
        "& fieldset": {
          border: "none",
        },
      }}
      value={inputValue}
      focused={focused}
      onBlur={blur}
      onFocus={focus}
    />
  );
  return (
    <Stack
      sx={mergeSxStyles(
        (theme) => ({
          overflowX: wrapTokens ? "hidden" : "auto",
          flexWrap: wrapTokens ? "wrap" : undefined,
          gap: theme.spacing(0.5),
          padding: `${theme.spacing(0.5)} ${
            wrapTokens ? theme.spacing(0.5) : theme.spacing(4)
          } ${theme.spacing(0.5)} ${theme.spacing(0.5)}`,
          height: "33px",
          border: `2px solid ${focused ? theme.palette.primary.main : theme.palette.divider}`,
          borderRadius: `${theme.shape.borderRadius}px`,
          "&:hover": {
            border: `2px solid ${
              focused ? theme.palette.primary.main : theme.palette.text.primary
            }`,
          },
        }),
        sx,
      )}
      direction={"row"}
      onClick={onClick}
    >
      {items.map((item, i) => {
        return onRenderToken(item, i, tokenProps[i]);
      })}
      {wrapTokens ? (
        <Collapse in={focused || (!focused && !items?.length)}>{renderInputField()}</Collapse>
      ) : (
        renderInputField()
      )}
    </Stack>
  );
}
