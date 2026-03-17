import { json } from '@remix-run/node';
import type { LoaderFunctionArgs } from '@remix-run/node';
import { useLoaderData, useNavigate, useFetcher } from '@remix-run/react';
import { AppShell } from 'pageforge';
import Container from '@cloudscape-design/components/container';
import Header from '@cloudscape-design/components/header';
import SpaceBetween from '@cloudscape-design/components/space-between';
import Button from '@cloudscape-design/components/button';
import ColumnLayout from '@cloudscape-design/components/column-layout';
import Box from '@cloudscape-design/components/box';
import StatusIndicator from '@cloudscape-design/components/status-indicator';
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

export async function action({ request, params }: LoaderFunctionArgs) {
  const formData = await request.formData();
  if (formData.get('intent') === 'delete') {
    await fetch('http://localhost:3001/projects/delete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: params.id }),
    });
    return json({ deleted: true });
  }
  return json({});
}

const statusMap: Record<string, { type: string; label: string }> = {
  active: { type: 'success', label: 'Active' },
  planning: { type: 'info', label: 'Planning' },
  completed: { type: 'stopped', label: 'Completed' },
};

export default function ProjectDetailRoute() {
  const project = useLoaderData<typeof loader>();
  const navigate = useNavigate();
  const fetcher = useFetcher();

  if (fetcher.data?.deleted) {
    navigate('/projects');
    return null;
  }

  const status = statusMap[project.status] ?? { type: 'info', label: project.status };

  return (
    <ClientOnly>{() =>
      <AppShell
        navigation={navigation}
        breadcrumbs={[
          { text: 'Home', href: '/' },
          { text: 'Projects', href: '/projects' },
          { text: project.name, href: `/projects/${project.id}` },
        ]}
        activeHref="/projects"
      >
        <SpaceBetween size="l">
          <Container
            header={
              <Header
                variant="h2"
                actions={
                  <SpaceBetween direction="horizontal" size="xs">
                    <Button onClick={() => navigate(`/projects/${project.id}/edit`)}>Edit</Button>
                    <fetcher.Form method="post">
                      <input type="hidden" name="intent" value="delete" />
                      <Button variant="normal" formAction={`/projects/${project.id}`}>Delete</Button>
                    </fetcher.Form>
                  </SpaceBetween>
                }
              >
                {project.name}
              </Header>
            }
          >
            <ColumnLayout columns={3} variant="text-grid">
              <div>
                <Box variant="awsui-key-label">Owner</Box>
                <div>{project.owner}</div>
              </div>
              <div>
                <Box variant="awsui-key-label">Status</Box>
                <StatusIndicator type={status.type as any}>{status.label}</StatusIndicator>
              </div>
              <div>
                <Box variant="awsui-key-label">ID</Box>
                <div>{project.id}</div>
              </div>
            </ColumnLayout>
          </Container>
          {project.description && (
            <Container header={<Header variant="h2">Description</Header>}>
              <div>{project.description}</div>
            </Container>
          )}
        </SpaceBetween>
      </AppShell>
    }</ClientOnly>
  );
}
