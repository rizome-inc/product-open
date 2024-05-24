import { createClient } from "@liveblocks/client";
import { createLiveblocksContext, createRoomContext } from "@liveblocks/react";
import { UserSchema } from "xylem";
import apiClient from "./api";
import { isType } from "./util/typeGuards";

export const client = createClient({
  // returns Promise<CustomAuthenticationResult> (which isn't exported)
  authEndpoint: async (room) => {
    const response = await apiClient.auth.liveblocks({ body: { room } });
    switch (response.status) {
      case 200: {
        return response.body;
      }
      case 400:
        return {
          error: "forbidden",
          reason: response.body.message,
        };
      case 500:
        return {
          error: response.body.message,
          reason: response.body.message,
        };
      default:
        return {
          error: "Unexpected liveblocks error",
          reason: "Unknown",
        };
    }
  },
  // todo: does this need to return in-order?
  async resolveUsers({ userIds: uuids }) {
    // Used only for Comments. Return a list of user information retrieved
    // from `userIds`. This info is used in comments, mentions etc.

    const response = await apiClient.user.getAllUsersInMyOrg({
      query: {
        includeDeactivated: true, // fixme: is this passed in anywhere?
      },
    });

    if (response.status !== 200) {
      return undefined;
    }

    return uuids
      .map((uuid) => {
        const colorList = ["AB25E3", "1AA499", "EC9018", "3B24E8", "EF1351"];
        const colorNumber = Math.floor(Math.random() * (colorList.length - 1));
        const avatarColor = colorList[colorNumber];

        const user = response.body.find((u) => u.uuid === uuid);
        if (!user) return null;

        const userName =
          user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : user.email!;

        return {
          name: userName,
          avatar: isType<string>(user.avatar)
            ? user.avatar
            : `https://ui-avatars.com/api/?name=${user.firstName}+${user.lastName}&background=${avatarColor}&color=fff&rounded=true"`,
          color: `#${user.collaborationColor ?? avatarColor}`,
        };
      })
      .filter(isType<UserMetaInfo>);
  },
  async resolveMentionSuggestions({ text }) {
    // Used only for Comments. Return a list of userIds that match `text`.
    // These userIds are used to create a mention list when typing in the
    // composer.
    //
    // For example when you type "@jo", `text` will be `"jo"`, and
    // you should to return an array with John and Joanna's userIds:
    // ["john@example.com", "joanna@example.com"]

    const response = await apiClient.user.getAllUsersInMyOrg({
      query: {
        includeDeactivated: true, // fixme: is this passed in anywhere?
      },
    });

    if (response.status !== 200) {
      return [];
    }

    const createUserName = (u: UserSchema): string =>
      (u.firstName && u.lastName ? `${u.firstName} ${u.lastName}` : u.email!).toLowerCase();

    // Return all userIds if no `text`
    if (!text) return response.body.map((u) => u.uuid);

    // Otherwise, filter user names for the search `text` and return ids if match
    return response.body
      .filter((u) => {
        return createUserName(u).includes(text.toLowerCase());
      })
      .map((u) => u.uuid);
  },
  throttle: 16, // Updates every 16ms === 60fps animation
});

// Presence represents the properties that exist on every user in the Room
// and that will automatically be kept in sync. Accessible through the
// `user.presence` property. Must be JSON-serializable.
type Presence = {
  cursor: { x: number; y: number } | null;
  selectedNodeId: string | null; // make array?
  // ...
};

// Optionally, Storage represents the shared document that persists in the
// Room, even after all users leave. Fields under Storage typically are
// LiveList, LiveMap, LiveObject instances, for which updates are
// automatically persisted and synced to all connected clients.
type Storage = {
  // author: LiveObject<{ firstName: string, lastName: string }>,
  // ...
};

type UserMetaInfo = {
  name: string;
  avatar: string;
  color: string;
};

// Optionally, UserMeta represents static/readonly metadata on each user, as
// provided by your own custom auth back end (if used). Useful for data that
// will not change during a session, like a user's name or avatar.
type UserMeta = {
  id: string;

  info: UserMetaInfo;
  // info?: Json,  // Accessible through `user.info`
};

// Optionally, the type of custom events broadcast and listened to in this
// room. Use a union for multiple events. Must be JSON-serializable.
type RoomEvent = {
  // type: "NOTIFICATION",
  // ...
};

// Optionally, when using Comments, ThreadMetadata represents metadata on
// each thread. Can only contain booleans, strings, and numbers.
export type ThreadMetadata = {
  nodeId: string;
  // resolved: boolean;
  // quote: string;
  // time: number;
};

export const {
  suspense: {
    RoomProvider,
    useRoom,
    useMyPresence,
    useUpdateMyPresence,
    useSelf,
    useOthers,
    useOthersMapped,
    useOthersConnectionIds,
    useOther,
    useBroadcastEvent,
    useEventListener,
    useErrorListener,
    useStorage,
    useObject,
    useMap,
    useList,
    useBatch,
    useHistory,
    useUndo,
    useRedo,
    useCanUndo,
    useCanRedo,
    useMutation,
    useStatus,
    useLostConnectionListener,
    // useThreads,
    useUser,
    useCreateThread,
    useEditThreadMetadata,
    useCreateComment,
    useEditComment,
    useDeleteComment,
    useAddReaction,
    useRemoveReaction,
  },
  useThreads, // We don't use suspense here to avoid rerendering the entire flow chart when we load comments
} = createRoomContext<Presence, Storage, UserMeta, RoomEvent, ThreadMetadata>(client, {});

export const { LiveblocksProvider, useInboxNotifications, useUnreadInboxNotificationsCount } =
  createLiveblocksContext(client);
