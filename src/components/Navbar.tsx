import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Mountain, LogOut, User } from 'lucide-react';

export const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/auth');
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-card/95 backdrop-blur-md shadow-xs">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand */}
        <Link to="/" className="flex items-center gap-3 group transition-opacity hover:opacity-90">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-linear-to-br from-emerald-500 to-emerald-700 text-white shadow-md shadow-emerald-500/20">
            <Mountain className="h-5 w-5" />
          </div>
          <div>
            <div className="text-base font-extrabold tracking-tight text-foreground uppercase">
              Marš Mira
            </div>
            <div className="text-[11px] font-semibold tracking-wider text-emerald-700 uppercase">
              Srebrenica
            </div>
          </div>
        </Link>

        {/* User / Actions */}
        <div className="flex items-center gap-3">
          {isAuthenticated && user ? (
            <div className="flex items-center gap-3">
              <Badge variant="secondary" className="hidden sm:flex items-center gap-1.5 py-1 px-3 text-xs font-semibold rounded-full bg-emerald-50 text-emerald-800 border-emerald-200">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                <User className="h-3.5 w-3.5" />
                <span>{user.first_name} {user.last_name}</span>
              </Badge>

              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
                className="cursor-pointer rounded-full border-border hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200"
              >
                <LogOut className="h-4 w-4 mr-1 sm:mr-1.5" />
                <span>Odjavi se</span>
              </Button>
            </div>
          ) : (
            <Button
              asChild
              className="cursor-pointer rounded-full bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm shadow-emerald-600/30"
            >
              <Link to="/auth">Prijavi se</Link>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
};
