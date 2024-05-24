import { ReadOnlyText } from "@/components/CustomForms/ReadOnlyText";
import { useFlowProjectEditingContext } from "@/context/flowProject";
import { useSelf, useUpdateMyPresence } from "@/liveblocks.config";
import { Typography } from "@mui/material";
import { Box } from "@mui/system";
import { useEffect, useState } from "react";
import { NodeProps } from "reactflow";
import { ControlledSelect } from "../components/ControlledSelect";
import { useNodeSelections } from "../hooks/useSelectedByOther";
import { Base, OperatorNodeValue } from "../store/dataTypes";

// todo: see if react-flow has built-in escape key support for not editing / enter key for submitting
// todo: may want to inset the border to prevent pixelation
export default function OperatorNodeElement({ id, data }: NodeProps<Base<OperatorNodeValue>>) {
  const { isEditing, liveblocksStore } = useFlowProjectEditingContext();

  const { onNodeValueEdit } = liveblocksStore();
  const updateMyPresence = useUpdateMyPresence();

  const self = useSelf();
  const { selectionStatus } = useNodeSelections();
  const { selected, editorName } = selectionStatus(id, self.id);

  const [selectOpen, setSelectOpen] = useState(false);

  useEffect(() => {
    updateMyPresence({ selectedNodeId: selectOpen ? id : null });
  }, [id, selectOpen, updateMyPresence]);

  // hacky, but different for select.
  const onInputChange = (value: string) => {
    onNodeValueEdit<OperatorNodeValue>(id, {
      operator: value,
    });
  };

  return (
    <Box
      sx={(theme) => ({
        width: 192, // is this not relative?
        //height: 108,
        paddingBottom: 1.5, // this is relative
        border: 2, // and this is not?
        borderRadius: theme.shape.borderRadius,
        borderColor: theme.palette.primary.main,
        backgroundColor: "#fff",
      })}
    >
      <Box
        sx={(theme) => ({
          width: "100%",
          height: 29,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          paddingLeft: 1.5,
          paddingRight: 1.5,
          borderTopLeftRadius: "inherit",
          borderTopRightRadius: "inherit",
          backgroundColor: theme.palette.primary.light,
          color: theme.palette.primary.main,
        })}
      >
        <Typography>Operator</Typography>
      </Box>
      <Box
        sx={() => ({
          width: "100%",
          paddingTop: 1,
          paddingLeft: 1.5,
          paddingRight: 1.5,
        })}
      >
        {isEditing ? (
          <>
            <Typography variant="em" component={"label"}>
              Operator
            </Typography>
            <ControlledSelect
              open={selectOpen}
              setOpen={setSelectOpen}
              value={data.value?.operator || ""}
              onChange={onInputChange}
              disabled={selected}
              options={[
                {
                  label: "None",
                  value: "",
                },
                {
                  label: "Add",
                  value: "Add",
                },
                {
                  label: "Subtract",
                  value: "Subtract",
                },
                {
                  label: "Multiply",
                  value: "Multiply",
                },
                {
                  label: "Divide",
                  value: "Divide",
                },
              ]}
            />
          </>
        ) : (
          <ReadOnlyText value={data.value?.operator || ""} />
        )}
        {selected && (
          <Typography sx={{ marginTop: 1, fontWeight: "light", fontStyle: "italic" }}>
            {editorName} is editing
          </Typography>
        )}
      </Box>
    </Box>
  );
}
