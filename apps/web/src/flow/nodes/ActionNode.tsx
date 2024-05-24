import { InputField } from "@/components/InputField";
import { LoadingActionButton } from "@/components/LoadingActionButton";
import { useFlowProjectContext, useFlowProjectEditingContext } from "@/context/flowProject";
import { useSelf, useUpdateMyPresence } from "@/liveblocks.config";
import { useGenerateImageQuery } from "@/queries/project/useGenerateImageQuery";
import { useGetSignedUrlQuery } from "@/queries/project/useGetSignedUrlQuery";
import { Theme } from "@/styles/theme";
import { Typography } from "@mui/material";
import dayjs from "dayjs";
import { ChangeEvent, useEffect, useState } from "react";
import { Handle, NodeProps, Position } from "reactflow";
import { FormColumnsTemp } from "../components/FormColumnsTemp";
import { StyledHandle } from "../components/StyledHandle";
import { useNodeSelections } from "../hooks/useSelectedByOther";
import { ActionNodeValue, Base } from "../store/dataTypes";
import BaseNodeElement, { BaseNodeProps } from "./BaseNode";

const DEFAULT_IMAGE_URL =
  "https://tvrwyqwuohyjxqocjsuz.supabase.co/storage/v1/object/public/static/no_image.png";

export default function ActionNodeElement(props: NodeProps<Base<ActionNodeValue>>) {
  const { id, data, ...otherNodeProps } = props;

  const { isEditing, liveblocksStore } = useFlowProjectEditingContext();
  const { project } = useFlowProjectContext();

  const updateMyPresence = useUpdateMyPresence();
  const { onNodeValueEdit } = liveblocksStore();

  const self = useSelf();
  const { selectionStatus } = useNodeSelections();
  const { selected } = selectionStatus(id, self.id);

  const [enableGenerateImageQuery, setEnableGenerateImageQuery] = useState(false);

  const signedUrlIsValid =
    data.value.dynamicImage?.signedUrlExpiration !== undefined &&
    dayjs(data.value.dynamicImage.signedUrlExpiration).isAfter(dayjs());

  const [signedImageUrl, setSignedImageUrl] = useState<string | undefined>(
    signedUrlIsValid
      ? data.value.dynamicImage?.signedUrl
      : data.value.staticImageUrl
      ? data.value.staticImageUrl
      : undefined,
  );

  /* Queries */
  const { data: imageData, isLoading: generateImageLoading } = useGenerateImageQuery({
    prompt: data.value?.prompt,
    projectId: project?.id ? project?.id : undefined,
    enabled: enableGenerateImageQuery,
  });

  const { data: signedUrlData } = useGetSignedUrlQuery({
    path: data.value.dynamicImage?.path,
    enabled:
      data.value.dynamicImage?.path !== undefined && !signedUrlIsValid && project?.id !== undefined,
  });

  /* Effects */
  useEffect(() => {
    if (imageData) {
      onNodeValueEdit(id, {
        prompt: data.value.prompt,
        dynamicImage: {
          ...imageData,
        },
      });
      setSignedImageUrl(imageData.signedUrl);
      setEnableGenerateImageQuery(false);
    }
  }, [imageData]);

  useEffect(() => {
    if (signedUrlData && data.value.dynamicImage?.path) {
      onNodeValueEdit(id, {
        prompt: data.value.prompt,
        dynamicImage: {
          path: data.value.dynamicImage.path,
          ...signedUrlData,
        },
      });
      setSignedImageUrl(signedUrlData.signedUrl);
    }
  }, [signedUrlData]);

  /* Fns */
  const onInputChange = (e: ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
    onNodeValueEdit<ActionNodeValue>(id, {
      prompt: e.target.value,
      dynamicImage: data.value.dynamicImage,
    });
  };

  const generateImage = () => {
    setEnableGenerateImageQuery(true);
  };

  const editContent = [
    <FormColumnsTemp
      key="real-world-action"
      label="Real-world action"
      inputElement={
        <InputField
          key="action-input-1"
          onChange={onInputChange}
          onFocus={() => updateMyPresence({ selectedNodeId: id })}
          onBlur={() => {
            updateMyPresence({ selectedNodeId: null });
          }}
          value={data.value?.prompt || ""}
          multiline
          minRows={2}
          disabled={selected}
        />
      }
      description={[
        "Describe the real-world action that will happen to support the above goal. State this in the most concrete terms.",
        "What will happen, who will see it, what will they see?",
      ]}
      isEditing={Boolean(isEditing)}
    />,
    <LoadingActionButton
      key="action-loading-button"
      variant="outlined"
      // loading={true}
      loading={enableGenerateImageQuery && generateImageLoading}
      onClick={generateImage}
      sx={{
        mt: 1,
        ml: enableGenerateImageQuery && generateImageLoading ? 3 : 0,
      }}
    >
      Generate image
    </LoadingActionButton>,
    <FormColumnsTemp
      key="ai-image"
      inputElement={
        <img
          src={signedImageUrl || DEFAULT_IMAGE_URL}
          alt="AI-generated sketch of the deliverable described below"
          height="120"
          width="300"
        />
      }
      sx={{
        marginTop: 1,
      }}
      isEditing={Boolean(isEditing)}
    />,
  ];

  const readContent = [
    <img
      key="action-read-image"
      src={signedImageUrl || DEFAULT_IMAGE_URL}
      alt="AI-generated sketch of the deliverable described above"
      height="120"
      width="300"
    />,
    <Typography key="read-type">{data.value?.prompt || ""}</Typography>,
  ];

  const content = isEditing ? editContent : readContent;

  const baseNodeProps: BaseNodeProps = {
    handles: [
      <StyledHandle
        key="styled-handle-0"
        handles={[<Handle key="handle-1" type="target" position={Position.Top} />]}
        isEditing={isEditing}
      />,
    ],
    color: Theme.palette.highlight!,
    width: 328,
    title: "Deliverable",
    value: data.value,
    drawer: data.drawer,
    column: data.column,
    children: content,
  };

  return (
    <BaseNodeElement key={`basenode-${id}`} data={baseNodeProps} id={id} {...otherNodeProps} />
  );
}
