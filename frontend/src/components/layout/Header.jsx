import React from 'react';

const Header = ({ toggleSidebar, isSidebarOpen }) => (
  <header className="bg-white p-4 shadow-md sticky top-0 z-10">
    <div className="flex items-center justify-between">
      <div className="flex items-center space-x-4">
        <button
          onClick={toggleSidebar}
          className="text-gray-600 p-2 hover:bg-gray-100 rounded-md"
          aria-label={isSidebarOpen ? 'Close sidebar' : 'Open sidebar'}
        >
          {isSidebarOpen ? '✕' : '☰'}
        </button>
        <h1 className="text-xl font-semibold text-gray-800">
          Timetable Management
        </h1>
      </div>
      <div className="flex items-center space-x-4">
        <span className="text-gray-600">Admin</span>
        <img
          src="https://via.placeholder.com/40?text=User"
          alt="User"
          className="h-10 w-10 rounded-full"
        />
      </div>
    </div>
  </header>
);

export default Header;