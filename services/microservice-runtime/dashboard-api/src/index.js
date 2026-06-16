import dashboardRoutes from "../../src/routes/dashboardRoutes.js";
import {
  createApiApp,
  createHandler,
  startLocalServer,
} from "../../src/common/serviceApp.js";

const app = createApiApp({
  serviceName: "dashboard-api",
  mounts: [{ path: "/api/dashboard", router: dashboardRoutes }],
});

startLocalServer(app, {
  port: Number(process.env.PORT || 8087),
  serviceName: "dashboard-api",
});

export const handler = createHandler(app);
export default app;
