import { useNavigate } from '@remix-run/react';
import { AppShell, FormPage } from 'pageforge';
import { projectFormConfig } from '../configs/projects';
import { navigation } from '../navigation';
import { ClientOnly } from '../components/client-only';

export default function CreateProjectRoute() {
  const navigate = useNavigate();

  const handleSubmit = async (data: any) => {
    await fetch('http://localhost:3001/projects/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    navigate('/projects');
  };

  return (
    <ClientOnly>{() =>
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
    }</ClientOnly>
  );
}
