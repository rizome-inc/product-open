import dagre from "@dagrejs/dagre";
import { type Edge, type Node } from "reactflow";

// the layout direction (T = top, R = right, B = bottom, L = left, TB = top to bottom, ...)
export type Direction = "TB" | "LR" | "RL" | "BT";

export type LayoutAlgorithmOptions = {
  direction: Direction;
  spacing: [number, number];
};

export const dagreLayoutOptions: LayoutAlgorithmOptions = {
  direction: "LR",
  spacing: [100, 100],
};

export type LayoutAlgorithm = (nodes: Node[], edges: Edge[]) => { nodes: Node[]; edges: Edge[] };

const dagreGraph = new dagre.graphlib.Graph().setDefaultEdgeLabel(() => ({}));

const dagreLayout: LayoutAlgorithm = (nodes, edges) => {
  dagreGraph.setGraph({
    rankdir: dagreLayoutOptions.direction,
    nodesep: dagreLayoutOptions.spacing[0],
    ranksep: dagreLayoutOptions.spacing[1],
  });

  for (const node of nodes) {
    dagreGraph.setNode(node.id, {
      width: node.width ?? 0,
      height: node.height ?? 0,
    });

    // Dagre currently has an open issue that prevents it from laying out sub-flows
    // correctly if any nodes in the sub-flow are connected to nodes outside the
    // sub-flow.
    //
    // See: https://github.com/dagrejs/dagre/issues/238

    if (node.parentNode) {
      dagreGraph.setParent(node.id, node.parentNode);
    }
  }

  for (const edge of edges) {
    dagreGraph.setEdge(edge.source, edge.target);
  }

  dagre.layout(dagreGraph);

  const nextNodes = nodes.map((node) => {
    const { x, y } = dagreGraph.node(node.id);
    const position = {
      x: x - (node.width ?? 0) / 2,
      y: y - (node.height ?? 0) / 2,
    };

    return { ...node, position };
  });

  return { nodes: nextNodes, edges };
};

export default dagreLayout;
