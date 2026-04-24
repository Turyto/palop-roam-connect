
import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import { useAuth } from "@/contexts/auth";
import UserMenu from "./UserMenu";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const { user, loading } = useAuth();

  const navigation = [
    { name: "Home", href: "/" },
    { name: "Plans", href: "/plans" },
    { name: "eSIM Guide", href: "/esim" },
    { name: "Countries", href: "/countries" },
    { name: "Community", href: "/community" },
    { name: "Support", href: "/support" },
  ];

  // Add Orders to navigation if user is logged in
  const userNavigation = user 
    ? [...navigation.slice(0, 2), { name: "Orders", href: "/orders" }, ...navigation.slice(2)]
    : navigation;

  const isActive = (href: string) => {
    if (href === "/" && location.pathname === "/") return true;
    if (href !== "/" && location.pathname.startsWith(href)) return true;
    return false;
  };

  const renderAuthSection = () => {
    if (loading) {
      return (
        <div className="text-sm text-gray-500 px-4 py-2">
          Loading...
        </div>
      );
    }

    if (user) {
      return <UserMenu />;
    }

    return (
      <Button asChild>
        <Link to="/auth">Sign In</Link>
      </Button>
    );
  };

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center">
            <img
              src="/palop-connect-logo.jpg"
              alt="PALOP Connect"
              className="h-10 w-44 object-cover object-center"
            />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {userNavigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={`text-sm font-medium transition-colors hover:text-palop-green ${
                  isActive(item.href)
                    ? "text-palop-green border-b-2 border-palop-green pb-1"
                    : "text-gray-600"
                }`}
              >
                {item.name}
              </Link>
            ))}
          </div>

          {/* Auth Section */}
          <div className="hidden md:flex items-center space-x-4">
            {renderAuthSection()}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsOpen(!isOpen)}
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden border-t border-gray-200 py-4">
            <div className="flex flex-col space-y-4">
              {userNavigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`text-sm font-medium transition-colors hover:text-palop-green ${
                    isActive(item.href) ? "text-palop-green" : "text-gray-600"
                  }`}
                  onClick={() => setIsOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
              
              <div className="pt-4 border-t border-gray-200">
                {renderAuthSection()}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
