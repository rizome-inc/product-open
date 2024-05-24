import { partition } from "@/util/array";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Collapse from "@mui/material/Collapse";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { styled } from "@mui/material/styles";
import dayjs from "dayjs";
import Link from "next/link";
import React from "react";
import { DiscussionSchema, ProjectSchema } from "xylem";

const StyledListItem = styled(ListItem)(({ theme }) => ({
  "&:not(:first-of-type)": {
    marginTop: theme.spacing(1.5),
  },
  "& a": {
    color: theme.palette.text.primary,
    textDecoration: "none",
    width: "100%",
  },
  "&.completed": {
    textDecoration: "line-through",
  },
}));

export function ProjectDiscussionListItem({
  onClick,
  project,
  discussion,
}: {
  onClick?: (e: React.MouseEvent<HTMLElement>) => void;
  project: ProjectSchema;
  discussion: DiscussionSchema;
}) {
  return (
    <StyledListItem className={discussion.completedAt ? "completed" : ""}>
      <Link href={`/projects/${project.id}/discussion/${discussion.id}`} passHref={true}>
        <ListItemButton onClick={onClick}>
          <ListItemText>
            <Typography>{discussion.name}</Typography>
          </ListItemText>
          <ListItemIcon>
            <ArrowForwardIcon color="primary" />
          </ListItemIcon>
        </ListItemButton>
      </Link>
    </StyledListItem>
  );
}

const maxInitialDiscussionCount = 5;
const discussionListItemHeight = 62;

export function DiscussionList({
  project,
  addDiscussonClicked,
  discussions,
  showCompleted = false,
}: {
  project: ProjectSchema;
  discussions?: DiscussionSchema[];
  addDiscussonClicked: () => void;
  showCompleted?: boolean;
}) {
  const [showAll, setShowAll] = React.useState<boolean>(showCompleted);
  const [openDiscussions, setOpenDiscussions] = React.useState<DiscussionSchema[]>([]);
  const [closedDiscussions, setClosedDiscussions] = React.useState<DiscussionSchema[]>([]);

  React.useMemo(() => {
    if (discussions) {
      const compareFn = (a: DiscussionSchema, b: DiscussionSchema) => {
        const dateA = dayjs(a.updatedAt);
        const dateB = dayjs(b.updatedAt);
        if (dateA.isAfter(dateB)) {
          return -1;
        } else if (dateA.isBefore(dateB)) {
          return 1;
        } else {
          return 0;
        }
      };
      // todo: ES2023 introduces the functional Array.toSorted method, but it's not universally supported yet so we use in-memory sort instead
      const [open, closed] = partition(discussions, (e) => !e.completedAt);
      open.sort(compareFn);
      closed.sort(compareFn);
      setOpenDiscussions(open);
      setClosedDiscussions(closed);
    }
  }, [discussions]);

  return (
    <Box>
      <Stack direction="column">
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Typography variant="em">Discussions</Typography>
          <Button id="createDiscussionStart2" variant="text" onClick={addDiscussonClicked}>
            Add
          </Button>
        </Box>
        <Collapse
          in={showAll}
          collapsedSize={Math.min(
            discussionListItemHeight * maxInitialDiscussionCount,
            openDiscussions ? discussionListItemHeight * openDiscussions.length : 0,
          )}
        >
          <List>
            {showAll
              ? openDiscussions.concat(closedDiscussions).map((discussion) => {
                  return (
                    <ProjectDiscussionListItem
                      project={project}
                      key={discussion.id}
                      discussion={discussion}
                    />
                  );
                })
              : openDiscussions.map((discussion) => {
                  return (
                    <ProjectDiscussionListItem
                      project={project}
                      key={discussion.id}
                      discussion={discussion}
                    />
                  );
                })}
          </List>
        </Collapse>
        {discussions &&
        (discussions.length > maxInitialDiscussionCount ||
          openDiscussions.length === 0 ||
          closedDiscussions.length > 0) ? (
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "flex-end" }}>
            <Button variant="text" onClick={() => setShowAll(!showAll)}>
              {showAll ? "Show less" : "Show all"}
            </Button>
          </Box>
        ) : null}
      </Stack>
    </Box>
  );
}
