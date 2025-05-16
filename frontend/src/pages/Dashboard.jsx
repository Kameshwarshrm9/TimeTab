import React from 'react';

const Dashboard = () => {
  return (
    <div style={{ padding: '2rem' }}>
      <h2 style={{ fontWeight: '600', marginBottom: '1rem' }}>Welcome to the Timetable Management System</h2>
      <p style={{ color: '#4b5563' }}>Manage teachers, subjects, branches, and generate/view timetables efficiently.</p>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
        gap: '1rem',
        marginTop: '2rem'
      }}>
        {[
          ['Teachers', '/teachers'],
          ['Subjects', '/subjects'],
          ['Branches', '/branches'],
          
          ['Assign Subjects', '/assignments/branch-subject-assign'],
          ['Generate Timetable', '/timetable/generate'],
          ['View Timetable', '/timetable/view'],
        ].map(([label, path]) => (
          <a
            key={label}
            href={path}
            style={{
              background: '#2563eb',
              color: 'white',
              padding: '1rem',
              textAlign: 'center',
              borderRadius: '8px',
              textDecoration: 'none',
              transition: 'background 0.2s ease-in-out',
            }}
            onMouseEnter={e => e.currentTarget.style.background = '#1e40af'}
            onMouseLeave={e => e.currentTarget.style.background = '#2563eb'}
          >
            {label}
          </a>
        ))}
      </div>
    </div>
  );
};

export default Dashboard;
