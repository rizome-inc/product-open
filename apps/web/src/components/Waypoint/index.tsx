import { mergeSxStyles } from "@/util/misc";
import Box from "@mui/material/Box";
import { SxProps } from "@mui/material/styles";
import * as React from "react";
import { useInView } from "react-intersection-observer";

export function Waypoint<C extends React.ElementType>({
  component,
  onChange,
  scrollContainer,
  sx,
  margin,
  threshold,
  triggerOnce,
}: {
  component?: C;
  onChange?: (inView: boolean) => void;
  /** The IntersectionObserver interface's read-only `root` property identifies the Element or Document whose bounds are treated as the bounding box of the viewport for the element which is the observer's target. If the `root` is null, then the bounds of the actual document viewport are used.*/
  scrollContainer?: Element | null;
  sx?: SxProps;
  /** Margin around the scrollContainer. Can have values similar to the CSS margin property, e.g. `10px 20px 30px 40px` (top, right, bottom, left). */
  margin?: string;
  /** Number between `0` and `1` indicating the percentage that should be visible before triggering. Can also be an `array` of numbers, to create multiple trigger points. */
  threshold?: number | number[];
  triggerOnce?: boolean;
}) {
  const { ref } = useInView({
    onChange,
    root: scrollContainer,
    rootMargin: margin,
    threshold,
    triggerOnce,
  });
  return (
    <Box
      ref={ref}
      component={component || "span"}
      sx={mergeSxStyles({ height: 0, padding: 0, margin: 0 }, sx)}
    />
  );
}
