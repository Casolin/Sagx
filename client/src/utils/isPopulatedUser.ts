import type { PopulatedUser } from "../types/global.types";

export const isPopulatedUser = (user: unknown): user is PopulatedUser => {
  return (
    typeof user === "object" &&
    user !== null &&
    "_id" in user &&
    "firstName" in user &&
    "lastName" in user
  );
};
