import { DoorOpen, HomeIcon } from "lucide-react";
import { useTranslation } from "react-i18next";

export default function Navbar() {
  const handleSignOut = async () => {
    console.info("signing out");
    const res = await fetch("/auth/logout", {
      method: "POST",
    });
    if (res.status === 200) {
      window.location.href = "/";
    }
  };

  const { t } = useTranslation();
  return (
    <div className="w-full p-4 bg-gray-200 border-b-2 border-gray-300 text-gray-800 z-50 flex justify-between gap-2">
      <a
        href="/"
        className="flex gap-0.5 bg-orange-500 font-semibold hover:bg-orange-300 transition-colors duration-150 border border-orange-500 rounded-2xl p-4 text-white hover:text-gray-700"
      >
        <HomeIcon />
        <span>{t("navbar.home")}</span>
      </a>
      <div className="justify-items-center">
        <button
          type="button"
          onClick={handleSignOut}
          className="flex gap-0.5 bg-red-500 font-semibold hover:bg-red-300 transition-colors duration-150 border border-red-500 rounded-2xl p-4 text-white hover:text-gray-700"
        >
          <DoorOpen />
          {t("navbar.signout")}
        </button>
      </div>
    </div>
  );
}
