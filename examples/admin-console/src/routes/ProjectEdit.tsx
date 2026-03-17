import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AppShell, FormPage } from 'pageforge';
import { projectEditConfig } from '../configs/projects';
import { navigation } from '../navigation';
import { api } from '../api';

export function ProjectEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState<any>(null);

  useEffect(() => { api('projects/get', { id }).then(setProject); }, [id]);

  if (!project) return null;

  const handleSubmit = async (data: any) => {
    await api('projects/update', { id, ...data });
    navigate(`/projects/${id}`);
  };

  return (
    <AppShell
      navigation={navigation}
      breadcrumbs={[
        { text: 'Home', href: '/' },
        { text: 'Projects', href: '/projects' },
        { text: project.name, href: `/projects/${id}` },
        { text: 'Edit', href: `/projects/${id}/edit` },
      ]}
      activeHref="/projects"
    >
      <FormPage
        config={projectEditConfig}
        initialData={project}
        onSubmit={handleSubmit}
        onCancel={() => navigate(`/projects/${id}`)}
      />
    </AppShell>
  );
}
