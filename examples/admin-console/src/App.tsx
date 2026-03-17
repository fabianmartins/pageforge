import { Routes, Route, Navigate } from 'react-router-dom';
import { ProjectList } from './routes/ProjectList';
import { ProjectCreate } from './routes/ProjectCreate';
import { ProjectDetail } from './routes/ProjectDetail';
import { ProjectEdit } from './routes/ProjectEdit';

export function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/projects" replace />} />
      <Route path="/projects" element={<ProjectList />} />
      <Route path="/projects/create" element={<ProjectCreate />} />
      <Route path="/projects/:id" element={<ProjectDetail />} />
      <Route path="/projects/:id/edit" element={<ProjectEdit />} />
    </Routes>
  );
}
