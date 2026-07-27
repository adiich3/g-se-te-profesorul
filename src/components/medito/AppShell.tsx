import { Link, useNavigate } from "@tanstack/react-router";
import {
  CalendarDays,
  Compass,
  LayoutDashboard,
  LogOut,
  Menu,
  User,
  Zap,
} from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";
import type { User as SupabaseUser } from "@supabase/supabase-js";

import { Logo } from "./Logo";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabase/client";

type NavItem = {
  to: string;
  label: string;
  icon: typeof Compass;
};

type Profile = {
  id: string;
  email: string | null;
  role: string;
  full_name: string | null;
};

const publicNav: NavItem[] = [
  { to: "/cauta", label: "Caută profesori", icon: Compass },
  { to: "/urgent", label: "Ajutor azi", icon: Zap },
];

const studentNav: NavItem[] = [
  { to: "/dashboard", label: "Panou", icon: LayoutDashboard },
  { to: "/cauta", label: "Caută", icon: Compass },
  { to: "/urgent", label: "Ajutor azi", icon: Zap },
  {
    to: "/profesor-dashboard",
    label: "Sunt profesor",
    icon: CalendarDays,
  },
];

export function AppShell({
  children,
  nav = "public",
  footer = true,
  className,
}: {
  children: ReactNode;
  nav?: "public" | "app";
  footer?: boolean;
  className?: string;
}) {
  const navigate = useNavigate();

  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  const items = nav === "public" ? publicNav : studentNav;

  useEffect(() => {
    let mounted = true;

    async function loadProfile(currentUser: SupabaseUser | null) {
      if (!mounted) {
        return;
      }

      setUser(currentUser);

      if (!currentUser) {
        setProfile(null);
        setAuthLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("profiles")
        .select("id, email, role, full_name")
        .eq("id", currentUser.id)
        .maybeSingle();

      if (!mounted) {
        return;
      }

      if (error) {
        console.error("Eroare la încărcarea profilului:", error);
        setProfile(null);
      } else {
        setProfile(data);
      }

      setAuthLoading(false);
    }

    supabase.auth.getUser().then(({ data }) => {
      void loadProfile(data.user);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      void loadProfile(session?.user ?? null);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  async function logout() {
    const { error } = await supabase.auth.signOut();

    if (error) {
      console.error("Eroare la logout:", error);
      return;
    }

    setUser(null);
    setProfile(null);

    await navigate({
      to: "/",
    });
  }

  const displayName =
    profile?.full_name ||
    user?.user_metadata?.full_name ||
    user?.email ||
    "Contul meu";

  const accountRoute =
    profile?.role === "tutor" ? "/profesor-dashboard" : "/dashboard";

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="sticky top-0 z-40 border-b border-border/70 bg-background/85 backdrop-blur">
        <div className="page-container grid h-16 grid-cols-[minmax(0,1fr)_auto] items-center gap-4">
          <Logo />

          <div className="flex items-center gap-1">
            <nav
              className="hidden items-center gap-1 md:flex"
              aria-label="Navigare principală"
            >
              {items.map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  activeProps={{
                    className: "text-foreground bg-secondary",
                  }}
                  className="rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                >
                  {item.label}
                </Link>
              ))}
            </nav>

            {!authLoading && !user && (
              <Button
                asChild
                size="sm"
                className="ml-2 hidden md:inline-flex"
              >
                <Link to="/auth">Intră în cont</Link>
              </Button>
            )}

            {!authLoading && user && (
              <div className="ml-2 hidden items-center gap-2 md:flex">
                <Button asChild variant="ghost" size="sm">
                  <Link to={accountRoute}>
                    <User className="mr-2 size-4" />
                    {displayName}
                  </Link>
                </Button>

                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={logout}
                  aria-label="Ieși din cont"
                  title="Ieși din cont"
                >
                  <LogOut className="size-4" />
                </Button>
              </div>
            )}

            <Sheet>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="md:hidden"
                  aria-label="Deschide meniul"
                >
                  <Menu />
                </Button>
              </SheetTrigger>

              <SheetContent side="right" className="w-72">
                <SheetTitle className="px-4 pt-4">Meniu</SheetTitle>

                <nav className="flex flex-col gap-1 p-4">
                  {items.map((item) => (
                    <Link
                      key={item.to}
                      to={item.to}
                      className="rounded-lg px-3 py-2.5 text-sm font-medium text-foreground hover:bg-secondary"
                    >
                      {item.label}
                    </Link>
                  ))}

                  {!authLoading && !user && (
                    <Button asChild className="mt-3">
                      <Link to="/auth">Intră în cont</Link>
                    </Button>
                  )}

                  {!authLoading && user && (
                    <>
                      <Link
                        to={accountRoute}
                        className="mt-3 flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium text-foreground hover:bg-secondary"
                      >
                        <User className="size-4" />
                        {displayName}
                      </Link>

                      <Button
                        type="button"
                        variant="outline"
                        className="mt-2 w-full justify-start"
                        onClick={logout}
                      >
                        <LogOut className="mr-2 size-4" />
                        Ieși din cont
                      </Button>
                    </>
                  )}
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>

      <main className={cn("flex-1 pb-20 md:pb-0", className)}>
        {children}
      </main>

      {footer && (
        <footer className="border-t border-border/70 bg-surface">
          <div className="page-container flex flex-col gap-6 py-10 sm:flex-row sm:items-start sm:justify-between">
            <div className="max-w-xs">
              <Logo />

              <p className="mt-3 text-sm text-muted-foreground">
                Meditații 1 la 1 cu profesori verificați, pentru obiective clare.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-8 text-sm">
              <div className="space-y-2">
                <p className="font-semibold">Elevi</p>

                <Link
                  to="/cauta"
                  className="block text-muted-foreground hover:text-foreground"
                >
                  Caută profesori
                </Link>

                <Link
                  to="/onboarding"
                  className="block text-muted-foreground hover:text-foreground"
                >
                  Găsește potrivirea
                </Link>

                <Link
                  to="/urgent"
                  className="block text-muted-foreground hover:text-foreground"
                >
                  Am nevoie de ajutor azi
                </Link>
              </div>

              <div className="space-y-2">
                <p className="font-semibold">Profesori</p>

                <Link
                  to="/profesor-onboarding"
                  className="block text-muted-foreground hover:text-foreground"
                >
                  Devino profesor
                </Link>

                <Link
                  to="/profesor-dashboard"
                  className="block text-muted-foreground hover:text-foreground"
                >
                  Panou profesor
                </Link>

                <Link
                  to="/admin"
                  className="block text-muted-foreground hover:text-foreground"
                >
                  Administrare
                </Link>
              </div>
            </div>
          </div>

          <div className="page-container border-t border-border/70 py-5 text-xs text-muted-foreground">
            Medito · date demonstrative · {new Date().getFullYear()}
          </div>
        </footer>
      )}

      <MobileTabBar
        user={user}
        profile={profile}
        accountRoute={accountRoute}
      />
    </div>
  );
}

function MobileTabBar({
  user,
  profile,
  accountRoute,
}: {
  user: SupabaseUser | null;
  profile: Profile | null;
  accountRoute: "/dashboard" | "/profesor-dashboard";
}) {
  const items: NavItem[] = [
    { to: "/", label: "Acasă", icon: Compass },
    { to: "/cauta", label: "Caută", icon: Compass },
    { to: "/urgent", label: "Azi", icon: Zap },
    {
      to: user ? accountRoute : "/auth",
      label: user
        ? profile?.role === "tutor"
          ? "Profesor"
          : "Cont"
        : "Cont",
      icon: user ? LayoutDashboard : User,
    },
  ];

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-4 border-t border-border bg-background/95 pb-[env(safe-area-inset-bottom)] backdrop-blur md:hidden"
      aria-label="Navigare mobilă"
    >
      {items.map((item) => (
        <Link
          key={item.label}
          to={item.to}
          activeOptions={{ exact: item.to === "/" }}
          activeProps={{ className: "text-primary" }}
          className="flex flex-col items-center gap-1 py-2.5 text-[11px] font-medium text-muted-foreground"
        >
          <item.icon className="size-5" aria-hidden />
          {item.label}
        </Link>
      ))}
    </nav>
  );
}