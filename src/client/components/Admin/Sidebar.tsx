import { useState } from "react";
import {
  Cog,
  GraduationCap,
  LayoutDashboard,
  User,
  Sidebar,
} from "lucide-react";
import { Link } from "react-router-dom";

export default function SideBar() {
  const [isOpen, setIsOpen] = useState(true);

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  const SidebarItem = ({
    href,
    icon: Icon,
    label,
  }: {
    href: string;
    icon: any;
    label: string;
  }) => (
    <Link
      to={href}
      className="hover:bg-gray-300 border flex gap-2 p-3 text-left py-3 rounded-2xl transition"
    >
      <Icon />
      {label}
    </Link>
  );

  return (
    <div className="h-full flex">
      {/* Sidebar */}
      <div
        className={`bg-gray-200 text-gray-800 border-r-2 border-gray-300 h-full p-2 transition-transform transform ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0 fixed md:relative z-50`}
      >
        <div className="flex flex-col gap-2 p-2 font-semibold">
          <SidebarItem href="/admin" icon={LayoutDashboard} label="Dashboard" />

          <SidebarItem
            href="/admin/tutorials"
            icon={GraduationCap}
            label="Tutorials"
          />

          <span className="w-full border-t-2 border-gray-300 text-gray-500"></span>
          <SidebarItem href="/admin/users" icon={User} label="Users" />

          <span className="w-full border-t-2 border-gray-300 text-gray-500"></span>
          <SidebarItem href="/admin/settings" icon={Cog} label="Settings" />
        </div>
      </div>
      {/* Content */}
      <div className="flex-1">
        {/* Mobile menu button */}
        <button
          onClick={toggleSidebar}
          className="fixed bottom-4 left-4 md:hidden p-2 gap-0.5 font-semibold text-xs justify-center items-center flex z-50 bg-gray-100 hover:bg-gray-300 shadow transition rounded-full border-gray-300"
        >
          <Sidebar />
          Sidebar
        </button>
        {/* Your content goes here */}
        <div className="p-4">{/* Content */}</div>
      </div>
    </div>
  );
}
