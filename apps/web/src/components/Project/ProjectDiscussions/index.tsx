import EmptyState from "@/components/EmptyState";
import { ProjectModalType, useProjectContext } from "@/context/project";
import Box from "@mui/material/Box";
import React from "react";
import { DiscussionList } from "./presentation";

export function ProjectDiscussions() {
  const { project, setActiveModal, isLoadingDiscussions, discussions } = useProjectContext();
  const addDiscussonClicked = () => {
    setActiveModal(ProjectModalType.AddDiscussion);
  };

  const [showCompleted, setShowCompleted] = React.useState(false);

  // check whether there are any discussions in the project
  if (project && discussions && discussions?.length > 0) {
    // if incomplete discusssions exist, show them
    if (discussions.filter((e) => !e.completedAt).length > 0) {
      return (
        <Box>
          <DiscussionList
            project={project}
            addDiscussonClicked={addDiscussonClicked}
            discussions={discussions}
          />
        </Box>
      );
    }

    // if all discussion are completed, show an empty state, until the user asks to see the completed discussions
    if (!showCompleted) {
      return (
        <Box>
          <EmptyState
            action="Add new Discussion"
            actionId="createDiscussionStart1"
            onClick={addDiscussonClicked}
            title="All Discussions Are Complete"
            action2="View all discussions"
            onClick2={() => setShowCompleted(true)}
          />
        </Box>
      );
    }

    //if the user has asked to see the completed discussions, show them
    return (
      <Box>
        <DiscussionList
          project={project}
          addDiscussonClicked={addDiscussonClicked}
          discussions={discussions}
          showCompleted={true}
        />
      </Box>
    );
  }
  //if there are no discussions, show an initial empty list
  return (
    <Box>
      <EmptyState
        action="Add your first Discussion"
        actionId="createDiscussionStart1"
        message={[
          "Collaborate, share feedback, and make decisions",
          "Track these processes for future reference",
        ]}
        onClick={addDiscussonClicked}
        title="Discussions"
      />
    </Box>
  );
}
