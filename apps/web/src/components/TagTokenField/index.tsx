import { useToaster } from "@/context/useToaster";
import { SxProps, Theme } from "@mui/material";
import * as React from "react";
import { z } from "zod";
import { Tag } from "../Tag";
import { TokenInputField, TokenProps } from "../TokenInputField";

const TagTokenDataSchema = z.object({
  id: z.string().min(1).trim(),
});

type TagTokenData = z.infer<typeof TagTokenDataSchema>;

export type TagTokenFieldProps = {
  onTagsChanged?: (tags: string[]) => void;
  sx?: SxProps<Theme>;
  tags?: string[];
};

export function TagTokenField({ sx, tags, onTagsChanged }: TagTokenFieldProps) {
  const [items, setItems] = React.useState<TagTokenData[]>([]);
  const { toastWarning } = useToaster();

  React.useEffect(() => {
    if (tags) {
      (async () => {
        const controlledItems = await Promise.all(tags.map((x) => ({ id: x })));
        setItems(controlledItems);
      })();
    }
  }, [tags]);

  const onTransformInputValue = async (value: string): Promise<TagTokenData | null> => {
    if (items.find((x) => x.id?.toLocaleLowerCase() === value?.toLocaleLowerCase())) {
      toastWarning("Duplicate tag");
      return null;
    }
    return { id: value };
  };

  const onRenderToken = (item: TagTokenData, _: number, props: TokenProps) => {
    return <Tag key={item.id} label={item.id} {...props} />;
  };

  const onItemsChanged = (items: TagTokenData[]) => {
    if (onTagsChanged && tags) {
      onTagsChanged(items.map((x) => x.id));
    } else if (!tags && !onTagsChanged) {
      setItems(items);
    }
  };

  return (
    <TokenInputField<TagTokenData>
      items={items}
      onItemsChanged={onItemsChanged}
      onRenderToken={onRenderToken}
      onTransformInputValue={onTransformInputValue}
      sx={sx}
    />
  );
}
