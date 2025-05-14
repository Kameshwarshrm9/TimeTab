import React, { useContext } from 'react';
import { NavLink } from 'react-router-dom';
import { AuthContext } from '../../AuthContext.jsx'; // Fixed import path

const Sidebar = () => {
  const { logout } = useContext(AuthContext);

  const navStyle = {
    display: 'flex',
    flexDirection: 'column',
    padding: '1rem',
    background: '#2d3748',
    color: 'white',
    width: '220px',
    height: '100vh',
  };

  const linkStyle = ({ isActive }) => ({
    color: isActive ? '#63b3ed' : '#fff',
    textDecoration: 'none',
    margin: '0.5rem 0',
    fontWeight: isActive ? 'bold' : 'normal',
  });

  return (
    <nav style={navStyle}>
      <NavLink to="/" style={linkStyle}>Dashboard</NavLink>
      <NavLink to="/teachers" style={linkStyle}>Teachers</NavLink>
      <NavLink to="/teachers/add" style={linkStyle}>Add Teacher</NavLink>
      <NavLink to="/subjects" style={linkStyle}>Subjects</NavLink>
      <NavLink to="/subjects/add" style={linkStyle}>Add Subject</NavLink>
      <NavLink to="/branches" style={linkStyle}>Branches</NavLink>
      <NavLink to="/branches/add" style={linkStyle}>Add Branch</NavLink>
      <NavLink to="/assignments/teacher-subject" style={linkStyle}>Assign Teachers</NavLink>
      <NavLink to="/assignments/branch-subject-assign" style={linkStyle}>Assign Subjects</NavLink>
      <NavLink to="/assignments/branch-subject-view" style={linkStyle}>View Assigned Subjects</NavLink>
      <NavLink to="/assignments/assign-teacher-to-subject" style={linkStyle}>Assign Teachers to Subject</NavLink>
      <NavLink to="/assignments/view" style={linkStyle}>View Assign Teacher Subject</NavLink>
      <NavLink to="/timetable/generate" style={linkStyle}>Generate Timetable</NavLink>
      <NavLink to="/timetable/view" style={linkStyle}>View Timetable</NavLink>
      <NavLink to="/teacher-timetable" style={linkStyle}>View Teacher Timetable</NavLink>
      <NavLink to="/assign-branch-subject-teacher" style={linkStyle}>Assign Teacher to Branch-Subject</NavLink>
      <NavLink to="/assignments/view-branch-semester-assignments" style={linkStyle}>View Assign Teacher to Branch</NavLink>
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
        }}
      >
        Logout
      </button>
    </nav>
  );
};

export default Sidebar;