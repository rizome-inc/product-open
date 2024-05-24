import { create } from "zustand";
import { Base, NodeValues } from "./dataTypes";

/**
 * notes
 *
 * The idea is that we'll call this store from Flow and individual nodes. It will serve as a bridge hook between
 * the Liveblocks nodes and the drawer
 *
 * todo: look into immer middleware: https://github.com/pmndrs/zustand/tree/main?tab=readme-ov-file#sick-of-reducers-and-changing-nested-states-use-immer
 */

interface LocalGraphBridge {
  nodeIds: string[]; // todo: still necessary to track?
  setNodeIds: (ids: string[]) => void;
  drawerIsOpen: boolean;
  setDrawerIsOpen: (open: boolean) => void;
  drawerInitialValue?: string;
  drawerSubtitle?: string;
  drawerActiveNodeId?: string;
  setDrawerData: <T extends NodeValues>(nodeId: string, nodeData: Base<T>) => void;
  resetDrawerData: () => void;

  // todo: look into zustand slices to separate drawer and menu
  menuAnchorElement: HTMLElement | undefined;
  setMenuAnchorElement: (element: HTMLElement | undefined) => void;
  menuIsOpen: boolean;
  setMenuIsOpen: (open: boolean) => void;
  handleMenuClose: () => void;
  handleMenuDetailClick?: () => void;
  setHandleMenuDetailClick: (f: () => void) => void;
  handleMenuDeleteClick?: () => void;
  setHandleMenuDeleteClick: (f: () => void) => void;
  nodeName?: string;
  setNodeName: (n?: string) => void;
}

const useLocalGraphBridgeStore = create<LocalGraphBridge>()((set) => ({
  nodeIds: [],
  setNodeIds: (ids: string[]) => set({ nodeIds: ids }),
  drawerIsOpen: false,
  setDrawerIsOpen: (open: boolean) => set({ drawerIsOpen: open }),
  drawerInitialValue: undefined,
  drawerSubtitle: undefined,
  drawerActiveNodeId: undefined,
  setDrawerData: <T extends NodeValues>(nodeId: string, nodeData: Base<T>) => {
    const drawerSubtitle: string | undefined = (() => {
      if ("prompt" in nodeData.value) {
        return nodeData.value.prompt as string | undefined;
      } else if ("logic" in nodeData.value) {
        return nodeData.value.logic as string | undefined;
      } else if ("actionDriver" in nodeData.value) {
        return nodeData.value.actionDriver as string | undefined;
      } else if ("name" in nodeData.value && "source" in nodeData.value) {
        return nodeData.value.name as string | undefined;
      } else if ("name" in nodeData.value) {
        return nodeData.value.name as string | undefined;
      } else {
        return undefined;
      }
    })();
    set({
      // todo: make this search node list? or have component do that?
      drawerActiveNodeId: nodeId,
      drawerInitialValue: nodeData.drawer?.inputValue1,
      drawerSubtitle,
    });
  },
  resetDrawerData: () =>
    set({
      drawerActiveNodeId: undefined,
      drawerInitialValue: undefined,
      drawerSubtitle: undefined,
    }),
  // menu
  menuAnchorElement: undefined,
  menuIsOpen: false,
  setMenuIsOpen: (open: boolean) => set({ menuIsOpen: open }),
  setMenuAnchorElement: (element: HTMLElement | undefined) => set({ menuAnchorElement: element }), // todo: there may be some duplication here
  handleMenuClose: () =>
    set({
      menuAnchorElement: undefined,
      menuIsOpen: false,
      handleMenuDeleteClick: undefined,
      handleMenuDetailClick: undefined,
    }),
  setHandleMenuDetailClick: (f: () => void) => set({ handleMenuDetailClick: f }),
  setHandleMenuDeleteClick: (f: () => void) => set({ handleMenuDeleteClick: f }),
  setNodeName: (n?: string) => set({ nodeName: n }),
}));

export default useLocalGraphBridgeStore;
