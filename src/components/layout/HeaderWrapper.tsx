"use client";
import React from "react";
import Header from "./Header";
import { usePathname } from "next/navigation";

const HeaderWrapper = () => {
  const pathName = usePathname();
  const hideHeaderPath = ["/auth/reset-password"];

  const isHideHeader = hideHeaderPath.includes(pathName);

  if (isHideHeader) {
    return null;
  }
  return <Header />;
};

export default HeaderWrapper;
