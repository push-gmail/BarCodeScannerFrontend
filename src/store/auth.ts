export type AppRole = "user" | "admin";

export function saveSession(token: string, role: AppRole) {
  localStorage.setItem("token", token);
  localStorage.setItem("role", role);
}

export function clearSession() {
  localStorage.removeItem("token");
  localStorage.removeItem("role");
}

export function logout(redirectTo = "/") {
  clearSession();
  window.location.href = redirectTo;
}

export const hasToken = () => Boolean(localStorage.getItem("token"));
export const getRole = () => localStorage.getItem("role") as AppRole | null;
export const isUserSession = () => hasToken() && getRole() === "user";
export const isAdminSession = () => hasToken() && getRole() === "admin";
