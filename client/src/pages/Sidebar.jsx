import React from "react";
import { useUser, useClerk } from "@clerk/clerk-react";
import {
  Eraser,
  FileText,
  Hash,
  House,
  Scissors,
  SquarePen,
  Users,
  Image,
  LogOut,
} from "lucide-react";
import { NavLink } from "react-router-dom";

const navItems = [
  { to: "/ai", label: "Dashboard", Icon: House },
  { to: "/ai/write-article", label: "Write Article", Icon: SquarePen },
  { to: "/ai/blog-titles", label: "Blog Titles", Icon: Hash },
  { to: "/ai/generate-images", label: "Generate Images", Icon: Image },
  { to: "/ai/remove-background", label: "Remove Background", Icon: Eraser },
  { to: "/ai/remove-object", label: "Remove Objects", Icon: Scissors },
  { to: "/ai/review-resume", label: "Review Resume", Icon: FileText },
  { to: "/ai/community", label: "Community", Icon: Users },
];

const Sidebar = ({ sidebar, setSidebar }) => {
  const { user } = useUser();
  const { signOut, openUserProfile } = useClerk();

  const userPlan = user?.publicMetadata?.plan || "free";

  return (
    <div
      className={`w-60 h-full bg-white border-r border-gray-200 flex flex-col justify-between items-center
        transition-transform duration-300 ease-in-out
        sm:relative sm:translate-x-0
        ${sidebar ? "translate-x-0" : "-translate-x-full"}
        absolute sm:static top-0 left-0 z-50
      `}
    >
      <div className="my-7 w-full">
        <img
          src={user?.imageUrl}
          alt="User avatar"
          className="w-14 h-14 rounded-full mx-auto"
        />
        <h1 className="mt-2 text-center text-lg font-medium">
          {user?.fullName}
        </h1>

        <div className="mt-6 space-y-2 px-4">
          {navItems.map(({ to, label, Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === "/ai"}
              onClick={() => setSidebar(false)}
              className={({ isActive }) =>
                `px-3.5 py-2.5 flex items-center gap-3 rounded transition-colors ${
                  isActive
                    ? "bg-gradient-to-r from-[#3C81F6] to-[#9234EA] text-white"
                    : "text-gray-700 hover:bg-gray-100"
                }`
              }
            >
              <Icon className="w-5 h-5" />
              <span>{label}</span>
            </NavLink>
          ))}
        </div>
      </div>

      <div className="flex justify-between items-center w-full border-b border-gray-200 p-4">
        <div
          onClick={openUserProfile}
          className="flex gap-2 items-center cursor-pointer"
        >
          <img
            src={user?.imageUrl}
            className="w-8 h-8 rounded-full"
            alt="User Avatar"
          />
          <div>
            <h1 className="text-sm font-medium">{user?.fullName}</h1>
            <span
              className={`text-xs font-semibold px-2 py-1 rounded-full ${
                userPlan === "premium"
                  ? "bg-purple-100 text-purple-700"
                  : "bg-gray-100 text-gray-600"
              }`}
            >
              {userPlan === "premium" ? "Premium Plan" : "Free Plan"}
            </span>
          </div>
        </div>
        <LogOut
          onClick={signOut}
          className="w-5 h-5 text-gray-400 hover:text-gray-700 transition cursor-pointer"
        />
      </div>
    </div>
  );
};

export default Sidebar;
