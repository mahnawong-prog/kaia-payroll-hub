import { Link, useLocation, useNavigate } from "react-router-dom";
import { 
  LayoutDashboard, 
  Clock, 
  FileText, 
  MessageCircle, 
  User, 
  Users, 
  BarChart3,
  Settings,
  LogOut,
  Wallet,
  FileSignature
} from "lucide-react";
import { Logo } from "@/components/ui/logo";
import { cn } from "@/lib/utils";
import { UserRole } from "@/types/auth";
import { useAuth } from "@/contexts/AuthContext";

interface SidebarProps {
  userRole: UserRole;
  isOpen: boolean;
  onClose: () => void;
}

const menuItems: Record<UserRole, { icon: React.ReactNode; label: string; path: string }[]> = {
  worker: [
    { icon: <LayoutDashboard size={20} />, label: "Dashboard", path: "/dashboard" },
    { icon: <Clock size={20} />, label: "Timesheet", path: "/timesheet" },
    { icon: <FileText size={20} />, label: "Payslips", path: "/payslips" },
    { icon: <MessageCircle size={20} />, label: "Messages", path: "/chat" },
    { icon: <User size={20} />, label: "My Profile", path: "/profile" },
  ],
  supervisor: [
    { icon: <LayoutDashboard size={20} />, label: "Dashboard", path: "/dashboard" },
    { icon: <Users size={20} />, label: "My Team", path: "/team" },
    { icon: <Clock size={20} />, label: "Timesheets", path: "/timesheet" },
    { icon: <FileText size={20} />, label: "Payslips", path: "/payslips" },
    { icon: <FileSignature size={20} />, label: "Contracts", path: "/contracts" },
    { icon: <MessageCircle size={20} />, label: "Messages", path: "/chat" },
    { icon: <User size={20} />, label: "My Profile", path: "/profile" },
  ],
  manager: [
    { icon: <LayoutDashboard size={20} />, label: "Dashboard", path: "/dashboard" },
    { icon: <Users size={20} />, label: "Workers", path: "/workers" },
    { icon: <Clock size={20} />, label: "Timesheets", path: "/timesheet" },
    { icon: <FileText size={20} />, label: "Payslips", path: "/payslips" },
    { icon: <FileSignature size={20} />, label: "Contracts", path: "/contracts" },
    { icon: <Wallet size={20} />, label: "Accounts", path: "/accounts" },
    { icon: <MessageCircle size={20} />, label: "Messages", path: "/chat" },
    { icon: <BarChart3 size={20} />, label: "Reports", path: "/reports" },
    { icon: <Settings size={20} />, label: "Settings", path: "/settings" },
  ],
  ceo: [
    { icon: <LayoutDashboard size={20} />, label: "Overview", path: "/dashboard" },
    { icon: <BarChart3 size={20} />, label: "Analytics", path: "/analytics" },
    { icon: <Users size={20} />, label: "All Workers", path: "/workers" },
    { icon: <FileText size={20} />, label: "Payroll", path: "/payroll" },
    { icon: <FileSignature size={20} />, label: "Contracts", path: "/contracts" },
    { icon: <Wallet size={20} />, label: "Accounts", path: "/accounts" },
    { icon: <MessageCircle size={20} />, label: "Broadcast", path: "/broadcast" },
    { icon: <Settings size={20} />, label: "Settings", path: "/settings" },
  ],
  accountant: [
    { icon: <LayoutDashboard size={20} />, label: "Dashboard", path: "/dashboard" },
    { icon: <Wallet size={20} />, label: "Accounts", path: "/accounts" },
    { icon: <FileText size={20} />, label: "Payroll", path: "/payroll" },
    { icon: <Users size={20} />, label: "Workers", path: "/workers" },
    { icon: <BarChart3 size={20} />, label: "Reports", path: "/reports" },
    { icon: <Settings size={20} />, label: "Settings", path: "/settings" },
  ],
};

export function Sidebar({ userRole, isOpen, onClose }: SidebarProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const items = menuItems[userRole];

  const handleLogout = async () => {
    await signOut();
    navigate('/login');
  };
  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside className={cn(
        "fixed top-0 left-0 z-50 h-full w-64 bg-sidebar border-r border-sidebar-border",
        "transform transition-transform duration-300 ease-in-out",
        "lg:translate-x-0 lg:static",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-6 border-b border-sidebar-border">
            <Logo size="md" />
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            {items.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={onClose}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium",
                    "transition-all duration-200",
                    isActive 
                      ? "bg-sidebar-accent text-sidebar-accent-foreground" 
                      : "text-sidebar-foreground hover:bg-sidebar-accent/50"
                  )}
                >
                  {item.icon}
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-sidebar-border">
            <button onClick={handleLogout} className="flex items-center gap-3 px-4 py-3 w-full rounded-lg text-sm font-medium text-destructive hover:bg-destructive/10 transition-colors">
              <LogOut size={20} />
              Log Out
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
