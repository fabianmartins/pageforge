import type { PageConfig } from 'pageforge';

export const projectListConfig: PageConfig = {
  page: 'projects',
  model: 'project',
  type: 'list',
  layout: {
    title: 'Projects',
    description: 'Manage your projects',
    searchable: true,
    pagination: true,
    columns: [
      { key: 'name', label: 'Name', sortable: true, type: 'link', linkPath: '/projects/{id}' },
      { key: 'owner', label: 'Owner', sortable: true },
      {
        key: 'status', label: 'Status', sortable: true, type: 'badge',
        badgeMap: {
          active: { color: 'success', label: 'Active' },
          planning: { color: 'info', label: 'Planning' },
          completed: { color: 'stopped', label: 'Completed' },
        },
      },
    ],
    actions: [
      { label: 'Create project', variant: 'primary', action: 'create' },
      { label: 'Delete', action: 'delete', requiresSelection: true },
    ],
  },
};

export const projectFormConfig: PageConfig = {
  page: 'projects/create',
  model: 'project',
  type: 'form',
  layout: {
    title: 'Create project',
    submitLabel: 'Create',
    cancelPath: '/projects',
    fields: [
      { key: 'name', label: 'Project name', type: 'text', required: true, placeholder: 'Enter project name' },
      { key: 'owner', label: 'Owner', type: 'text', required: true, placeholder: 'Enter owner name' },
      {
        key: 'status', label: 'Status', type: 'select',
        options: [
          { label: 'Planning', value: 'planning' },
          { label: 'Active', value: 'active' },
          { label: 'Completed', value: 'completed' },
        ],
      },
      { key: 'description', label: 'Description', type: 'textarea', placeholder: 'Describe the project' },
    ],
  },
};
