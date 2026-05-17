export const getMissionStatusColor = (status: string) => {
  switch (status) {
    case "PENDING":
      return "orange";

    case "ASSIGNED":
      return "blue";

    case "IN_PROGRESS":
      return "purple";

    case "COMPLETED":
      return "green";

    case "CANCELLED":
      return "red";

    default:
      return "gray";
  }
};
