
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Menu, X, Globe, Phone } from "lucide-react";
import { Link } from 'react-router-dom';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

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
          <Link to="/" className="font-medium hover:text-palop-green transition-colors">Home</Link>
          <Link to="/plans" className="font-medium hover:text-palop-green transition-colors">Plans</Link>
          <Link to="/countries" className="font-medium hover:text-palop-green transition-colors">Countries</Link>
          <Link to="/support" className="font-medium hover:text-palop-green transition-colors">Support</Link>
          <Button className="ml-4 bg-palop-green hover:bg-palop-green/90 text-white">
            Get Started
          </Button>
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
            <Link to="/" className="font-medium hover:text-palop-green transition-colors px-2 py-1">Home</Link>
            <Link to="/plans" className="font-medium hover:text-palop-green transition-colors px-2 py-1">Plans</Link>
            <Link to="/countries" className="font-medium hover:text-palop-green transition-colors px-2 py-1">Countries</Link>
            <Link to="/support" className="font-medium hover:text-palop-green transition-colors px-2 py-1">Support</Link>
            <Button className="bg-palop-green hover:bg-palop-green/90 text-white w-full">
              Get Started
            </Button>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
