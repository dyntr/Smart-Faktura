"use client";

import { signOutAction } from "@/lib/actions/auth";
import { LogOut } from "lucide-react";
import React from "react";
import { DropdownMenuItem } from "./ui/dropdown-menu";

const LogoutButton = () => {
  return (
    <DropdownMenuItem
      className="cursor-pointer"
      onClick={() => signOutAction()}
    >
      <LogOut className="mr-2 h-4 w-4" />
      <span>Log out</span>
    </DropdownMenuItem>
  );
};

export default LogoutButton;
