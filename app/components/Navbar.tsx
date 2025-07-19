import React, { useState } from "react";
import { Link, useNavigate } from "react-router";
import { usePuterStore } from "~/lib/puter";

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const { auth } = usePuterStore();
  const navigate = useNavigate();

  const handleLogOut = () => {
    auth.signOut();
    navigate("/");
    setMenuOpen(false);
  };

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  console.log(auth);
  return (
    <nav className="navbar flex items-center justify-between px-4 py-2 relative">
      <Link to="/">
        <p className="text-2xl font-bold text-gradient">ResumeWise</p>
      </Link>

      {/* Desktop menu */}
      <div className="hidden sm:flex gap-4 items-center">
        {auth.isAuthenticated ? (
          <>
            <span className="!text-lg font-bold">{auth.user?.username}</span>
            <Link to="/upload" className="primary-button w-fit">
              Upload Resume
            </Link>
            <button className="secondary-button w-fit" onClick={handleLogOut}>
              Log Out
            </button>
          </>
        ) : (
          <Link to="/login" className="primary-button w-fit">
            Login
          </Link>
        )}
      </div>

      {/* Mobile menu button */}
      <button
        className="sm:hidden flex flex-col justify-center items-center w-8 h-8 space-y-1"
        onClick={toggleMenu}
        aria-label="Toggle menu"
      >
        <span
          className={`block w-6 h-0.5 bg-current transition-all duration-300 ${
            menuOpen ? "rotate-45 translate-y-1.5" : ""
          }`}
        ></span>
        <span
          className={`block w-6 h-0.5 bg-current transition-all duration-300 ${
            menuOpen ? "opacity-0" : ""
          }`}
        ></span>
        <span
          className={`block w-6 h-0.5 bg-current transition-all duration-300 ${
            menuOpen ? "-rotate-45 -translate-y-1.5" : ""
          }`}
        ></span>
      </button>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="absolute top-full left-0 right-0 bg-white shadow-lg border-t border-gray-200 sm:hidden z-50">
          <div className="flex flex-col p-4 space-y-4">
            {auth.isAuthenticated ? (
              <>
                <div className="flex items-center justify-between">
                  <span className="!text-lg font-bold">
                    {auth.user?.username}
                  </span>
                </div>
                <Link
                  to="/upload"
                  className="primary-button w-full text-center"
                  onClick={() => setMenuOpen(false)}
                >
                  Upload Resume
                </Link>
                <button
                  className="secondary-button w-full"
                  onClick={handleLogOut}
                >
                  Log Out
                </button>
              </>
            ) : (
              <Link
                to="/login"
                className="primary-button w-full text-center"
                onClick={() => setMenuOpen(false)}
              >
                Login
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
