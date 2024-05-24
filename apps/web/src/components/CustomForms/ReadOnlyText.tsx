import { SxProps, Theme, Typography } from "@mui/material";

export const ReadOnlyText = ({ value, sx }: { value?: string; sx?: SxProps<Theme> }) => {
  return (
    <>
      {value && value.length > 0 ? (
        value.split("\n").map((line, i) => (
          <Typography className="multilineText" sx={sx} key={i}>
            {line}
          </Typography>
        ))
      ) : (
        <Typography sx={sx} component="p" variant="tertiary">
          {"—"}
        </Typography>
      )}
    </>
  );
};

/*
calulated at end option:
export const ReadOnlyText = ({ value, sx }: { value?: string, sx?: SxProps<Theme>; }) => {
  let content = ['–'];
  if (value) {
    content = value.split('\n');
  }

  return content.map((line) => {
    return <Typography sx={sx}>{line}</Typography>;
  });
}*/

/*
css-only option:

export const ReadOnlyText = ({ value, sx }: { value?: string, sx?: SxProps<Theme>; }) => {
  return <Typography sx={{'white-space': 'pre-line'}} variant={!value ? 'tertiary' : undefined}>{value || '—'}</Typography>
}
*/
