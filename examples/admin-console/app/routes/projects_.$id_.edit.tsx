import { json } from '@remix-run/node';
import type { LoaderFunctionArgs } from '@remix-run/node';
import { useLoaderData, useNavigate } from '@remix-run/react';
import { AppShell, FormPage } from 'pageforge';
import { projectEditConfig } from '../configs/projects';
import { navigation } from '../navigation';
import { ClientOnly } from '../components/client-only';

export async function loader({ params }: LoaderFunctionArgs) {
  const res = await fetch('http://localhost:3001/projects/get', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id: params.id }),
  });
  if (!res.ok) throw new Response('Not found', { status: 404 });
  return json(await res.json());
}

export default function EditProjectRoute() {
  const project = useLoaderData<typeof loader>();
  const navigate = useNavigate();

  const handleSubmit = async (data: any) => {
    await fetch('http://localhost:3001/projects/update', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: project.id, ...data }),
    });
    navigate(`/projects/${project.id}`);
  };

  return (
    <ClientOnly>{() =>
      <AppShell
        navigation={navigation}
        breadcrumbs={[
          { text: 'Home', href: '/' },
          { text: 'Projects', href: '/projects' },
          { text: project.name, href: `/projects/${project.id}` },
          { text: 'Edit', href: `/projects/${project.id}/edit` },
        ]}
        activeHref="/projects"
      >
        <FormPage
          config={projectEditConfig}
          initialData={project}
          onSubmit={handleSubmit}
          onCancel={() => navigate(`/projects/${project.id}`)}
        />
      </AppShell>
    }</ClientOnly>
  );
}
