import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './AuthContext.jsx'; // Updated to .jsx
import Layout from './components/layout/layout.jsx';
import Dashboard from './pages/Dashboard.jsx';
import TeachersList from './pages/Teachers/List.jsx';
import AddTeacher from './pages/Teachers/Add.jsx';
import SubjectsList from './pages/Subjects/List.jsx';
import AddSubject from './pages/Subjects/Add.jsx';
import BranchesList from './pages/Branches/List.jsx';
import AddBranch from './pages/Branches/Add.jsx';
import BranchSubjectAssign from './pages/Assignments/BranchSubjectAssign.jsx';
import BranchSubjectView from './pages/Assignments/BranchSubjectView.jsx';
import AssignTeacherToSubject from './pages/Assignments/AssignTeacherToSubject.jsx';
import ViewAssignedSubjects from './pages/Assignments/ViewAssignedSubjects.jsx';
import AssignTeacherToBranchSubject from './pages/Assignments/AssignTeacherToBranchSubject.jsx';
import ViewAssignedTeachers from './pages/Assignments/ViewAssignedTeachers.jsx';
import GenerateTimetable from './pages/Timetable/Generate.jsx';
import ViewTimetable from './pages/Timetable/View.jsx';
import ViewTeacherTimetable from './pages/Timetable/ViewTeacherTimetable.jsx';
import Login from './pages/Login.jsx';
import ProtectedRoute from './ProtectedRoute.jsx';

ReactDOM.createRoot(document.getElementById('root')).render(
  <AuthProvider>
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="/teachers" element={<TeachersList />} />
            <Route path="/teachers/add" element={<AddTeacher />} />
            <Route path="/subjects" element={<SubjectsList />} />
            <Route path="/subjects/add" element={<AddSubject />} />
            <Route path="/branches" element={<BranchesList />} />
            <Route path="/branches/add" element={<AddBranch />} />
            <Route path="/assignments/branch-subject-assign" element={<BranchSubjectAssign />} />
            <Route path="/assignments/branch-subject-view" element={<BranchSubjectView />} />
            <Route path="/assignments/assign-teacher-to-subject" element={<AssignTeacherToSubject />} />
            <Route path="/assignments/view" element={<ViewAssignedSubjects />} />
            <Route path="/assign-branch-subject-teacher" element={<AssignTeacherToBranchSubject />} />
            <Route path="/assignments/view-branch-semester-assignments" element={<ViewAssignedTeachers />} />
            <Route path="/timetable/generate" element={<GenerateTimetable />} />
            <Route path="/timetable/view" element={<ViewTimetable />} />
            <Route path="/teacher-timetable" element={<ViewTeacherTimetable />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  </AuthProvider>
);