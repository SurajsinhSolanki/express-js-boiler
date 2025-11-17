export const API_VERSION = {
	V1: "/v1",
	V2: "/v2",
} as const;

export const ROUTES = {
	USERS: "/users",
	HEALTH_CHECK: "/health-check",
	METRICS: "/monitoring/metrics",
	UPLOAD: "/upload",
	ID: "/:id",
	CREATE: "/create",
	UPDATE: "/update",
	DELETE: "/delete",
	LIST: "/list",
	SEARCH: "/search",
	AUTH: "/auth",
	LOGIN: "/login",
	LOGOUT: "/logout",
	REGISTER: "/register",
	FILES: "/files",
	DOWNLOAD: "/download",
	SETTINGS: "/settings",
	PROFILE: "/profile",
} as const;

export const buildRoute = (...parts: string[]) => parts.join("").replace(/\/+/g, "/");
