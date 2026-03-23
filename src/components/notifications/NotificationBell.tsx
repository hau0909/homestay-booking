import React from "react";
import { Bell } from "lucide-react";

const NotificationBell = ({
  count,
  onClick,
}: {
  count: number;
  onClick: () => void;
}) => {
  return (
    <div>
      {count > 0 ? (
        <button
          onClick={onClick}
          className="relative cursor-pointer p-3 bg-white text-black hover:bg-gray-300 active:brightness-90 shadow-2xl rounded-2xl transition-all ease-linear"
        >
          <Bell />

          <div className="absolute -top-1 -right-1 size-5 flex items-center justify-center">
            <span className="absolute size-5 rounded-full bg-red-400 animate-ping"></span>

            <span className="absolute size-5 rounded-full bg-red-400"></span>

            <span className="relative text-white text-xs font-bold">
              {count}
            </span>
          </div>
        </button>
      ) : (
        <button
          onClick={onClick}
          className="relative cursor-pointer p-3 bg-white text-black hover:bg-gray-300 active:brightness-90 shadow-2xl rounded-2xl transition-all ease-linear"
        >
          <Bell />
        </button>
      )}
    </div>
  );
};

export default NotificationBell;
