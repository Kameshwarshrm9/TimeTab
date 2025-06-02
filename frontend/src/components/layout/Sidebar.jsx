import React, { useContext } from 'react';
import { NavLink } from 'react-router-dom';
import { AuthContext } from '../../AuthContext.jsx';

const Sidebar = ({ isOpen, toggleSidebar }) => {
  const { logout } = useContext(AuthContext);

  const navStyle = {
    background: '#2d3748',
    color: 'white',
    width: '220px',
    height: '100vh',
    position: 'fixed',
    top: 0,
    left: isOpen ? '0' : '-220px',
    transition: 'left 0.3s ease-in-out',
    zIndex: 1000,
    display: 'flex',
    flexDirection: 'column',
  };

  const contentStyle = {
    flex: 1,
    overflowY: 'auto',
    padding: '1rem',
  };

  const closeButtonStyle = {
    padding: '0.5rem',
    textAlign: 'right',
  };

  const linkStyle = ({ isActive }) => ({
    color: isActive ? '#63b3ed' : '#fff',
    textDecoration: 'none',
    margin: '0.5rem 0',
    fontWeight: isActive ? 'bold' : 'normal',
    display: 'block',
    padding: '0.5rem',
  });

  return (
    <nav style={navStyle}>
      <div style={closeButtonStyle}>
        <button
          onClick={toggleSidebar}
          className="text-white p-2"
          aria-label="Close sidebar"
        >
          ✕
        </button>
      </div>
      <div style={contentStyle}>
        <NavLink to="/" style={linkStyle}>Dashboard</NavLink>
        <NavLink to="/teachers" style={linkStyle}>Teachers</NavLink>
        <NavLink to="/teachers/add" style={linkStyle}>Add Teacher</NavLink>
        <NavLink to="/subjects" style={linkStyle}>Subjects</NavLink>
        <NavLink to="/subjects/add" style={linkStyle}>Add Subject</NavLink>
        <NavLink to="/branches" style={linkStyle}>Branches</NavLink>
        <NavLink to="/branches/add" style={linkStyle}>Add Branch</NavLink>
        <NavLink to="/assignments/branch-subject-assign" style={linkStyle}>Assign Branch Subjects</NavLink>
        <NavLink to="/assignments/branch-subject-view" style={linkStyle}>View Assigned Branch Subjects</NavLink>
        <NavLink to="/assignments/assign-teacher-to-subject" style={linkStyle}>Assign Teachers Subject</NavLink>
        <NavLink to="/assignments/view" style={linkStyle}>View Assign Teacher Subject</NavLink>  
        <NavLink to="/assign-branch-subject-teacher" style={linkStyle}>Assign Teacher to Branch-Subject</NavLink>
        <NavLink to="/assignments/view-branch-semester-assignments" style={linkStyle}>View Assign Teacher to Branch-Subject</NavLink>
        <NavLink to="/timetable/generate" style={linkStyle}>Generate Timetable</NavLink>
        <NavLink to="/timetable/view" style={linkStyle}>View Timetable</NavLink>
        <NavLink to="/teacher-timetable" style={linkStyle}>View Teacher Timetable</NavLink>
        <NavLink to="/reset-database" style={linkStyle}>Backup & Reset Database</NavLink>
        <button
          onClick={logout}
          style={{
            color: '#fff',
            textDecoration: 'none',
            margin: '0.5rem 0',
            background: 'none',
            border: 'none',
            textAlign: 'left',
            cursor: 'pointer',
            padding: '0.5rem',
            width: '100%',
          }}
        >
          Logout
        </button>
      </div>
    </nav>
  );
};

export default Sidebar;