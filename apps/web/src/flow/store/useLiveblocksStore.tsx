import { client } from "@/liveblocks.config";
import { EnsureJson } from "@liveblocks/client";
import type { WithLiveblocks } from "@liveblocks/zustand";
import { liveblocks } from "@liveblocks/zustand";
import {
  addEdge,
  applyEdgeChanges,
  applyNodeChanges,
  Connection,
  Edge,
  EdgeChange,
  Node,
  NodeAddChange,
  NodeChange,
  NodeRemoveChange,
  OnConnect,
  OnEdgesChange,
  OnNodesChange,
} from "reactflow";
import { create } from "zustand";
import { Base, DrawerValues, NodeValues } from "./dataTypes";
import { defaultEdges, defaultNodes } from "./defaultFlowData";
import { exampleEdges, exampleNodes } from "./exampleFlowData";

/**
 * This file contains the Zustand store & Liveblocks middleware
 * https://liveblocks.io/docs/api-reference/liveblocks-zustand
 *
 * Todo: we can export `others` and `presence` from here instead of the normal hook. Should we?
 */

type FlowState = {
  nodes: Node[];
  edges: Edge[];
  onNodesChange: (isEditing: boolean) => OnNodesChange;
  onEdgesChange: (isEditing: boolean) => OnEdgesChange;
  onConnect: (isEditing: boolean) => OnConnect;
  onNodeValueEdit: <T = NodeValues>(id: string, value: T) => void;
  onNodeDrawerValueEdit: <T = DrawerValues>(id: string, drawer: T) => void;
};

type Storage = {
  nodes: FlowState["nodes"];
  edges: FlowState["edges"];
};

// Define your fully-typed Zustand store
const useLiveblocksStore = (isExample: boolean) => {
  return create<WithLiveblocks<FlowState, {}, EnsureJson<Storage>>>()(
    liveblocks(
      (set, get) => ({
        // Initial values for nodes and edges
        nodes: !isExample ? defaultNodes : exampleNodes,
        edges: !isExample ? defaultEdges : exampleEdges,

        // Apply changes to React Flow when the flowchart is interacted with (doesn't apply to editing node inputs)
        onNodesChange: (isEditing: boolean) => (changes: NodeChange[]) => {
          if (!isEditing) return;

          set({
            nodes: applyNodeChanges(changes, get().nodes),
          });
        },
        onEdgesChange: (isEditing: boolean) => (changes: EdgeChange[]) => {
          if (!isEditing) return;

          set({
            edges: applyEdgeChanges(changes, get().edges),
          });
        },
        // todo: simplify the conditional logic once the functionality is more established
        onConnect: (isEditing: boolean) => (connection: Connection) => {
          if (!isEditing) return;

          const sourceNode: Node<Base> | undefined = get().nodes.find(
            (n) => n.id === connection.source,
          );
          const targetNode: Node<Base> | undefined = get().nodes.find(
            (n) => n.id === connection.target,
          );
          if (!sourceNode || !targetNode) return; // todo: this should be unnecessary, but is a compiler complaint
          if (sourceNode.type && ["operand", "expression"].includes(sourceNode.type)) {
            // Only shift target node column if the source and target are in the same column
            if (sourceNode.data.column === targetNode.data.column) {
              const newTargetColumn = sourceNode.data.column + 1;
              let nodeChanges: NodeChange[] = [];

              // If the target is an expression, we need to move the parent and sibling nodes too
              // We separate node setting because expression nodes need to be at earlier indexes than their children in reactflow
              if (targetNode.parentNode) {
                const parentNode = get().nodes.find((n) => n.id === targetNode.parentNode);
                if (!parentNode) return;
                const siblingAndThisNodes = get().nodes.filter(
                  (n) => n.parentNode === targetNode.parentNode,
                );
                nodeChanges = [parentNode, ...siblingAndThisNodes].flatMap((node) => {
                  return [
                    {
                      type: "remove",
                      id: node.id,
                    } as NodeRemoveChange,
                    {
                      type: "add",
                      item: {
                        ...node,
                        data: {
                          ...node.data,
                          column: newTargetColumn,
                        },
                      },
                    } as NodeAddChange<Base>,
                  ];
                });
              } else {
                nodeChanges = [
                  {
                    type: "remove",
                    id: targetNode.id,
                  } as NodeRemoveChange,
                  {
                    type: "add",
                    item: {
                      ...targetNode,
                      data: {
                        ...targetNode.data,
                        column: newTargetColumn,
                      },
                    },
                  } as NodeAddChange<Base>,
                ];
              }

              // Only shift final column nodes if they have the column of the new target column
              const finalColumnNodeTypes = ["logic", "actionDriver", "action"];
              const overlappingColumnNodes = get().nodes.filter(
                (n: Node<Base>) =>
                  n.data.column === newTargetColumn && finalColumnNodeTypes.includes(n.type!),
              );
              if (overlappingColumnNodes.length > 0) {
                console.log(overlappingColumnNodes);
                nodeChanges = nodeChanges.concat(
                  overlappingColumnNodes.flatMap((node) => {
                    // todo: refactor this into a fn since it's used above
                    return [
                      {
                        type: "remove",
                        id: node.id,
                      } as NodeRemoveChange,
                      {
                        type: "add",
                        item: {
                          ...node,
                          data: {
                            ...node.data,
                            column: newTargetColumn + 1,
                          },
                        },
                      } as NodeAddChange<Base>,
                    ];
                  }),
                );
              }

              set({
                nodes: applyNodeChanges(nodeChanges, get().nodes),
                edges: addEdge(connection, get().edges),
              });
            } else {
              set({
                edges: addEdge(connection, get().edges),
              });
            }
          } else {
            set({
              edges: addEdge(connection, get().edges),
            });
          }
        },
        // todo: consider making a generic if data type changes
        // onAddNode: <T = any>(change: NodeAddChange<T>) => {

        // },

        // Node editing handlers
        onNodeValueEdit: <T = NodeValues,>(id: string, value: T) => {
          set((current) => ({
            nodes: current.nodes.map((n) => {
              if (n.id === id) {
                return {
                  ...n,
                  data: {
                    ...n.data,
                    value,
                  },
                };
              }
              return n;
            }),
          }));
        },
        onNodeDrawerValueEdit: <T = DrawerValues,>(id: string, drawer: T) => {
          set((current) => ({
            nodes: current.nodes.map((n) => {
              if (n.id === id) {
                return {
                  ...n,
                  data: {
                    ...n.data,
                    drawer,
                  },
                };
              }
              return n;
            }),
          }));
        },
      }),
      {
        // Add Liveblocks client
        client,

        // Define the store properties that should be shared in real-time
        storageMapping: {
          nodes: true,
          edges: true,
        },
      },
    ),
  );
};

export default useLiveblocksStore;
