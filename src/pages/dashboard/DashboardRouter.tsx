import { useAuth } from "@/contexts/AuthContext";
import CEODashboard from "./CEODashboard";
import ManagerDashboard from "./ManagerDashboard";
import SupervisorDashboard from "./SupervisorDashboard";
import AccountantDashboard from "./AccountantDashboard";
import WorkerDashboard from "./WorkerDashboard";

export default function DashboardRouter() {
  const { primaryRole } = useAuth();

  switch (primaryRole) {
    case 'ceo':
      return <CEODashboard />;
    case 'manager':
      return <ManagerDashboard />;
    case 'supervisor':
      return <SupervisorDashboard />;
    case 'accountant':
      return <AccountantDashboard />;
    default:
      return <WorkerDashboard />;
  }
}
