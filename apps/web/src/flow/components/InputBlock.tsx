import { ReactNode } from "react";

// todo: why don't we just take a single InputBlock (new component) so we can handle open and stuff in there...

type Props = {
  // inputs: {
  //   label: string;
  //   component: ReactNode;
  // }[]
  children: ReactNode[];
};

// todo: maybe this isn't actually a define component, but just a place for us to render stuff in a base block
export default function InputBlock({ children }: Props): ReactNode {
  return <>{children}</>;
}
