import { ProjectContentSchema } from "xylem";

export type NodeIndexWithValue = {
  categoryIndex: number;
  fieldIndex: number;
  nodeId: string;
  value: any;
};

export const indexAllAttachmentNodes = (content: ProjectContentSchema): NodeIndexWithValue[] => {
  return content.categories.flatMap((category, categoryIndex) => {
    return category.fields.reduce((acc, field, fieldIndex) => {
      if (["image", "file"].includes(field.type) && typeof field.id === "string") {
        acc.push({
          categoryIndex,
          fieldIndex,
          nodeId: field.id!,
          value: field.value,
        });
      }
      return acc;
    }, new Array<NodeIndexWithValue>());
  });
};
