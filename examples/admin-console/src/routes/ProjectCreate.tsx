import { useNavigate } from 'react-router-dom';
import { AppShell, FormPage } from 'pageforge';
import { projectFormConfig } from '../configs/projects';
import { navigation } from '../navigation';
import { ProjectController } from '../controllers/projects';
import { apiClient } from '../api';

const controller = new ProjectController(apiClient);

export function ProjectCreate() {
  const navigate = useNavigate();

  const handleSubmit = async (data: any) => {
    await controller.create(data);
    navigate('/projects');
  };

  return (
    <AppShell
      navigation={navigation}
      breadcrumbs={[
        { text: 'Home', href: '/' },
        { text: 'Projects', href: '/projects' },
        { text: 'Create', href: '/projects/create' },
      ]}
      activeHref="/projects"
    >
      <FormPage config={projectFormConfig} onSubmit={handleSubmit} onCancel={() => navigate('/projects')} />
    </AppShell>
  );
}
