import React from 'react';

const Dashboard = () => {
  const downloadCSV = (csvContent, fileName) => {
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', fileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDownloadTeachersTemplate = () => {
    const csvContent = [
      'name,email,department',
      'John Doe,john.doe@example.com,Mathematics',
      'Jane Smith,jane.smith@example.com,Physics',
    ].join('\n');
    downloadCSV(csvContent, 'teachers_template.csv');
  };

  const handleDownloadSubjectsTemplate = () => {
    const csvContent = [
      'name,code,isLab',
      'Mathematics,MATH101,FALSE',
      'Physics,PHYS101,TRUE',
    ].join('\n');
    downloadCSV(csvContent, 'subjects_template.csv');
  };

  const handleDownloadBranchesTemplate = () => {
    const csvContent = [
      'name,semester',
      'CSE,1',
      'EE,2',
    ].join('\n');
    downloadCSV(csvContent, 'branches_template.csv');
  };

  const handleDownloadBranchSubjectTemplate = () => {
    const csvContent = [
      'branchName,semester,subjectName,frequency',
      'CSE,1,Mathematics,3',
      'EE,2,Physics,2',
    ].join('\n');
    downloadCSV(csvContent, 'branch_subject_template.csv');
  };

  const handleDownloadBranchSubjectTeacherTemplate = () => {
    const csvContent = [
      'branchName,semester,teacherName,subjectName',
      'CSE,1,John Doe,Mathematics',
      'EE,2,Jane Smith,Physics',
    ].join('\n');
    downloadCSV(csvContent, 'branch_subject_teacher_template.csv');
  };

  const handleDownloadTeacherSubjectTemplate = () => {
    const csvContent = [
      'teacherName,subjectName',
      'John Doe,Mathematics',
      'Jane Smith,Physics',
    ].join('\n');
    downloadCSV(csvContent, 'teacher_subject_template.csv');
  };

  return (
    <div style={{ padding: '2rem' }}>
      <h2 style={{ fontWeight: '600', marginBottom: '1rem' }}>
        Welcome to the Timetable Management System
      </h2>
      <p style={{ color: '#4b5563' }}>
        Manage teachers, subjects, branches, and generate/view timetables efficiently.
      </p>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '1rem',
          marginTop: '2rem',
        }}
      >
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
            onMouseEnter={(e) => (e.currentTarget.style.background = '#1e40af')}
            onMouseLeave={(e) => (e.currentTarget.style.background = '#2563eb')}
          >
            {label}
          </a>
        ))}
      </div>

      {/* CSV Templates Section */}
      <div style={{ marginTop: '3rem' }}>
        <h3 style={{ fontWeight: '600', fontSize: '1.25rem', marginBottom: '1rem' }}>
          Download CSV Templates for Data Upload
        </h3>
        <p style={{ color: '#4b5563', marginBottom: '1rem' }}>
          Use these templates to upload data via CSV/Excel files. Each template shows the required format.
        </p>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '1rem',
          }}
        >
          {[
            ['Teachers Template', handleDownloadTeachersTemplate],
            ['Subjects Template', handleDownloadSubjectsTemplate],
            ['Branches Template', handleDownloadBranchesTemplate],
            ['Branch-Subject Template', handleDownloadBranchSubjectTemplate],
            ['Branch-Subject-Teacher Template', handleDownloadBranchSubjectTeacherTemplate],
            ['Teacher-Subject Template', handleDownloadTeacherSubjectTemplate],
          ].map(([label, handler]) => (
            <button
              key={label}
              onClick={handler}
              style={{
                background: '#10b981',
                color: 'white',
                padding: '1rem',
                textAlign: 'center',
                borderRadius: '8px',
                border: 'none',
                cursor: 'pointer',
                textDecoration: 'none',
                transition: 'background 0.2s ease-in-out',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = '#059669')}
              onMouseLeave={(e) => (e.currentTarget.style.background = '#10b981')}
            >
              {label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;