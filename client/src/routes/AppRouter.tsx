import { Routes, Route } from "react-router-dom";
import { PrivateRoute } from "./PrivateRoute";
import { RoleRoute } from "./RoleRoute";

import Login from "../pages/Login";
import Unauthorized from "../pages/Unauthorized";

import DashboardLayout from "../layouts/DashboardLayout";

import Missions from "../pages/Missions";
import Alerts from "../pages/Alerts";
import ForgotPassword from "../pages/ForgotPassword";
import ResetPassword from "../pages/ResetPassword";
import Profile from "../pages/Profile";
import Dashboard from "../pages/Dashboard";
import ChatPage from "../pages/ChatPage";
import CreateMissionPage from "../pages/CreateMissionPage";
import FriendsPage from "../pages/FriendsPage";
import EditMissionPage from "../pages/EditMissionPage";
import EditMissionTasksPage from "../pages/EditMissionTasksPage";
import MachinesPage from "../pages/MachinesPage";
import EditMachinePage from "../pages/EditMachinePage";
import CreateAlertPage from "../pages/CreateAlertPage";
import AdminUsersPage from "../pages/AdminUsersPage";
import EditUserPage from "../pages/EditUserPage";
import AddUserPage from "../pages/AddUserPage";
import MaterialsPage from "../pages/MaterialsPage";
import { AddMaterialsPage } from "../pages/AddMaterialsPage";
import CreateMachinePage from "../pages/CreateMachinePage";

export const AppRouter = () => {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/unauthorized" element={<Unauthorized />} />

      <Route
        path="/"
        element={
          <PrivateRoute>
            <DashboardLayout />
          </PrivateRoute>
        }
      >
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/profile" element={<Profile />} />

        <Route
          path="/users"
          element={
            <RoleRoute allowedRoles={["ADMIN"]}>
              <AdminUsersPage />
            </RoleRoute>
          }
        />

        <Route
          path="/users/:id"
          element={
            <RoleRoute allowedRoles={["ADMIN"]}>
              <EditUserPage />
            </RoleRoute>
          }
        />

        <Route
          path="/users/add"
          element={
            <RoleRoute allowedRoles={["ADMIN"]}>
              <AddUserPage />
            </RoleRoute>
          }
        />

        <Route
          path="/missions"
          element={
            <RoleRoute allowedRoles={["ADMIN", "MANAGER", "TECHNICIAN"]}>
              <Missions />
            </RoleRoute>
          }
        />

        <Route
          path="/missions/:id/edit"
          element={
            <RoleRoute allowedRoles={["ADMIN", "MANAGER", "TECHNICIAN"]}>
              <EditMissionPage />
            </RoleRoute>
          }
        />

        <Route
          path="/missions/:id/tasks/edit"
          element={
            <RoleRoute allowedRoles={["ADMIN", "MANAGER", "TECHNICIAN"]}>
              <EditMissionTasksPage />
            </RoleRoute>
          }
        />

        <Route
          path="/missions/add"
          element={
            <RoleRoute allowedRoles={["ADMIN", "MANAGER"]}>
              <CreateMissionPage />
            </RoleRoute>
          }
        />

        <Route
          path="/materials"
          element={
            <RoleRoute allowedRoles={["ADMIN", "MANAGER"]}>
              <MaterialsPage />
            </RoleRoute>
          }
        />

        <Route
          path="/materials/add"
          element={
            <RoleRoute allowedRoles={["ADMIN", "MANAGER"]}>
              <AddMaterialsPage />
            </RoleRoute>
          }
        />

        <Route
          path="/friends"
          element={
            <RoleRoute allowedRoles={["ADMIN", "MANAGER", "TECHNICIAN"]}>
              <FriendsPage />
            </RoleRoute>
          }
        />

        <Route
          path="/chat"
          element={
            <RoleRoute allowedRoles={["ADMIN", "MANAGER", "TECHNICIAN"]}>
              <ChatPage />
            </RoleRoute>
          }
        />

        <Route
          path="/chat/private/:userId"
          element={
            <RoleRoute allowedRoles={["ADMIN", "MANAGER", "TECHNICIAN"]}>
              <ChatPage />
            </RoleRoute>
          }
        />

        <Route
          path="/chat/room/:roomId"
          element={
            <RoleRoute allowedRoles={["ADMIN", "MANAGER", "TECHNICIAN"]}>
              <ChatPage />
            </RoleRoute>
          }
        />

        <Route
          path="/machines"
          element={
            <RoleRoute allowedRoles={["ADMIN", "MANAGER"]}>
              <MachinesPage />
            </RoleRoute>
          }
        />

        <Route
          path="/machines/add"
          element={
            <RoleRoute allowedRoles={["ADMIN", "MANAGER"]}>
              <CreateMachinePage />
            </RoleRoute>
          }
        />

        <Route
          path="/alerts/add"
          element={
            <RoleRoute allowedRoles={["ADMIN", "MANAGER", "TECHNICIAN"]}>
              <CreateAlertPage />
            </RoleRoute>
          }
        />

        <Route
          path="/machines/:id/edit"
          element={
            <RoleRoute allowedRoles={["ADMIN", "MANAGER"]}>
              <EditMachinePage />
            </RoleRoute>
          }
        />

        <Route
          path="/alerts"
          element={
            <RoleRoute allowedRoles={["ADMIN", "MANAGER", "TECHNICIAN"]}>
              <Alerts />
            </RoleRoute>
          }
        />
      </Route>
    </Routes>
  );
};
