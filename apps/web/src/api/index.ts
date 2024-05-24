import { ACCESS_TOKEN_COOKIE_NAME, REFRESH_TOKEN_COOKIE_NAME } from "@/hooks/userSession";
import { initClient, tsRestFetchApi } from "@ts-rest/core";
import { RizomeAccessToken, RizomeRefreshToken, jointContract } from "xylem";

export const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://api.rizo.me";

// ts-rest does have a react-query extension, but it's not super clear how it works so I'm avoiding it
const apiClient = initClient(jointContract, {
  baseUrl: BASE_URL,
  baseHeaders: {},
  credentials: "include",
  jsonQuery: true,
  api: async (args) => {
    const cookies = document.cookie.split(";");
    for (const c of cookies) {
      if (c.includes(ACCESS_TOKEN_COOKIE_NAME)) {
        const token = c.split("=")[1];
        args.headers[RizomeAccessToken] = token;
      } else if (c.includes(REFRESH_TOKEN_COOKIE_NAME)) {
        const token = c.split("=")[1];
        args.headers[RizomeRefreshToken] = token;
      }
    }
    // console.log(args)
    return tsRestFetchApi(args);
  },
});

export default apiClient;
