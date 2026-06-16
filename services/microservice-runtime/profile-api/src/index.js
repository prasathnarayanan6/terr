import profileRoutes from "../../src/routes/profileRoutes.js";
import {
  createApiApp,
  createHandler,
  startLocalServer,
} from "../../src/common/serviceApp.js";

const app = createApiApp({
  serviceName: "profile-api",
  mounts: [{ path: "/api/profile", router: profileRoutes }],
});

startLocalServer(app, {
  port: Number(process.env.PORT || 8092),
  serviceName: "profile-api",
});

export const handler = createHandler(app);
export default app;
