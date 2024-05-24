import { mergeSxStyles } from "@/util/misc";
import { Box, Stack, SxProps, Theme, Typography } from "@mui/material";

// Fixme: delete this file once we integrate the flow with the project UI
const InputDescriptionBox = ({
  children,
  sx,
}: {
  children: React.ReactNode;
  sx?: SxProps<Theme>;
}) => {
  return (
    <Stack
      bgcolor="#EEEEEE"
      color={(theme) => theme.palette.text.secondary}
      paddingX="16px"
      paddingY="6px"
      borderRadius="4px"
      sx={mergeSxStyles(
        {
          gridColumnStart: 2,
          gridRowStart: 1,
        },
        sx,
      )}
    >
      {children}
    </Stack>
  );
};

export type FormColumnsProps = {
  label?: string;
  inputElement?: React.ReactNode;
  description?: string | string[]; // variadic types aren't supported
  sx?: SxProps<Theme>;
  isEditing: boolean;
};

export const FormColumnsTemp = ({
  label,
  inputElement,
  description,
  sx,
  isEditing,
}: FormColumnsProps) => {
  return (
    <Stack sx={sx}>
      {label && (
        <Typography variant="em" sx={{ mb: 1, maxWidth: "60%" }}>
          {label}
        </Typography>
      )}
      <Stack direction="row" spacing="2em">
        <Box sx={{ flexBasis: "100%" }}>{inputElement}</Box>
        <Box sx={{ position: "absolute", right: "-260px", top: "0px", width: "240px" }}>
          {isEditing && description && (
            <InputDescriptionBox>
              {Array.isArray(description) ? (
                description.map((d, i) => {
                  if (i === 0)
                    return <Typography key={`input-description-typography-${i}`}>{d}</Typography>;
                  else
                    return (
                      <Typography key={`input-description-typography-${i}`} sx={{ mt: 2 }}>
                        {d}
                      </Typography>
                    );
                })
              ) : (
                <Typography>{description}</Typography>
              )}
            </InputDescriptionBox>
          )}
        </Box>
      </Stack>
    </Stack>
  );
};
