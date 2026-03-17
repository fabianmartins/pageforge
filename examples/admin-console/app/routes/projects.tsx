import { json } from '@remix-run/node';
import { useLoaderData, useNavigate, useFetcher } from '@remix-run/react';
import { AppShell, ListPage } from 'pageforge';
import { projectListConfig } from '../configs/projects';
import { navigation } from '../navigation';
import { ClientOnly } from '../components/client-only';

export async function loader() {
  const res = await fetch('http://localhost:3001/projects/list', { method: 'POST' });
  const data = await res.json();
  return json(data);
}

export async function action({ request }: { request: Request }) {
  const formData = await request.formData();
  const intent = formData.get('intent');
  if (intent === 'delete') {
    const ids = formData.getAll('id') as string[];
    for (const id of ids) {
      await fetch('http://localhost:3001/projects/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
    }
  }
  return json({ success: true });
}

export default function ProjectsRoute() {
  const { items } = useLoaderData<typeof loader>();
  const navigate = useNavigate();
  const fetcher = useFetcher();

  const handleAction = (action: string, selected?: any[]) => {
    if (action === 'create') navigate('/projects/create');
    if (action === 'delete' && selected?.length) {
      const formData = new FormData();
      formData.set('intent', 'delete');
      selected.forEach(item => formData.append('id', item.id));
      fetcher.submit(formData, { method: 'post' });
    }
  };

  return (
    <ClientOnly>{() =>
      <AppShell
        navigation={navigation}
        breadcrumbs={[{ text: 'Home', href: '/' }, { text: 'Projects', href: '/projects' }]}
        activeHref="/projects"
      >
        <ListPage
          config={projectListConfig}
          items={items}
          loading={fetcher.state === 'submitting'}
          onAction={handleAction}
        />
      </AppShell>
    }</ClientOnly>
  );
}
