import User from "../modules/users/user.model.js";
import Alert from "../modules/alert/alert.model.js";
import { emitToUser } from "../sockets/socket.service.js";
import { SOCKET_EVENTS } from "../sockets/socket.events.js";

const getPopulatedAlert = async (alertId: string) => {
  const alert = await Alert.findById(alertId)
    .populate("machine", "name")
    .lean();
  return alert;
};

const populateMachineIfNeeded = async (alert: any) => {
  if (alert.machine && typeof alert.machine === "string") {
    const populated = await Alert.populate(alert, {
      path: "machine",
      select: "name",
    });
    return populated;
  }
  return alert;
};

const broadcastToAllUsers = async (event: string, alert: any) => {
  const users = await User.find({}).select("_id role");
  users.forEach((user) => {
    emitToUser(user._id.toString(), event, alert);
  });
};

export const broadcastAlertCreated = async (alert: any) => {
  let populatedAlert;

  if (alert._id) {
    populatedAlert = await getPopulatedAlert(alert._id);
  }

  if (!populatedAlert) {
    populatedAlert = await populateMachineIfNeeded(alert.alert || alert);
  }

  if (!populatedAlert) return;

  broadcastToAllUsers(SOCKET_EVENTS.ALERT_CREATED, populatedAlert);
};

export const broadcastAlertUpdated = async (alert: any) => {
  const populatedAlert = await getPopulatedAlert(alert._id);
  if (!populatedAlert) return;

  const users = await User.find({}).select("_id role");
  users.forEach((user) => {
    emitToUser(
      user._id.toString(),
      SOCKET_EVENTS.ALERT_UPDATED,
      populatedAlert,
    );
  });
};

export const broadcastAlertDeleted = async (alert: any) => {
  const populatedAlert = await populateMachineIfNeeded(alert);

  const users = await User.find({}).select("_id role");
  users.forEach((user) => {
    emitToUser(
      user._id.toString(),
      SOCKET_EVENTS.ALERT_DELETED,
      populatedAlert,
    );
  });
};
