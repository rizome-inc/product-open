import { Edge, Node, Position } from "reactflow";

// the layout direction (T = top, R = right, B = bottom, L = left, TB = top to bottom, ...)
export type Direction = "TB" | "LR" | "RL" | "BT";

export type LayoutAlgorithmOptions = {
  direction: Direction;
  spacing: [number, number];
};

export const layoutOptions: LayoutAlgorithmOptions = {
  direction: "LR",
  spacing: [100, 100],
};

export type LayoutAlgorithm = (
  nodes: Node[],
  edges: Edge[],
  options: LayoutAlgorithmOptions,
) => { nodes: Node[]; edges: Edge[] };

// fixme: this should consider the type of node we're looking at
export function getSourceHandlePosition(direction: Direction) {
  switch (direction) {
    case "TB":
      return Position.Bottom;
    case "BT":
      return Position.Top;
    case "LR":
      return Position.Right;
    case "RL":
      return Position.Left;
  }
}

export function getTargetHandlePosition(direction: Direction) {
  switch (direction) {
    case "TB":
      return Position.Top;
    case "BT":
      return Position.Bottom;
    case "LR":
      return Position.Left;
    case "RL":
      return Position.Right;
  }
}
