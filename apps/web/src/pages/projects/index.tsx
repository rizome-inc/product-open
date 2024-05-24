import { BasePageActionButton } from "@/components/BasePageActionButton";
import EmptyState from "@/components/EmptyState";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { AddFlowProjectModal } from "@/components/Projects/AddFlowProjectModal";
import { useUserSessionContext } from "@/hooks/userSession";
import { BasePageLayout } from "@/layouts/BasePageLayout";
import { useInboxNotifications } from "@/liveblocks.config";
import { useProjectsQuery } from "@/queries";
import { getTimeDiffText } from "@/util/misc";
import Badge from "@mui/material/Badge";
import Paper from "@mui/material/Paper";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

function Projects() {
  const { isAdmin } = useUserSessionContext();
  const router = useRouter();
  const { isLoading, data: projects } = useProjectsQuery({});

  const [showAddProjectModal, setShowAddProjectModal] = useState<boolean>(false);

  const { inboxNotifications } = useInboxNotifications();

  const [unreadNotificationsPerRoom, setUnreadNotificationsPerRoom] = useState<Map<string, number>>(
    new Map(),
  );
  useEffect(() => {
    if (inboxNotifications !== undefined) {
      const unreadNotificationRoomIds = inboxNotifications
        .filter((n) => n.readAt === null)
        .map((n) => n.roomId);
      setUnreadNotificationsPerRoom(
        unreadNotificationRoomIds.reduce((acc, rid) => {
          if (acc.has(rid)) {
            return acc.set(rid, acc.get(rid)! + 1);
          } else {
            return acc.set(rid, 1);
          }
        }, new Map<string, number>()),
      );
    }
  }, [inboxNotifications]);

  return (
    <BasePageLayout
      actions={
        <BasePageActionButton
          id="addProjectStart1"
          variant="outlined"
          onClick={() => setShowAddProjectModal(true)}
        >
          <span>{"Add Project"}</span>
        </BasePageActionButton>
      }
      title={"Projects"}
      subtitle="Projects enable you to collaborate on the plan and goals for a data science project"
    >
      {isLoading ? (
        <LoadingSpinner absoluteCenterPosition={true} />
      ) : projects?.length === 0 ? (
        <EmptyState
          action={isAdmin ? "Add your first Project" : undefined}
          title="Projects"
          message={[
            "Plan the goals of a data science project",
            "Include cross-functional stakeholders in the process",
          ]}
          onClick={isAdmin ? () => setShowAddProjectModal(true) : undefined}
          primaryAction={true}
          actionId="addProjectStart2"
        />
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Team</TableCell>
                <TableCell>Last Updated</TableCell>
                <TableCell variant="moreMenu" />
              </TableRow>
            </TableHead>
            <TableBody>
              {projects?.map((x) => (
                <TableRow
                  key={x.id}
                  onClick={() => {
                    router.push(
                      `/projects/${x.id}${x.name === "Example Project" ? "?edit=true" : ""}`,
                    );
                  }}
                >
                  <TableCell
                    sx={({ palette }) => ({
                      color: palette.primary.main,
                      cursor: "pointer",
                    })}
                  >
                    {x.name}
                  </TableCell>
                  <TableCell>{x.businessUnit}</TableCell>
                  <TableCell>{getTimeDiffText(x.updatedAt)}</TableCell>
                  {x.roomId && unreadNotificationsPerRoom.has(x.roomId) && (
                    <TableCell>
                      <Badge
                        sx={(t) => ({
                          "& .MuiBadge-badge": {
                            backgroundColor: t.palette.highlight?.main,
                            color: "white",
                          },
                        })}
                        badgeContent={unreadNotificationsPerRoom.get(x.roomId)!}
                        anchorOrigin={{
                          vertical: "bottom",
                          horizontal: "right",
                        }}
                      />
                    </TableCell>
                  )}

                  {/* <MoreMenuTableCell>
										<MenuItem onClick={() => router.push(`/projects/${x.id}`)}>Go to project</MenuItem>
										<MenuItem>Share</MenuItem>
										<MenuItem>Publish</MenuItem>
									</MoreMenuTableCell> */}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/*
      Search bar. Hidden for now because it isn't working and no one has many projects yet.
      
      <div className="sm:px-6 lg:pr-[22px] lg:pl-[30px] pb-2">
        {projectData.length > 0 && (
          <form className="pt-[1px] pl-[1px]">
            <label className="font-[700] text-[#333333] text-[14px]">
              Search
            </label>
            <div className="relative">
              <input
                placeholder="Matches on everything inside a project  (comments, descriptions, tags, users... )"
                className="border-[2px] border-[#777777] rounded-[4px] w-full sm:mr-0 sm:w-[536px] h-[33px] flex justify-center items-center 
              text-[14px] leading-[21px] pl-[33px] focus:outline-none focus:ring-0 placeholder:italic"
                onChange={handleChange}
                onFocus={handleFocus}
                onBlur={handleBlur}
              />
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="1.5"
                stroke="currentColor"
                className="w-[16px] h-[16px] absolute left-[10px] top-[9px]"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
                />
              </svg>
            </div>
          </form>
        )}
      </div>
      */}
      {/* <ProjectTable
        setEditFieldPopup={setEditFieldPopup}
        editFieldPopup={editFieldPopup}
      /> */}

      {/* <AddProjectModal open={showAddProjectModal} onRequestClose={() => setShowAddProjectModal(false)} /> */}
      <AddFlowProjectModal
        open={showAddProjectModal}
        onRequestClose={() => setShowAddProjectModal(false)}
      />
    </BasePageLayout>
  );
}

export default Projects;
