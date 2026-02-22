import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Menu, X, Github, Linkedin, Rocket, User, Settings, LogOut } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const ProfileModal = ({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) => (
  <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent className="sm:max-w-md bg-card/80 backdrop-blur-xl border-border/50 shadow-2xl">
      <DialogHeader>
        <DialogTitle className="text-center text-2xl font-bold text-foreground">
          Made by Shubham Rajjak
        </DialogTitle>
      </DialogHeader>
      <div className="flex flex-col items-center gap-4 py-4">
        <p className="flex items-center gap-2 text-lg font-medium text-primary">
          <Rocket className="h-5 w-5" /> Developer & AI Enthusiast
        </p>
        <div className="w-full space-y-3 pt-2">
          <a
            href="https://github.com/shubhamrajjak-sys"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 rounded-xl border border-border bg-secondary/50 px-4 py-3 text-sm font-medium text-foreground hover:bg-primary/10 hover:border-primary/30 transition-all hover:scale-[1.02]"
          >
            <Github className="h-5 w-5 text-primary" />
            github.com/shubhamrajjak-sys
          </a>
          <a
            href="https://www.linkedin.com/in/shubham-rajjak?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=android_app"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 rounded-xl border border-border bg-secondary/50 px-4 py-3 text-sm font-medium text-foreground hover:bg-primary/10 hover:border-primary/30 transition-all hover:scale-[1.02]"
          >
            <Linkedin className="h-5 w-5 text-primary" />
            linkedin.com/in/shubham-rajjak
          </a>
        </div>
      </div>
    </DialogContent>
  </Dialog>
);

type UserData = {
  email?: string;
  name?: string;
  avatarUrl?: string;
} | null;

const UserAvatar = ({ user }: { user: NonNullable<UserData> }) => {
  const initial = (user.name?.[0] || user.email?.[0] || "U").toUpperCase();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast.success("Signed out successfully");
    navigate("/");
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="h-9 w-9 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-semibold shadow-md hover:shadow-lg hover:scale-105 transition-all ring-2 ring-primary/20 overflow-hidden">
          {user.avatarUrl ? (
            <img src={user.avatarUrl} alt="Avatar" className="h-full w-full object-cover" />
          ) : (
            initial
          )}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48 bg-card border-border shadow-xl z-[60]">
        <DropdownMenuItem className="gap-2 cursor-pointer">
          <User className="h-4 w-4" /> My Profile
        </DropdownMenuItem>
        <DropdownMenuItem className="gap-2 cursor-pointer">
          <Settings className="h-4 w-4" /> Settings
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="gap-2 cursor-pointer text-destructive" onClick={handleLogout}>
          <LogOut className="h-4 w-4" /> Logout
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

const Header = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [user, setUser] = useState<UserData>(null);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        const meta = session.user.user_metadata;
        setUser({
          email: session.user.email,
          name: meta?.full_name || meta?.name,
          avatarUrl: meta?.avatar_url || meta?.picture,
        });
      } else {
        setUser(null);
      }
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        const meta = session.user.user_metadata;
        setUser({
          email: session.user.email,
          name: meta?.full_name || meta?.name,
          avatarUrl: meta?.avatar_url || meta?.picture,
        });
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const openProfile = () => {
    setProfileOpen(true);
    setMobileOpen(false);
  };

  return (
    <>
      <header className="sticky top-0 z-50 bg-card/80 backdrop-blur-md border-b border-border/50">
        <div className="container mx-auto flex items-center justify-between px-6 py-4">
          <button onClick={openProfile} className="text-xl font-bold text-foreground hover:text-primary transition-colors">
            Mentormind AI
          </button>

          <nav className="hidden md:flex items-center gap-6">
            <Link to="/workspace" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Workspace
            </Link>
            <Link to="/chat" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              AI Chat
            </Link>
            <button onClick={openProfile} className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              About
            </button>
          </nav>

          <div className="hidden md:flex items-center gap-3">
            <Button size="sm" className="rounded-lg hover:scale-105 transition-transform" onClick={openProfile}>
              Get Started
            </Button>
            {user ? (
              <UserAvatar user={user} />
            ) : (
              <Link to="/signin">
                <Button size="sm" variant="secondary" className="rounded-lg hover:scale-105 transition-transform">
                  Sign In
                </Button>
              </Link>
            )}
          </div>

          <button className="md:hidden" onClick={() => setMobileOpen(!mobileOpen)}>
            {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {mobileOpen && (
          <div className="md:hidden border-t border-border bg-card px-6 py-4 flex flex-col gap-3">
            <Link to="/workspace" className="text-sm font-medium text-muted-foreground" onClick={() => setMobileOpen(false)}>Workspace</Link>
            <Link to="/chat" className="text-sm font-medium text-muted-foreground" onClick={() => setMobileOpen(false)}>AI Chat</Link>
            <button onClick={openProfile} className="text-sm font-medium text-muted-foreground text-left">About</button>
            <div className="flex gap-3 pt-2 items-center">
              <Button size="sm" className="rounded-lg flex-1" onClick={openProfile}>Get Started</Button>
              {user ? (
                <UserAvatar user={user} />
              ) : (
                <Link to="/signin" className="flex-1">
                  <Button size="sm" variant="secondary" className="rounded-lg w-full">Sign In</Button>
                </Link>
              )}
            </div>
          </div>
        )}
      </header>

      <ProfileModal open={profileOpen} onOpenChange={setProfileOpen} />
    </>
  );
};

export default Header;