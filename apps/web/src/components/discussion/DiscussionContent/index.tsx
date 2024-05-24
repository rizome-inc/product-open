import TabContext from "@mui/lab/TabContext";
import TabList from "@mui/lab/TabList";
import TabPanel from "@mui/lab/TabPanel";
import Box from "@mui/material/Box";
import Divider from "@mui/material/Divider";
import Tab from "@mui/material/Tab";
import * as React from "react";
import { DiscussionComments } from "../DiscussionComments";
import { DiscussionLinkedDocuments } from "../DiscussionLinkedDocuments";

export function DicussionContent() {
  // const { discussion } = useDiscussionContext();
  const [selectedIndex, setSelectedIndex] = React.useState<"discussion" | "linkedDocuments">(
    "discussion",
  );

  const onIndexChanged = (_: React.SyntheticEvent, value: "discussion" | "linkedDocuments") => {
    setSelectedIndex(value);
  };
  return (
    <Box>
      <TabContext value={selectedIndex.toString()}>
        <TabList onChange={onIndexChanged} value={selectedIndex}>
          <Tab value={"discussion"} label={"Discussion"} />
          <Tab value={"linkedDocuments"} label={"Linked Documents"} />
        </TabList>
        <Divider />
        <TabPanel sx={(theme) => ({ padding: theme.spacing(2, 0) })} value={"discussion"}>
          <DiscussionComments />
        </TabPanel>
        <TabPanel sx={(theme) => ({ padding: theme.spacing(2, 0) })} value={"linkedDocuments"}>
          <DiscussionLinkedDocuments />
        </TabPanel>
      </TabContext>
    </Box>
  );
}
