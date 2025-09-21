"use client";

import Link from "next/link";
import { Menu, Music2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { useState } from "react";
import { useAuth } from "@/context/auth-context";

const baseNavLinks = [
  { href: "/#showcase", label: "Portfólio" },
  { href: "/#about", label: "Sobre" },
  { href: "/order", label: "Pedido" },
  { href: "/profile", label: "Perfil" },
];

export function AppHeader() {
  const [isMenuOpen, setMenuOpen] = useState(false);
  const { userProfile } = useAuth();
  
  const navLinks = [...baseNavLinks];
  if(userProfile?.role === 'staff' || userProfile?.role === 'admin') {
    navLinks.push({ href: "/pedidos", label: "Pedidos (Staff)" });
  }
  if(userProfile?.role === 'admin') {
    navLinks.push({ href: "/admin", label: "Admin" });
    navLinks.push({ href: "/relatorios", label: "Relatórios" });
  }

  return (
    <header className="bg-background/80 backdrop-blur-sm sticky top-0 z-40 w-full border-b">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
        <Link href="/" className="flex items-center gap-2">
          <Music2 className="h-6 w-6 text-primary" />
          <span className="font-headline text-xl font-bold">GraceTone Connect</span>
        </Link>
        
        <nav className="hidden md:flex items-center gap-6">
          {navLinks.map((link) => (
            <Link key={link.label} href={link.href} className="text-sm font-medium hover:text-primary transition-colors">
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="md:hidden">
          <Sheet open={isMenuOpen} onOpenChange={setMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-6 w-6" />
                <span className="sr-only">Alternar Menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right">
              <SheetHeader>
                <SheetTitle className="sr-only">Menu</SheetTitle>
                <SheetDescription className="sr-only">Navegação principal do site</SheetDescription>
              </SheetHeader>
              <div className="flex flex-col gap-6 p-6">
                <Link href="/" className="flex items-center gap-2" onClick={() => setMenuOpen(false)}>
                  <Music2 className="h-6 w-6 text-primary" />
                  <span className="font-headline text-xl font-bold">GraceTone Connect</span>
                </Link>
                <nav className="flex flex-col gap-4">
                  {navLinks.map((link) => (
                    <Link
                      key={link.label}
                      href={link.href}
                      onClick={() => setMenuOpen(false)}
                      className="text-lg font-medium hover:text-primary transition-colors"
                    >
                      {link.label}
                    </Link>
                  ))}
                </nav>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
