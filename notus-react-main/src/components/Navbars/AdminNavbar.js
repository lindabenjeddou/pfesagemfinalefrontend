import React, { useState, useEffect } from "react";
import NavbarNotifications from "../Notifications/NavbarNotifications.js";

export default function AdminNavbar() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Récupérer les informations utilisateur depuis localStorage ou contexte
    const userData = localStorage.getItem('user');
    if (userData) {
      try {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
      } catch (error) {
        console.error('Erreur parsing user data:', error);
        // Fallback: créer un utilisateur de test pour les notifications
        setUser({
          id: 1,
          firstName: 'Test',
          lastName: 'Magasinier',
          role: 'MAGASINIER',
          email: 'test@sagemcom.com'
        });
      }
    } else {
      // Fallback: créer un utilisateur de test pour les notifications
      setUser({
        id: 1,
        firstName: 'Test',
        lastName: 'Magasinier',
        role: 'MAGASINIER',
        email: 'test@sagemcom.com'
      });
    }
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <nav className="absolute top-0 left-0 w-full z-10 bg-transparent md:flex-row md:flex-nowrap md:justify-start flex items-center p-4">
        <div className="w-full mx-autp items-center flex justify-between md:flex-nowrap flex-wrap md:px-10 px-4">
          <div className="text-white text-sm">Chargement...</div>
        </div>
      </nav>
    );
  }

  return (
    <>
      {/* Navbar */}
      <nav className="absolute top-0 left-0 w-full z-10 bg-transparent md:flex-row md:flex-nowrap md:justify-start flex items-center p-4">
        <div className="w-full mx-autp items-center flex justify-between md:flex-nowrap flex-wrap md:px-10 px-4">
          {/* Brand */}
          <a
            className="text-white text-sm uppercase hidden lg:inline-block font-semibold"
            href="#pablo"
            onClick={(e) => e.preventDefault()}
          >
            🏢 Sagemcom Admin Dashboard
          </a>
          
          {/* Navigation Items */}
          <ul className="flex-col md:flex-row list-none items-center hidden md:flex">
            {/* Notifications */}
            {user && (
              <li className="inline-block relative mr-4">
                <NavbarNotifications 
                  userId={user.id} 
                  userRole={user.role}
                />
              </li>
            )}
            
            {/* User Profile */}
            <li className="inline-block relative">
              <div className="flex items-center space-x-3">
                <div className="text-right hidden lg:block">
                  <div className="text-white text-sm font-semibold">
                    {user ? `${user.firstName} ${user.lastName}` : 'Utilisateur'}
                  </div>
                  <div className="text-blueGray-300 text-xs">
                    {user ? user.role : 'ADMIN'}
                  </div>
                </div>
                <a
                  className="text-blueGray-500 block"
                  href="#pablo"
                  onClick={(e) => e.preventDefault()}
                >
                  <div className="items-center flex">
                    <span className="w-12 h-12 text-sm text-white bg-blueGray-200 inline-flex items-center justify-center rounded-full border-2 border-white shadow-lg">
                      <i className="fas fa-user"></i>
                    </span>
                  </div>
                </a>
              </div>
            </li>
          </ul>
        </div>
      </nav>
      {/* End Navbar */}
    </>
  );
}