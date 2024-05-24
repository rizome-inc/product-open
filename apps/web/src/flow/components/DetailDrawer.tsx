import { ReadOnlyText } from "@/components/CustomForms/ReadOnlyText";
import { useFlowProjectEditingContext } from "@/context/flowProject";
import { ThreadMetadata, useSelf, useThreads, useUpdateMyPresence } from "@/liveblocks.config";
import { Composer, Thread } from "@liveblocks/react-comments";
import { TabContext, TabList, TabPanel } from "@mui/lab";
import { Tab } from "@mui/material";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { Box } from "@mui/system";
import * as React from "react";
import { useState } from "react";
import { DrawerModal } from "../../components/DrawerModal";
import { InputField } from "../../components/InputField";
import { useNodeSelections } from "../hooks/useSelectedByOther";
import useLocalGraphBridgeStore from "../store/localGraphBridgeStore";

export function DetailDrawer() {
  const { drawerIsOpen, setDrawerIsOpen, drawerSubtitle, drawerActiveNodeId, resetDrawerData } =
    useLocalGraphBridgeStore();

  const { isEditing, liveblocksStore } = useFlowProjectEditingContext();

  const updateMyPresence = useUpdateMyPresence();
  const [tabValue, setTabValue] = useState("1");

  const self = useSelf();
  const { selectionStatus } = useNodeSelections();
  const { selected, editorName } = selectionStatus(drawerActiveNodeId, self.id);

  const { nodes } = liveblocksStore();
  const nodeData = nodes.find((n) => n.id === (drawerActiveNodeId || null))?.data;

  // Update text if the corresponding bridge state updated or if selection status changed
  React.useEffect(() => {
    if (!selected && drawerActiveNodeId) {
      updateMyPresence({ selectedNodeId: drawerActiveNodeId });
    }
  }, [drawerActiveNodeId, selected]);

  const { onNodeDrawerValueEdit } = liveblocksStore();
  // Only load threads for this node
  const { threads } = useThreads(
    drawerActiveNodeId
      ? {
          query: {
            metadata: {
              nodeId: drawerActiveNodeId,
            },
          },
        }
      : {},
  );

  const onInputChanged = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (drawerActiveNodeId) {
      onNodeDrawerValueEdit(drawerActiveNodeId, {
        inputValue1: e.target.value,
      });
    }
  };

  const reset = () => {
    setTabValue("1");
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: string) => {
    setTabValue(newValue);
  };

  const onClose = () => {
    reset();
    setDrawerIsOpen(false);
    resetDrawerData();
    updateMyPresence({ selectedNodeId: null });
  };

  return (
    <DrawerModal
      anchor="right"
      onClose={onClose}
      open={drawerIsOpen}
      header={
        <Typography noWrap={true} variant="h2">
          {drawerSubtitle || "Detail"}
        </Typography>
      }
      headerActions={
        <Button variant="outlined" onClick={onClose}>
          <span>Close</span>
        </Button>
      }
      subHeader={
        selected && (
          <Typography sx={{ fontWeight: "light", fontStyle: "italic" }}>
            {editorName} is editing
          </Typography>
        )
      }
    >
      <TabContext value={tabValue}>
        <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
          <TabList onChange={handleTabChange} aria-label="lab API tabs example">
            <Tab label="Details" value="1" />
            <Tab label="Comments" value="2" />
          </TabList>
        </Box>
        <TabPanel value="1">
          <Stack direction={"column"} spacing={2}>
            <Typography component={"p"} sx={{ fontWeight: "bold" }}>
              Data: {nodeData?.value.inputValue1}
            </Typography>
            {isEditing ? (
              <InputField
                label="Additional Info"
                minRows={3}
                multiline={true}
                name="reason"
                onChange={onInputChanged}
                value={nodeData?.drawer.inputValue1 || ""}
                disabled={selected}
              />
            ) : (
              <ReadOnlyText key={`readonly-drawer-1`} value={nodeData?.drawer.inputValue1 || ""} />
            )}
          </Stack>
        </TabPanel>
        <TabPanel value="2">
          {drawerActiveNodeId && (
            <main>
              {threads?.map((thread) => (
                <Thread key={thread.id} thread={thread} className="thread" />
              ))}
              <Composer<ThreadMetadata>
                className="composer"
                metadata={{
                  nodeId: drawerActiveNodeId,
                }}
              />
            </main>
          )}
        </TabPanel>
      </TabContext>
    </DrawerModal>
  );
}
