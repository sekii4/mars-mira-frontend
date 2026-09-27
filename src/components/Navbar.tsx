import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MarsMiraLogo } from '@/components/MarsMiraLogo';
import { LogOut, User } from 'lucide-react';

export const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/auth');
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-card/95 backdrop-blur-md shadow-xs flex items-center justify-between px-6 sm:px-10 lg:px-16 h-20">
      {/* Brand */}
      <Link to="/" className="flex items-center gap-3.5 group transition-opacity hover:opacity-90">
        <MarsMiraLogo className="h-11 w-11 rounded-xl shadow-sm border border-border/40" />
        <div>
          <div className="text-lg font-black tracking-tight text-foreground uppercase">
            Marš Mira
          </div>
          <div className="text-xs font-bold tracking-widest text-emerald-600 uppercase">
            Srebrenica
          </div>
        </div>
      </Link>

      {/* User / Actions */}
      <div className="flex items-center gap-4">
        {isAuthenticated && user ? (
          <div className="flex items-center gap-3 sm:gap-4">
            <Badge variant="secondary" className="hidden sm:flex items-center gap-2 py-1.5 px-4 text-xs font-semibold rounded-full bg-emerald-50 text-emerald-800 border-emerald-200 shadow-xs">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <User className="h-3.5 w-3.5" />
              <span>{user.first_name} {user.last_name}</span>
            </Badge>

            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              className="cursor-pointer rounded-full border-border hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 h-10 px-5 text-sm font-semibold transition-colors"
            >
              <LogOut className="h-4 w-4 mr-2" />
              <span>Odjavi se</span>
            </Button>
          </div>
        ) : (
          <Button
            asChild
            className="cursor-pointer rounded-full bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm shadow-emerald-600/30 h-10 px-6 font-semibold"
          >
            <Link to="/auth">Prijavi se</Link>
          </Button>
        )}
      </div>
    </header>
  );
};
