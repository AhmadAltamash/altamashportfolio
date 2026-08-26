import { NavLink, Outlet, Link } from "react-router-dom";
import { LayoutDashboard, FolderKanban, Award, Briefcase, Settings, LogOut, ExternalLink } from "lucide-react";
import { useAdminAuth } from "../../context/AdminAuthContext";
import SEO from "../../components/SEO";

const navItems = [
  { to: "/admin/projects", label: "Projects", icon: FolderKanban },
  { to: "/admin/certificates", label: "Certificates", icon: Award },
  { to: "/admin/experience", label: "Experience", icon: Briefcase },
  { to: "/admin/settings", label: "Settings", icon: Settings },
];

const AdminLayout = () => {
  const { user, signOutAdmin } = useAdminAuth();

  return (
    <div className="min-h-screen bg-[#030014] text-white flex">
      <SEO title="Admin | Altamash Ahmad" noindex />
      <aside className="w-64 shrink-0 bg-white/[0.03] border-r border-white/10 flex flex-col p-4">
        <div className="flex items-center gap-2 px-2 py-3 mb-4">
          <LayoutDashboard className="w-5 h-5 text-indigo-400" />
          <span className="font-semibold">Admin Panel</span>
        </div>

        <nav className="flex-1 space-y-1">
          {navItems.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                  isActive
                    ? "bg-gradient-to-r from-indigo-600/20 to-purple-600/20 text-white border border-white/10"
                    : "text-gray-400 hover:text-white hover:bg-white/5"
                }`
              }
            >
              <Icon className="w-4 h-4" />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="border-t border-white/10 pt-4 mt-4 space-y-2">
          <Link
            to="/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-gray-400 hover:text-white hover:bg-white/5"
          >
            <ExternalLink className="w-4 h-4" />
            View live site
          </Link>
          <div className="px-3 text-xs text-gray-500 truncate">{user?.email}</div>
          <button
            onClick={signOutAdmin}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-red-400 hover:bg-red-500/10"
          >
            <LogOut className="w-4 h-4" />
            Sign out
          </button>
        </div>
      </aside>

      <main className="flex-1 p-6 md:p-10 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;
