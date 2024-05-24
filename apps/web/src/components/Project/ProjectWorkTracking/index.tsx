import { InputField } from "@/components/InputField";
import { KeyValue } from "@/components/KeyValue";
import { useProjectEditingContext } from "@/context/project";
import Box from "@mui/material/Box";
import Link from "@mui/material/Link";
import Stack from "@mui/material/Stack";
import * as React from "react";
import { WorkTrackingSchema } from "xylem";

export const ProjectWorkTracking = function ProjectWorkTracking() {
  const { isEditing, workTracking, setWorkTracking } = useProjectEditingContext();

  const onChange = (key: keyof WorkTrackingSchema) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setWorkTracking((v) => {
      const value = e.target.value || "";
      return {
        ...(v || {}),
        [key]: value ? value : null, // fixme: is this a domain leak from prisma?
      };
    });
  };

  return (
    <Box>
      {isEditing && (
        <Stack spacing={2} direction={"column"}>
          <InputField
            label="Work tracking URL"
            value={workTracking?.workTrackingUrl || ""}
            onChange={onChange("workTrackingUrl")}
          />
          <InputField
            label="Work tracking name"
            value={workTracking?.workTrackingName || ""}
            onChange={onChange("workTrackingName")}
          />
        </Stack>
      )}
      {!isEditing && workTracking?.workTrackingUrl && (
        <KeyValue label="Work tracking">
          <Link href={workTracking.workTrackingUrl} target="_blank">
            {workTracking.workTrackingName ? workTracking.workTrackingName : "Link"}
          </Link>
        </KeyValue>
      )}
    </Box>
  );
};
