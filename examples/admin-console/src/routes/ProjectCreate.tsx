import { useNavigate } from 'react-router-dom';
import { AppShell, FormPage } from 'pageforge';
import { projectFormConfig } from '../configs/projects';
import { navigation } from '../navigation';
import { api } from '../api';

export function ProjectCreate() {
  const navigate = useNavigate();

  const handleSubmit = async (data: any) => {
    await api('projects/create', data);
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
