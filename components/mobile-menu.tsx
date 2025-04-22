"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Menu, UserCircle, LogOut } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Session } from "next-auth";
import { signOutAction } from "@/lib/actions/auth";
import { NavLinks } from "./nav-links";

export default function MobileMenu({ session }: { session: Session | null }) {
  const [open, setOpen] = useState(false);

  const handleLogout = async () => {
    setOpen(false);
    signOutAction();
  };

  return (
    <div className="md:hidden">
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="h-9 w-9">
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="right" className="w-[250px] sm:w-[300px]">
          <div className="flex flex-col h-full py-4">
            <div className="mb-4 border-b pb-4 flex justify-start">
              <Link
                href="/"
                className="text-xl font-bold text-primary"
                onClick={() => setOpen(false)}
              >
                InvoiceApp
              </Link>
            </div>

            <nav className="flex flex-col space-y-2">
              {session ? (
                <>
                  {NavLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setOpen(false)}
                      className="flex items-center py-2 hover:text-primary transition-colors"
                    >
                      {link.label}
                    </Link>
                  ))}

                  <div className="mt-auto pt-4 border-t">
                    {session.user?.name && (
                      <div className="flex items-center gap-2 mb-2">
                        <UserCircle className="h-5 w-5" />
                        <span className="font-medium">{session.user.name}</span>
                      </div>
                    )}
                    {session.user?.email && (
                      <p className="text-sm text-muted-foreground mb-4">
                        {session.user.email}
                      </p>
                    )}

                    <Button
                      onClick={handleLogout}
                      variant="outline"
                      className="w-full bg-red-500"
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      Logout
                    </Button>
                  </div>
                </>
              ) : (
                <>
                  <Link
                    href="/auth/signin"
                    onClick={() => setOpen(false)}
                    className="flex items-center py-2 hover:text-primary transition-colors"
                  >
                    Log in
                  </Link>
                  <Link
                    href="/invoices/new"
                    onClick={() => setOpen(false)}
                    className="flex items-center py-2 text-primary font-medium"
                  >
                    Issue an Invoice
                  </Link>
                </>
              )}
            </nav>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
