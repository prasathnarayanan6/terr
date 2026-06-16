import billingRoutes from "../../src/routes/billingRoutes.js";
import {
  createApiApp,
  createHandler,
  startLocalServer,
} from "../../src/common/serviceApp.js";

const app = createApiApp({
  serviceName: "billing-api",
  mounts: [{ path: "/api/billing", router: billingRoutes }],
});

startLocalServer(app, {
  port: Number(process.env.PORT || 8090),
  serviceName: "billing-api",
});

export const handler = createHandler(app);
export default app;
