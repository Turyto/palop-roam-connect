
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import UserMenu from './UserMenu';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const { user, loading } = useAuth();

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <nav className="bg-white shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center space-x-2">
          <span className="font-display font-bold text-2xl">
            <span className="text-palop-green">PALOP</span>
            <span className="text-palop-blue">Roam</span>
          </span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-6">
          <Link 
            to="/" 
            className={`font-medium hover:text-palop-green transition-colors ${location.pathname === '/' ? 'text-palop-green' : ''}`}
          >
            Home
          </Link>
          <Link 
            to="/plans" 
            className={`font-medium hover:text-palop-green transition-colors ${location.pathname === '/plans' ? 'text-palop-green' : ''}`}
          >
            Plans
          </Link>
          <Link 
            to="/community" 
            className={`font-medium hover:text-palop-green transition-colors ${location.pathname === '/community' ? 'text-palop-green' : ''}`}
          >
            Community
          </Link>
          <Link 
            to="/countries" 
            className={`font-medium hover:text-palop-green transition-colors ${location.pathname === '/countries' ? 'text-palop-green' : ''}`}
          >
            Countries
          </Link>
          <Link 
            to="/support" 
            className={`font-medium hover:text-palop-green transition-colors ${location.pathname === '/support' ? 'text-palop-green' : ''}`}
          >
            Support
          </Link>
          
          {!loading && (
            user ? (
              <UserMenu />
            ) : (
              <>
                <Button variant="outline" asChild>
                  <Link to="/auth">Sign In</Link>
                </Button>
                <Button className="bg-palop-green hover:bg-palop-green/90 text-white" asChild>
                  <Link to="/plans">Get Started</Link>
                </Button>
              </>
            )
          )}
        </div>

        {/* Mobile menu button */}
        <button 
          onClick={toggleMenu}
          className="md:hidden p-2 text-gray-600 hover:text-palop-green"
        >
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="md:hidden py-4 px-4 bg-white border-t animate-fade-in">
          <div className="flex flex-col space-y-4">
            <Link 
              to="/" 
              className={`font-medium hover:text-palop-green transition-colors px-2 py-1 ${location.pathname === '/' ? 'text-palop-green' : ''}`}
              onClick={() => setIsMenuOpen(false)}
            >
              Home
            </Link>
            <Link 
              to="/plans" 
              className={`font-medium hover:text-palop-green transition-colors px-2 py-1 ${location.pathname === '/plans' ? 'text-palop-green' : ''}`}
              onClick={() => setIsMenuOpen(false)}
            >
              Plans
            </Link>
            <Link 
              to="/community" 
              className={`font-medium hover:text-palop-green transition-colors px-2 py-1 ${location.pathname === '/community' ? 'text-palop-green' : ''}`}
              onClick={() => setIsMenuOpen(false)}
            >
              Community
            </Link>
            <Link 
              to="/countries" 
              className={`font-medium hover:text-palop-green transition-colors px-2 py-1 ${location.pathname === '/countries' ? 'text-palop-green' : ''}`}
              onClick={() => setIsMenuOpen(false)}
            >
              Countries
            </Link>
            <Link 
              to="/support" 
              className={`font-medium hover:text-palop-green transition-colors px-2 py-1 ${location.pathname === '/support' ? 'text-palop-green' : ''}`}
              onClick={() => setIsMenuOpen(false)}
            >
              Support
            </Link>
            
            {!loading && (
              user ? (
                <div className="px-2 py-1">
                  <UserMenu />
                </div>
              ) : (
                <>
                  <Button variant="outline" className="w-full" asChild>
                    <Link to="/auth" onClick={() => setIsMenuOpen(false)}>Sign In</Link>
                  </Button>
                  <Button className="bg-palop-green hover:bg-palop-green/90 text-white w-full" asChild>
                    <Link to="/plans" onClick={() => setIsMenuOpen(false)}>Get Started</Link>
                  </Button>
                </>
              )
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
