import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { MarsMiraLogo } from '@/components/MarsMiraLogo';
import { LogOut, User, Route } from 'lucide-react';

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
      <div className="flex items-center gap-3 sm:gap-4">
        {isAuthenticated && (
          <Button
            asChild
            variant="outline"
            size="sm"
            className="rounded-full border-border/80 hover:border-emerald-300 bg-background/60 hover:bg-emerald-50/80 text-foreground/90 hover:text-emerald-950 h-10 px-4 text-sm font-semibold gap-2 transition-colors shadow-2xs cursor-pointer hidden sm:flex"
          >
            <Link to="/map">
              <Route className="h-4 w-4 text-emerald-600" />
              <span>Trasa i punktovi</span>
            </Link>
          </Button>
        )}

        {isAuthenticated && user ? (
          <div className="flex items-center gap-3 sm:gap-4">
            <Button
              asChild
              variant="outline"
              size="sm"
              className="rounded-full border-emerald-200/90 bg-emerald-50/70 text-emerald-900 hover:bg-emerald-100 hover:border-emerald-300 hover:text-emerald-950 h-10 px-4 min-w-10 sm:min-w-36.25 text-sm font-semibold transition-colors shadow-xs justify-center gap-2"
            >
              <Link
                to={user.role === 'admin' ? '/admin' : '/profile'}
                title={user.role === 'admin' ? 'Administratorski panel' : 'Uredi profil'}
              >
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                <User className="h-4 w-4 shrink-0 text-emerald-700" />
                <span className="hidden sm:inline truncate max-w-32.5">
                  {user.role === 'admin' ? `Admin: ${user.first_name}` : `${user.first_name} ${user.last_name}`}
                </span>
              </Link>
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              className="cursor-pointer rounded-full border-border hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 h-10 px-4 min-w-30 sm:min-w-36.25 text-sm font-semibold transition-colors justify-center gap-2"
            >
              <LogOut className="h-4 w-4 shrink-0" />
              <span>Odjavi se</span>
            </Button>
          </div>
        ) : (
          <Button
            asChild
            className="cursor-pointer rounded-full bg-emerald-600 hover:bg-emerald-700 !text-white text-white shadow-sm shadow-emerald-600/30 h-10 px-6 font-semibold"
          >
            <Link to="/auth" className="!text-white text-white font-semibold">Prijavi se</Link>
          </Button>
        )}
      </div>
    </header>
  );
};
