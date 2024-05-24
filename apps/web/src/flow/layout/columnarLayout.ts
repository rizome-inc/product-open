/**
 * Columnar layout for nodes:
 *
 * Data
 * Model (maybe multiple columns)
 * Math (multiple columns)
 * Driver + Logic + Deliverable
 *
 * Because math and model nodes may be spread across several columns, we do a DFS? ... or just save column as a part of node data...
 *
 * v1: static alignment
 * v2: adding
 * v3: removing
 * v4: adding column (requires incrementing all node column values >= new one)
 *
 * (can add animations later)
 *
 * react flow doesn't have examples of edges that go around other nodes
 * - rather than try to make the svg path math work, we probably want to put additional margin above certain nodes if the source node
 *   has a target in a different column too
 */

import { Node, XYPosition } from "reactflow";
import { Base } from "../store/dataTypes";
import { LayoutAlgorithm } from "./utils";

const spacing = {
  vertical: 40,
  horizontal: 100,
  verticalLarge: 60,
};

const standardNodeWidth = 192; // todo: need a way to determine width so far. maybe keep a max counter or something per column
// const standardNodeHeight = 160; // fixme: should we save node dimensions in Liveblocks too? may need to so we can do programmatic spacing

export const columnarLayout: LayoutAlgorithm = (nodes, edges) => {
  const columnMap: Map<number, Node<Base>[]> = nodes.reduce((acc, node) => {
    const key = node.data.column;
    if (acc.has(key)) {
      return acc.set(key, [...acc.get(key)!, node]);
    } else {
      return acc.set(key, [node]);
    }
  }, new Map<number, Node<Base>[]>());

  let previousY = 0;
  let previousHeight = 0;
  let previousSubflowY = 0;
  let previousSubflowHeight = 0;

  const newNodes = Array.from(columnMap.entries()).flatMap(([column, nodes]) =>
    nodes.map((n, i) => {
      let position: XYPosition;
      const verticalSpacing =
        n.type === "action" || n.type === "logic" || n.type === "actionDriver"
          ? spacing.verticalLarge
          : spacing.vertical;
      if (n.parentNode) {
        position = {
          x: 20, // todo: determine if we want to change this padding
          y: 20 + previousSubflowY + previousSubflowHeight,
        };
        previousSubflowY = position.y;
        previousSubflowHeight = n.height || 0;
      } else {
        previousSubflowY = 0;
        previousSubflowHeight = 0;
        position = {
          x: column * (spacing.horizontal + standardNodeWidth) + (n.type === "operand" ? 20 : 0),
          y: i > 0 ? previousY + previousHeight + verticalSpacing : 0,
        };
        previousHeight = n.height || 0;
        previousY = position.y || 0;
      }

      //previousY = nodes[i+1]?.data.column === column ? position.y : 0;

      return {
        ...n,
        position,
      } as Node<Base>;
    }),
  );

  return {
    nodes: newNodes,
    edges,
  };
};
