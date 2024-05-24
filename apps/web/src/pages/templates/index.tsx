import { BasePageActionButton } from "@/components/BasePageActionButton";
import EmptyState from "@/components/EmptyState";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import AdminLayout from "@/layouts/AdminLayout";
import { BasePageLayout } from "@/layouts/BasePageLayout";
import { useProjectTemplatesQuery } from "@/queries";
import { partition } from "@/util/array";
import Paper from "@mui/material/Paper";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Typography from "@mui/material/Typography";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { TemplateSchema } from "xylem";

export const DEFAULT_TEMPLATE_NAMES = ["Act", "Understand", "Enable"];

function Templates() {
  const router = useRouter();
  const [templates, setTemplates] = useState<TemplateSchema[]>([]);
  const [isLoading, setIsLoading] = useState<boolean | undefined>();
  const templateQueryResult = useProjectTemplatesQuery({});

  useEffect(() => {
    if (templateQueryResult.data) {
      const [defaultTemplates, customTemplates] = partition(templateQueryResult.data, (t) =>
        DEFAULT_TEMPLATE_NAMES.includes(t.name),
      );
      // Sort by template id ascending...
      customTemplates.sort((a, b) => {
        if (a.id && b.id) {
          if (a.id < b.id) return 1;
          else if (a.id == b.id) return 0;
          else return -1;
        }
        return -1;
      });

      // except for default templates, which are ordered in a specific way
      const orderedDefaultTemplates = DEFAULT_TEMPLATE_NAMES.reduce((acc, n) => {
        const t = defaultTemplates.find((x) => x.name == n);
        if (t) {
          acc.push(t);
        }
        return acc;
      }, new Array<TemplateSchema>());
      setTemplates([...customTemplates, ...orderedDefaultTemplates]);
    }
    if (templateQueryResult.isLoading !== undefined) {
      setIsLoading(templateQueryResult.isLoading);
    }
  }, [templateQueryResult.data, templateQueryResult.isLoading]);

  return (
    <AdminLayout>
      <BasePageLayout
        actions={
          <BasePageActionButton
            id="updateTemplateStart1"
            variant="outlined"
            onClick={() => {
              router.push(`/templates/create`);
            }}
          >
            <span>{"Add Template"}</span>
          </BasePageActionButton>
        }
        title="Templates"
        subtitle="Templates determine the types of projects that exist and which fields are present for each type"
      >
        {isLoading ? (
          <LoadingSpinner absoluteCenterPosition={true} />
        ) : templates.length === 0 ? (
          <EmptyState
            action="Add a Template"
            message={"Define project types with consistent requirements"}
            onClick={() => router.push(`/templates/create`)}
            primaryAction={true}
            title="Templates"
          />
        ) : (
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {templates.map((x) => (
                  <TableRow
                    className="updateTemplateStart2"
                    key={x.id}
                    onClick={() => {
                      router.push(`/templates/${x.id}`);
                    }}
                  >
                    <TableCell
                      sx={({ palette }) => ({
                        color: palette.primary.main,
                        cursor: "pointer",
                      })}
                    >
                      <Typography component={"span"}>{x.name}</Typography>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </BasePageLayout>
    </AdminLayout>
  );
}

export default Templates;
