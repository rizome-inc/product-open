import { useToaster } from "@/context/useToaster";
import { SxProps, Theme } from "@mui/material";
import * as React from "react";
import { z } from "zod";
import { Tag } from "../Tag";
import { TokenInputField, TokenProps } from "../TokenInputField";

// fixme: this implementation is asinine
const EmailTokenDataSchema = z.object({
  id: z.string().min(1).trim().email(),
  isValid: z.boolean().optional().nullable(),
});

type EmailTokenData = z.infer<typeof EmailTokenDataSchema>;

export type EmailTokenFieldProps = {
  emailAddresses?: string[];
  onEmailAddressesChanged?: (emailAddresses: string[]) => void;
  sx?: SxProps<Theme>;
};

const stringToEmailTokenData = async (value: string) => {
  const item: EmailTokenData = {
    id: value?.trim(),
    isValid: false,
  };
  try {
    z.string().email().parse(item.id);
    item.isValid = true;
  } catch (_) {}

  return item;
};

export function EmailTokenField({
  sx,
  emailAddresses,
  onEmailAddressesChanged,
}: EmailTokenFieldProps) {
  const [items, setItems] = React.useState<EmailTokenData[]>([]);
  const { toastWarning } = useToaster();

  React.useEffect(() => {
    if (emailAddresses) {
      (async () => {
        const controlledItems = await Promise.all(
          emailAddresses.map((x) => stringToEmailTokenData(x)),
        );
        setItems(controlledItems);
      })();
    }
  }, [emailAddresses]);

  const onTransformInputValue = async (value: string) => {
    if (items.find((x) => x.id?.toLocaleLowerCase() === value?.toLocaleLowerCase())) {
      toastWarning("Duplicate email");
      return null;
    }
    return stringToEmailTokenData(value);
  };

  const onRenderToken = (item: EmailTokenData, _: number, props: TokenProps) => {
    return (
      <Tag
        sx={(theme) =>
          !item.isValid
            ? {
                backgroundColor: theme.palette.warning.main,
                color: "#fff",
              }
            : {}
        }
        key={item.id}
        label={item.id}
        title={!item.isValid ? "Invalid email" : undefined}
        {...props}
      />
    );
  };

  const onItemsChanged = (items: EmailTokenData[]) => {
    if (onEmailAddressesChanged && emailAddresses) {
      onEmailAddressesChanged(items.map((x) => x.id));
    } else if (!emailAddresses && !onEmailAddressesChanged) {
      setItems(items);
    }
  };

  return (
    <TokenInputField<EmailTokenData>
      items={items}
      onItemsChanged={onItemsChanged}
      onRenderToken={onRenderToken}
      onTransformInputValue={onTransformInputValue}
      sx={sx}
    />
  );
}
