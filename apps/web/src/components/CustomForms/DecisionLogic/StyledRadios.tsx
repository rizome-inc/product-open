import { useProjectEditingContext } from "@/context/project";
import { Radio, RadioGroup, Stack, SxProps, Theme, Typography } from "@mui/material";
import * as React from "react";
import { DL_ReadOnlyText } from "./DL_ReadOnlyText";

type RadioLabelProps = {
  title: string;
  description: string;
};

type Props = {
  handleOnChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  inputs: RadioLabelProps[];
  defaultValue?: string;
  sx?: SxProps<Theme>;
  longDescription?: boolean;
};

export const StyledRadioGroup = ({
  handleOnChange,
  inputs,
  defaultValue,
  sx,
  longDescription,
}: Props) => {
  const { isEditing } = useProjectEditingContext();

  if (isEditing) {
    return (
      <RadioGroup onChange={handleOnChange} defaultValue={defaultValue ?? inputs[0].title} sx={sx}>
        {inputs.map(({ title, description }, index) => {
          return (
            <Stack direction="row" key={`styled-radio-${index}`}>
              <Radio
                value={title}
                sx={{
                  paddingTop: 0,
                  paddingLeft: 0,
                  paddingBottom: 0,
                  marginTop: longDescription ? "-14px" : 0,
                  marginBottom: "25px", // a bit magic / hacky
                  "&.Mui-checked": {
                    color: (theme) => theme.palette.highlight?.main,
                  },
                  "&:hover": {
                    backgroundColor: "transparent",
                  },
                }}
              />
              <Stack
                sx={{
                  marginTop: longDescription ? "4px" : "1px",
                }}
              >
                <Typography>{title}</Typography>
                <Typography color={(theme) => theme.palette.text.secondary}>
                  {description}
                </Typography>
              </Stack>
            </Stack>
          );
        })}
      </RadioGroup>
    );
  } else {
    return <DL_ReadOnlyText value={defaultValue} />;
  }
};
