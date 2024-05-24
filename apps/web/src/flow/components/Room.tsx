import { LoadingSpinner } from "@/components/LoadingSpinner";
import { RoomProvider } from "@/liveblocks.config";
import { ClientSideSuspense } from "@liveblocks/react";
import { ReactNode } from "react";
import { ErrorBoundary } from "react-error-boundary";

export default function Room({ roomId, children }: { roomId: string; children: ReactNode }) {
  return (
    <RoomProvider id={roomId} initialPresence={{ cursor: null, selectedNodeId: null }}>
      <ErrorBoundary
        fallback={<div className="error">There was an error while getting threads.</div>}
      >
        <ClientSideSuspense fallback={<LoadingSpinner />}>{() => children}</ClientSideSuspense>
      </ErrorBoundary>
    </RoomProvider>
  );
}
