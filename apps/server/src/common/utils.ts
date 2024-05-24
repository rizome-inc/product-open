// fixme: this is too prescriptive
export const getEntityDisplayName = (
  entity?:
    | {
        firstName?: string | null;
        lastName?: string | null;
        email?: string | null;
      }
    | null
    | undefined,
) => {
  if (entity?.firstName && entity?.lastName) {
    return `${entity.firstName} ${entity.lastName}`;
  }

  return entity?.email || "";
};
