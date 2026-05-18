import User from "../modules/users/user.model.js";
import { getKpiStats, getTechnicianKpis } from "../modules/kpi/kpi.service.js";
import { emitToUser } from "../sockets/socket.service.js";
import { SOCKET_EVENTS } from "../sockets/socket.events.js";

export const broadcastKpiUpdate = async () => {
  const users = await User.find({}).select("_id role");

  users.forEach(async (user) => {
    let kpiData;

    if (user.role === "TECHNICIAN") {
      kpiData = await getTechnicianKpis(user._id.toString()); // technician-specific KPI
    } else {
      kpiData = await getKpiStats(); // global KPI for admins/managers
    }

    emitToUser(user._id.toString(), SOCKET_EVENTS.KPI_UPDATE, kpiData);
  });
};
