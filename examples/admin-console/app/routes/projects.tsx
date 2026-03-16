import { json } from '@remix-run/node';
import { useLoaderData, useNavigate } from '@remix-run/react';
import { AppShell, ListPage } from 'pageforge';
import { projectListConfig } from '../configs/projects';
import { navigation } from '../navigation';

export async function loader() {
  const res = await fetch('http://localhost:3001/projects/list', { method: 'POST' });
  const data = await res.json();
  return json(data);
}

export default function ProjectsRoute() {
  const { items } = useLoaderData<typeof loader>();
  const navigate = useNavigate();

  const handleAction = (action: string) => {
    if (action === 'create') navigate('/projects/create');
  };

  return (
    <AppShell
      navigation={navigation}
      breadcrumbs={[{ text: 'Home', href: '/' }, { text: 'Projects', href: '/projects' }]}
      activeHref="/projects"
    >
      <ListPage config={projectListConfig} items={items} onAction={handleAction} />
    </AppShell>
  );
}
