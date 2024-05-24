import { useProjectEditingContext } from "@/context/project";
import { mergeSxStyles } from "@/util/misc";
import { Box, Stack, SxProps, Theme, Typography } from "@mui/material";

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
};

export const FormColumns = ({ label, inputElement, description, sx }: FormColumnsProps) => {
  const { isEditing } = useProjectEditingContext();
  return (
    <Stack sx={sx}>
      {label && (
        <Typography variant="em" sx={{ mb: 1, maxWidth: "60%" }}>
          {label}
        </Typography>
      )}
      <Stack direction="row" spacing="2em">
        <Box sx={{ flexBasis: "60%" }}>{inputElement}</Box>
        <Box sx={{ flexBasis: "40%" }}>
          {isEditing && description && (
            <InputDescriptionBox>
              {Array.isArray(description) ? (
                description.map((d, i) => {
                  if (i === 0) return <Typography key="fc-typog-1">{d}</Typography>;
                  else
                    return (
                      <Typography key="fc-typog-2" sx={{ mt: 2 }}>
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
