import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AppShell } from 'pageforge';
import Container from '@cloudscape-design/components/container';
import Header from '@cloudscape-design/components/header';
import SpaceBetween from '@cloudscape-design/components/space-between';
import Button from '@cloudscape-design/components/button';
import ColumnLayout from '@cloudscape-design/components/column-layout';
import Box from '@cloudscape-design/components/box';
import StatusIndicator from '@cloudscape-design/components/status-indicator';
import { navigation } from '../navigation';
import { ProjectController } from '../controllers/projects';
import { apiClient } from '../api';

const controller = new ProjectController(apiClient);

const statusMap: Record<string, { type: string; label: string }> = {
  active: { type: 'success', label: 'Active' },
  planning: { type: 'info', label: 'Planning' },
  completed: { type: 'stopped', label: 'Completed' },
};

export function ProjectDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState<any>(null);

  useEffect(() => { controller.get(id!).then(setProject); }, [id]);

  if (!project) return null;

  const status = statusMap[project.status] ?? { type: 'info', label: project.status };

  const handleDelete = async () => {
    await controller.delete(id!);
    navigate('/projects');
  };

  return (
    <AppShell
      navigation={navigation}
      breadcrumbs={[
        { text: 'Home', href: '/' },
        { text: 'Projects', href: '/projects' },
        { text: project.name, href: `/projects/${id}` },
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
                  <Button onClick={() => navigate(`/projects/${id}/edit`)}>Edit</Button>
                  <Button onClick={handleDelete}>Delete</Button>
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
  );
}
