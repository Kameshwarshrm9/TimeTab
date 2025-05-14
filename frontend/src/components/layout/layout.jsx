import React, { useContext, useEffect } from 'react';
import Header from './Header';
import Sidebar from './Sidebar';
import Footer from './Footer';
import { Outlet } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AuthContext } from '../../AuthContext.jsx'; // Updated to .jsx

const Layout = () => {
  const { updateActivity } = useContext(AuthContext);

  // Track user activity to reset session timeout
  useEffect(() => {
    const handleActivity = () => updateActivity();

    window.addEventListener('click', handleActivity);
    window.addEventListener('keypress', handleActivity);

    return () => {
      window.removeEventListener('click', handleActivity);
      window.removeEventListener('keypress', handleActivity);
    };
  }, [updateActivity]);

  return (
    <div style={{ display: 'flex', height: '100vh' }} onClick={updateActivity} onKeyPress={updateActivity}>
      <Sidebar />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <Header />
        <main style={{ flex: 1, padding: '1rem', backgroundColor: '#f5f5f5' }}>
          <Outlet />
        </main>
        <Footer />
      </div>

      {/* Toast notifications */}
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
      />
    </div>
  );
};

export default Layout;