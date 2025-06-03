import React, { useContext, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { AuthContext } from '../../AuthContext.jsx';
import { FiChevronDown, FiChevronRight } from 'react-icons/fi'; // Import modern chevron icons

const Sidebar = ({ isOpen, toggleSidebar }) => {
  const { logout } = useContext(AuthContext);
  const [expandedSection, setExpandedSection] = useState(null);

  const toggleSection = (section) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

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
    padding: '0.5rem',
  };

  const closeButtonStyle = {
    padding: '0.5rem',
    textAlign: 'right',
  };

  const closeButtonInnerStyle = {
    background: '#4a5568',
    color: '#fff',
    border: 'none',
    borderRadius: '50%',
    width: '30px',
    height: '30px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    transition: 'background 0.2s ease, transform 0.1s ease',
  };

  const closeButtonHoverStyle = {
    background: '#718096',
    transform: 'scale(1.05)',
  };

  const sectionStyle = {
    margin: '0.25rem 0',
    cursor: 'pointer',
  };

  const sectionHeaderStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '0.5rem',
    fontWeight: 'bold',
    color: '#fff',
    transition: 'color 0.2s ease', // Smooth color transition on hover
  };

  const iconStyle = {
    transition: 'transform 0.2s ease', // Smooth rotation transition
    transform: 'none', // Default state (for FiChevronRight)
  };

  const iconExpandedStyle = {
    transform: 'rotate(90deg)', // Rotate the icon when expanded
  };

  const linkStyle = ({ isActive }) => ({
    color: isActive ? '#63b3ed' : '#d1d5db',
    textDecoration: 'none',
    display: 'block',
    padding: '0.4rem 1rem',
    fontWeight: isActive ? 'bold' : 'normal',
    fontSize: '0.95rem',
    background: isActive ? '#4a5568' : 'transparent',
    borderRadius: '4px',
    transition: 'background 0.2s ease, color 0.2s ease',
  });

  const subMenuStyle = {
    paddingLeft: '1rem',
    display: 'block',
  };

  const logoutButtonStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    background: 'linear-gradient(90deg, #e53e3e, #c53030)',
    color: '#fff',
    border: 'none',
    borderRadius: '6px',
    padding: '0.5rem 1rem',
    margin: '0.25rem 0',
    width: '100%',
    textAlign: 'left',
    cursor: 'pointer',
    fontSize: '0.95rem',
    transition: 'background 0.2s ease, transform 0.1s ease',
  };

  const logoutButtonHoverStyle = {
    background: 'linear-gradient(90deg, #f56565, #e53e3e)',
    transform: 'scale(1.02)',
  };

  const sections = [
    {
      name: 'Dashboard',
      links: [{ to: '/', label: 'Dashboard' }],
    },
    {
      name: 'Teachers',
      links: [
        { to: '/teachers', label: 'Teachers' },
        { to: '/teachers/add', label: 'Add Teacher' },
      ],
    },
    {
      name: 'Subjects',
      links: [
        { to: '/subjects', label: 'Subjects' },
        { to: '/subjects/add', label: 'Add Subject' },
      ],
    },
    {
      name: 'Branches',
      links: [
        { to: '/branches', label: 'Branches' },
        { to: '/branches/add', label: 'Add Branch' },
      ],
    },
    {
      name: 'Branch-Subject Assignments',
      links: [
        { to: '/assignments/branch-subject-assign', label: 'Assign Branch Subjects' },
        { to: '/assignments/branch-subject-view', label: 'View Assigned Branch Subjects' },
      ],
    },
    {
      name: 'Teacher-Subject Assignments',
      links: [
        { to: '/assignments/assign-teacher-to-subject', label: 'Assign Teachers Subject' },
        { to: '/assignments/view', label: 'View Assign Teacher Subject' },
      ],
    },
    {
      name: 'Teacher to Branch-Subject',
      links: [
        { to: '/assign-branch-subject-teacher', label: 'Assign Teacher to Branch-Subject' },
        { to: '/assignments/view-branch-semester-assignments', label: 'View Assign Teacher to Branch-Subject' },
      ],
    },
    {
      name: 'Timetable',
      links: [
        { to: '/timetable/generate', label: 'Generate Timetable' },
        { to: '/timetable/view', label: 'View Timetable' },
        { to: '/teacher-timetable', label: 'View Teacher Timetable' },
      ],
    },
    {
      name: 'Database',
      links: [{ to: '/reset-database', label: 'Backup & Reset Database' }],
    },
  ];

  const [closeButtonHovered, setCloseButtonHovered] = useState(false);
  const [logoutButtonHovered, setLogoutButtonHovered] = useState(false);

  return (
    <nav style={navStyle}>
      <div style={closeButtonStyle}>
        <button
          onClick={toggleSidebar}
          style={{
            ...closeButtonInnerStyle,
            ...(closeButtonHovered ? closeButtonHoverStyle : {}),
          }}
          onMouseEnter={() => setCloseButtonHovered(true)}
          onMouseLeave={() => setCloseButtonHovered(false)}
          aria-label="Close sidebar"
        >
          ✕
        </button>
      </div>
      <div style={contentStyle}>
        {sections.map((section) => (
          <div key={section.name} style={sectionStyle}>
            <div
              style={sectionHeaderStyle}
              onClick={() => toggleSection(section.name)}
              onMouseEnter={(e) => (e.currentTarget.style.color = '#63b3ed')} // Hover effect for section header
              onMouseLeave={(e) => (e.currentTarget.style.color = '#fff')}
            >
              <span>{section.name}</span>
              {section.links.length > 1 && (
                expandedSection === section.name ? (
                  <FiChevronDown
                    style={{
                      ...iconStyle,
                      ...iconExpandedStyle,
                    }}
                  />
                ) : (
                  <FiChevronRight style={iconStyle} />
                )
              )}
            </div>
            {(expandedSection === section.name || section.links.length === 1) && (
              <div style={subMenuStyle}>
                {section.links.map((link) => (
                  <NavLink
                    key={link.to}
                    to={link.to}
                    style={linkStyle}
                    onClick={() => {
                      if (window.innerWidth < 768) toggleSidebar();
                    }}
                  >
                    {link.label}
                  </NavLink>
                ))}
              </div>
            )}
          </div>
        ))}
        <button
          onClick={() => {
            logout();
            toggleSidebar();
          }}
          style={{
            ...logoutButtonStyle,
            ...(logoutButtonHovered ? logoutButtonHoverStyle : {}),
          }}
          onMouseEnter={() => setLogoutButtonHovered(true)}
          onMouseLeave={() => setLogoutButtonHovered(false)}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            fill="currentColor"
            viewBox="0 0 16 16"
          >
            <path
              fillRule="evenodd"
              d="M6 12.5a.5.5 0 0 0 .5.5h8a.5.5 0 0 0 .5-.5v-9a.5.5 0 0 0-.5-.5h-8a.5.5 0 0 0-.5.5v2a.5.5 0 0 1-1 0v-2A1.5 1.5 0 0 1 6.5 2h8A1.5 1.5 0 0 1 16 3.5v9a1.5 1.5 0 0 1-1.5 1.5h-8A1.5 1.5 0 0 1 5 12.5v-2a.5.5 0 0 1 1 0v2z"
            />
            <path
              fillRule="evenodd"
              d="M.146 8.354a.5.5 0 0 1 0-.708l3-3a.5.5 0 1 1 .708.708L1.707 7.5H10.5a.5.5 0 0 1 0 1H1.707l2.147 2.146a.5.5 0 0 1-.708.708l-3-3z"
            />
          </svg>
          Logout
        </button>
      </div>
    </nav>
  );
};

export default Sidebar;