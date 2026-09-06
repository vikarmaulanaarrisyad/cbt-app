export type UserRole = "ADMIN" | "PROCTOR" | "TEACHER" | "STUDENT";

export type Permission =
  | "*"
  | "proctor:view"
  | "proctor:control"
  | "questions:view"
  | "questions:manage"
  | "semesters:manage"
  | "subjects:view"
  | "subjects:manage"
  | "users:manage"
  | "student:view"
  | "exam:take";

export interface UserPermissionContext {
  role?: string;
  customPermissions?: string | string[] | null;
}

export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  ADMIN: ["*"],
  PROCTOR: ["proctor:view", "proctor:control", "questions:view", "subjects:view"],
  TEACHER: ["questions:view", "questions:manage", "subjects:view"],
  STUDENT: ["student:view", "exam:take"],
};

/**
  * Check whether a user or role has a given permission
  */
export function hasPermission(
  userOrRole: UserPermissionContext | UserRole | string | undefined | null,
  permission: Permission
): boolean {
  if (!userOrRole) return false;

  let role: string | undefined;
  let customPermissions: string[] = [];

  if (typeof userOrRole === "string") {
    role = userOrRole;
  } else if (typeof userOrRole === "object") {
    role = userOrRole.role;
    if (userOrRole.customPermissions) {
      if (Array.isArray(userOrRole.customPermissions)) {
        customPermissions = userOrRole.customPermissions;
      } else if (typeof userOrRole.customPermissions === "string") {
        try {
          customPermissions = JSON.parse(userOrRole.customPermissions);
        } catch {
          customPermissions = userOrRole.customPermissions.split(",").map((p) => p.trim());
        }
      }
    }
  }

  if (!role) return false;

  if (role === "ADMIN" || customPermissions.includes("*")) return true;
  if (customPermissions.includes(permission)) return true;

  const roleDefaultPermissions = ROLE_PERMISSIONS[role as UserRole] || [];
  if (roleDefaultPermissions.includes("*")) return true;
  return roleDefaultPermissions.includes(permission);
}

/**
  * Get formatted title string for user role
  */
export function getRoleLabel(role: UserRole | string | undefined | null): string {
  switch (role) {
    case "ADMIN":
      return "Administrator Utama";
    case "PROCTOR":
      return "Pengawas Ruangan";
    case "TEACHER":
      return "Guru Pengampu";
    case "STUDENT":
      return "Peserta Ujian";
    default:
      return "Pengguna";
  }
}

/**
  * Get badge color styling for UI display
  */
export function getRoleBadgeStyle(role: UserRole | string | undefined | null): {
  bg: string;
  text: string;
  border: string;
} {
  switch (role) {
    case "ADMIN":
      return {
        bg: "bg-purple-500/10",
        text: "text-purple-400",
        border: "border-purple-500/20",
      };
    case "PROCTOR":
      return {
        bg: "bg-blue-500/10",
        text: "text-blue-400",
        border: "border-blue-500/20",
      };
    case "TEACHER":
      return {
        bg: "bg-amber-500/10",
        text: "text-amber-400",
        border: "border-amber-500/20",
      };
    case "STUDENT":
      return {
        bg: "bg-emerald-500/10",
        text: "text-emerald-400",
        border: "border-emerald-500/20",
      };
    default:
      return {
        bg: "bg-slate-500/10",
        text: "text-slate-400",
        border: "border-slate-500/20",
      };
  }
}

/**
  * Get primary default home path for a specific role
  */
export function getHomePathForRole(role: UserRole | string | undefined | null): string {
  switch (role) {
    case "ADMIN":
      return "/proctor/dashboard";
    case "PROCTOR":
      return "/proctor/dashboard";
    case "TEACHER":
      return "/proctor/dashboard/questions";
    case "STUDENT":
      return "/student/dashboard";
    default:
      return "/login";
  }
}

/**
 * Get server-side user session from cbt_session cookie
 */
export async function getServerSession() {
  try {
    const { cookies } = await import("next/headers");
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get("cbt_session");
    if (!sessionCookie || !sessionCookie.value) return null;
    return JSON.parse(sessionCookie.value);
  } catch {
    return null;
  }
}

