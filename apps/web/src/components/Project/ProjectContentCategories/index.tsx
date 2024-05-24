import { useProjectContext } from "@/context/project";
import TabContext from "@mui/lab/TabContext";
import TabList from "@mui/lab/TabList";
import TabPanel from "@mui/lab/TabPanel";
import Box from "@mui/material/Box";
import Divider from "@mui/material/Divider";
import Tab from "@mui/material/Tab";
import * as React from "react";
import { ProjectContentCategory } from "../ProjectContentCategory";

export function ProjectContentCategories() {
  const { project } = useProjectContext();
  const [selectedIndex, setSelectedIndex] = React.useState<number>(0);

  const onIndexChanged = (e: React.SyntheticEvent, index: number) => {
    setSelectedIndex(index);
  };
  return (
    <Box>
      <TabContext value={selectedIndex.toString()}>
        <TabList onChange={onIndexChanged} value={selectedIndex}>
          {project?.content?.categories?.map((category, index) => {
            const baseProps = {
              id: `simple-tab-${index}`,
              "aria-controls": `simple-tabpanel-${index}`,
            };
            return (
              <Tab
                key={`${category.name}-${index}`}
                value={index.toString()}
                label={category.name}
                {...baseProps}
              />
            );
          })}
        </TabList>
        <Divider />
        {project?.content?.categories?.map((category, index) => {
          return (
            <TabPanel
              sx={(theme) => ({ padding: theme.spacing(2, 0) })}
              key={`${category.name}-${index}`}
              value={index.toString()}
            >
              <ProjectContentCategory category={category} />
            </TabPanel>
          );
        })}
      </TabContext>
    </Box>
  );
}
