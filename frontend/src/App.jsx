import { Routes, Route } from 'react-router-dom'
import Layout from './components/layout/layout'
import Dashboard from './pages/Dashboard'
import TeacherList from './pages/Teachers/List'
import TeacherAdd from './pages/Teachers/Add'
import SubjectList from './pages/Subjects/List'
import SubjectAdd from './pages/Subjects/Add'
import BranchList from './pages/Branches/List'
import BranchAdd from './pages/Branches/Add'
import TeacherSubjectAssign from './pages/Assignments/TeacherSubject'
import BranchSubjectAssign from './pages/Assignments/BranchSubject'
import TimetableGenerate from './pages/Timetable/Generate'
import TimetableView from './pages/Timetable/View'
import NotFound from './pages/NotFound'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Dashboard />} />
        <Route path="teachers">
          <Route index element={<TeacherList />} />
          <Route path="add" element={<TeacherAdd />} />
        </Route>
        <Route path="subjects">
          <Route index element={<SubjectList />} />
          <Route path="add" element={<SubjectAdd />} />
        </Route>
        <Route path="branches">
          <Route index element={<BranchList />} />
          <Route path="add" element={<BranchAdd />} />
        </Route>
        <Route path="assignments">
          <Route path="teacher-subject" element={<TeacherSubjectAssign />} />
          <Route path="branch-subject" element={<BranchSubjectAssign />} />
        </Route>
        <Route path="timetable">
          <Route path="generate" element={<TimetableGenerate />} />
          <Route path="view" element={<TimetableView />} />
        </Route>
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  )
}

export default App
