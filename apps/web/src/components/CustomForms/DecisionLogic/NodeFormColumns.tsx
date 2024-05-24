import { useProjectEditingContext } from "@/context/project";
import { DecisionLogicAxis, DecisionLogicNode } from "@/types";
import AddIcon from "@mui/icons-material/Add";
import { Button, Stack } from "@mui/material";
import * as React from "react";
import { v4 as uuidgen } from "uuid";
import { FormColumns } from "../FormColumns";
import { NodeTextField } from "./NodeTextField";

type NodeFormColumnsProps = {
  axis: DecisionLogicAxis;
  noun: "actions" | "outcomes";
  nodes: DecisionLogicNode[];
  handleChange: (id: string, value: string) => void;
  handleAdd: () => void;
};

export const NodeFormColumns = (props: NodeFormColumnsProps) => {
  const key = React.useMemo(() => uuidgen(), []);

  const { axis, noun, nodes, handleChange, handleAdd } = props;
  const { isEditing } = useProjectEditingContext();

  if (axis !== "Discrete") return null;
  return (
    <>
      {isEditing ? (
        <FormColumns
          key={key}
          label={`Possible ${noun}`}
          inputElement={
            <Stack spacing={1}>
              {nodes.map((n, i) => {
                return (
                  <NodeTextField
                    key={n.id}
                    node={n}
                    handleInputChange={handleChange}
                    label={`${noun === "actions" ? "Action" : "Outcome"} ${i + 1}`}
                    sx={{ gridColumnStart: 1 }}
                  />
                );
              })}
              <Button
                variant="outlined"
                startIcon={<AddIcon />}
                onClick={handleAdd}
                sx={{
                  gridColumnStart: 1,
                  width: "66px",
                }}
              >
                Add
              </Button>
            </Stack>
          }
          description={`${
            noun === "actions"
              ? "Example: Reach out to customer"
              : "Example: Customer remains, Customer churns"
          }`}
        />
      ) : (
        <ul style={{ textAlign: "left", margin: 0 }}>
          {nodes
            .filter((n) => n.value.length > 0)
            .map((n) => (
              <li key={`read-action-${n.id}`}>{n.value}</li>
            ))}
        </ul>
      )}
    </>
  );
};
