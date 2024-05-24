import { useUserSessionContext } from "@/hooks/userSession";
import { Theme } from "@/styles/theme";
import PersonIcon from "@mui/icons-material/Person";
import WorkOutlineIcon from "@mui/icons-material/WorkOutline";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import Stack from "@mui/material/Stack";
import SvgIcon from "@mui/material/SvgIcon";
import Typography from "@mui/material/Typography";
import Link from "next/link";
import { AppHeaderButton } from "./presentation";

const AdminLinks = [
  {
    path: "/users",
    name: "Users",
    icon: PersonIcon,
  },
  /*{
    path: "/templates",
    name: "Templates",
    icon: ArchitectureIcon,
  },*/
];

const UserLinks = [
  {
    path: "/projects",
    name: "Projects",
    icon: WorkOutlineIcon,
  },
];

export default function AppHeader() {
  const { isAdmin, user } = useUserSessionContext();

  // fixme: clean up this copy-paste. it's in like 4 places
  // Pick a random color from our color scheme for the user's avatar
  const colorList = ["AB25E3", "1AA499", "EC9018", "3B24E8", "EF1351"];
  const colorNumber = Math.floor(Math.random() * (colorList.length - 1));
  const avatarColor = colorList[colorNumber];
  const avatar =
    user?.avatar ??
    `https://ui-avatars.com/api/?name=${user?.firstName}+${user?.lastName}&background=${avatarColor}&color=fff&rounded=true`;

  return (
    <AppBar position="relative">
      <Box
        sx={{
          alignItems: "center",
          display: "flex",
          height: "100%",
          marginLeft: "-8px",
        }}
      >
        <Link href={"/projects"} passHref={true}>
          <IconButton>
            <SvgIcon fill="none" viewBox="0 0 37 37" sx={{ width: "37px", height: "37px" }}>
              <g clipPath="url(#clip0_1218_88717)">
                <path
                  d="M22.7902 36.5C30.9387 34.5651 37 27.2403 37 18.4998C37 8.31864 28.7758 0.0583247 18.6084 0L25.2663 6.65796C27.6502 9.04182 25.9618 13.1179 22.5906 13.1179L13.6227 13.1179C13.3905 13.1179 13.2023 13.3061 13.2023 13.5383L13.2023 19.872C13.2023 20.1971 12.9387 20.4606 12.6136 20.4606H10.4273C10.1022 20.4606 9.83863 20.1971 9.83863 19.872L9.83863 13.5383C9.83863 11.4484 11.5328 9.7542 13.6227 9.7542L22.5906 9.7542C22.9651 9.7542 23.1527 9.30131 22.8879 9.03644L14.3634 0.511904C14.3506 0.49911 14.3385 0.485873 14.3271 0.472243C6.11955 2.36443 0 9.71748 0 18.4998C0 28.7172 8.28273 37 18.5 37C18.5111 37 18.5222 37 18.5332 37L11.8178 30.2844C9.43391 27.9006 11.1223 23.8245 14.4935 23.8245H23.4614C23.6936 23.8245 23.8818 23.6363 23.8818 23.4041V17.0704C23.8818 16.7453 24.1454 16.4817 24.4705 16.4817H26.6568C26.9819 16.4817 27.2455 16.7453 27.2455 17.0704V23.4041C27.2455 25.494 25.5513 27.1882 23.4614 27.1882H14.4935C14.1189 27.1882 13.9313 27.6411 14.1962 27.906L22.7902 36.5Z"
                  fill="black"
                />
              </g>
              <defs>
                <clipPath id="clip0_1218_88717">
                  <rect width="37" height="37" fill="white" />
                </clipPath>
              </defs>
            </SvgIcon>
          </IconButton>
        </Link>

        <Stack
          direction={"row"}
          spacing={2}
          sx={{ paddingX: 2, paddingY: 0.5, marginLeft: "auto" }}
        >
          {isAdmin &&
            UserLinks.map((x) => {
              return (
                <AppHeaderButton
                  key={x.name}
                  name={x.name}
                  pathname={x.path}
                  iconComponent={x.icon}
                />
              );
            })}
        </Stack>

        <Stack direction={"row"} spacing={2}>
          {isAdmin && (
            <Stack
              direction={"row"}
              spacing={2}
              sx={{
                alignItems: "center",
                backgroundColor: "#ddd",
                paddingX: 2,
                paddingY: 0.5,
              }}
            >
              <Typography component={"span"} color={"text.primary"}>
                Admin:
              </Typography>
              {AdminLinks.map((x) => (
                <AppHeaderButton
                  iconComponent={x.icon}
                  key={x.name}
                  name={x.name}
                  pathname={x.path}
                />
              ))}
            </Stack>
          )}
          <Box
            sx={{
              alignSelf: "center",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              height: 42,
              width: 42,
              border: 2,
              borderRadius: "50%",
              borderColor: Theme.palette.divider,
            }}
          >
            <img src={avatar} height={38} width={38} style={{ borderRadius: "50%" }} />
          </Box>
        </Stack>
      </Box>
    </AppBar>
  );
}
