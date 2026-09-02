export type AppRole =
  | "user"
  | "affiliate"
  | "admin"
  | "master";

/* =========================================================
   SAVE SESSION
========================================================= */

export function saveSession(
  token: string,
  role: AppRole,
) {
  localStorage.setItem("token", token);
  localStorage.setItem("role", role);

  window.dispatchEvent(new Event("auth:changed"));
}

/* =========================================================
   CLEAR SESSION
========================================================= */

export function clearSession() {
  localStorage.removeItem("token");
  localStorage.removeItem("role");

  window.dispatchEvent(new Event("auth:changed"));
}

/* =========================================================
   LOGOUT
========================================================= */

export function logout(
  redirectTo = "/",
) {
  clearSession();
  window.location.href = redirectTo;
}

/* =========================================================
   SESSION HELPERS
========================================================= */

export const hasToken = () =>
  Boolean(
    localStorage.getItem("token"),
  );

export const getRole = () =>
  localStorage.getItem(
    "role",
  ) as AppRole | null;

/* =========================================================
   ROLE CHECKS
========================================================= */

export const isUserSession = () =>
  hasToken() &&
  getRole() === "user";

export const isAffiliateSession = () =>
  hasToken() &&
  getRole() === "affiliate";

export const isAdminSession = () =>
  hasToken() &&
  getRole() === "admin";

export const isMasterSession = () =>
  hasToken() &&
  getRole() === "master";
