import { ForkRight, GpsFixed, Route } from "@mui/icons-material";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { styled } from "@mui/material/styles";
import React from "react";
import { TemplateSchema } from "xylem";

const StyledListItem = styled(ListItem)(({ theme }) => ({
  "&:not(:first-of-type)": {
    marginTop: theme.spacing(1.5),
  },
}));

export function ProjectTemplateListItem({
  onClick,
  template,
}: {
  onClick?: (e: React.MouseEvent<HTMLElement>) => void;
  template: TemplateSchema;
}) {
  // fixme: these icons should be mapped to their Figma name in the theme somehow
  const templateIcon = (() => {
    switch (template.name) {
      case "Act":
        return <ForkRight color={"info"} />;
      case "Enable":
        return <Route color={"info"} />;
      case "Understand":
        return <GpsFixed color={"info"} />;
      default:
        return null;
    }
  })();
  return (
    <StyledListItem className="addProjectType">
      <ListItemButton onClick={onClick}>
        <ListItemIcon sx={{ marginRight: 2 }}>{templateIcon}</ListItemIcon>
        <Stack direction={"column"} spacing={1} sx={{ flexGrow: 1 }}>
          <Typography variant="em">{template.name}</Typography>
          <span>{template.description}</span>
          {template.example ? <Typography variant="tertiary">{template.example}</Typography> : null}
        </Stack>
        <ListItemIcon>
          <ArrowForwardIcon color="primary" />
        </ListItemIcon>
      </ListItemButton>
    </StyledListItem>
  );
}
