import React from 'react';

const Dashboard = () => {
  return (
    <div style={{ padding: '2rem' }}>
      <h2>Welcome to the Timetable Management System</h2>
      <p>This dashboard helps you manage teachers, subjects, branches, assignments, and generate/view timetables.</p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginTop: '2rem' }}>
        {[
          { label: 'Teachers', path: '/teachers' },
          { label: 'Subjects', path: '/subjects' },
          { label: 'Branches', path: '/branches' },
          { label: 'Assign Teachers', path: '/assignments/teacher-subject' },
          { label: 'Assign Subjects', path: '/assignments/branch-subject' },
          { label: 'Generate Timetable', path: '/timetable/generate' },
          { label: 'View Timetable', path: '/timetable/view' },
        ].map(({ label, path }) => (
          <a
            key={label}
            href={path}
            style={{
              background: '#3182ce',
              color: 'white',
              padding: '1rem',
              textAlign: 'center',
              borderRadius: '8px',
              textDecoration: 'none',
              transition: '0.2s ease-in-out',
            }}
          >
            {label}
          </a>
        ))}
      </div>
    </div>
  );
};

export default Dashboard;
