import { Link } from 'react-router-dom';
import { Package, LogOut, Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import { useState } from 'react';

export const Navbar = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const getRolePath = () => {
    if (!user) return '/';
    switch (user.role) {
      case 'admin': return '/admin';
      case 'agent': return '/agent';
      case 'customer': return '/customer';
      default: return '/';
    }
  };

  return (
    <nav className="sticky top-0 z-50 bg-card border-b border-border shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to={getRolePath()} className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <Package className="h-8 w-8 text-primary" />
            <span className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              ShipTrack Pro
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-4">
            {isAuthenticated && user && (
              <>
                <span className="text-sm text-muted-foreground">
                  Welcome, <span className="font-medium text-foreground">{user.name}</span>
                </span>
                <span className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary font-medium uppercase">
                  {user.role}
                </span>
                <Link to="/admin">
                  <Button variant="ghost" size="sm">Admin</Button>
                </Link>
                <Link to="/agent">
                  <Button variant="ghost" size="sm">Agent</Button>
                </Link>
                <Link to="/customer">
                  <Button variant="ghost" size="sm">Customer</Button>
                </Link>
                <Button variant="outline" size="sm" onClick={logout}>
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </Button>
              </>
            )}
            {!isAuthenticated && (
              <>
                <Link to="/login">
                  <Button variant="outline" size="sm">Login</Button>
                </Link>
                <Link to="/signup">
                  <Button size="sm">Sign Up</Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button 
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-border bg-card">
          <div className="px-4 py-4 space-y-3">
            {isAuthenticated && user ? (
              <>
                <div className="text-sm text-muted-foreground">
                  Welcome, <span className="font-medium text-foreground">{user.name}</span>
                </div>
                <div className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary font-medium uppercase w-fit">
                  {user.role}
                </div>
                <div className="flex gap-2">
                  <Link to="/admin" className="block flex-1">
                    <Button variant="ghost" size="sm" className="w-full">Admin</Button>
                  </Link>
                  <Link to="/agent" className="block flex-1">
                    <Button variant="ghost" size="sm" className="w-full">Agent</Button>
                  </Link>
                  <Link to="/customer" className="block flex-1">
                    <Button variant="ghost" size="sm" className="w-full">Customer</Button>
                  </Link>
                </div>
                <Button variant="outline" size="sm" className="w-full" onClick={logout}>
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Link to="/login" className="block">
                  <Button variant="outline" size="sm" className="w-full">Login</Button>
                </Link>
                <Link to="/signup" className="block">
                  <Button size="sm" className="w-full">Sign Up</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};
