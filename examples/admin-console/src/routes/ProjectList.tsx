import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppShell, ListPage } from 'pageforge';
import { projectListConfig } from '../configs/projects';
import { navigation } from '../navigation';
import { api } from '../api';

export function ProjectList() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const load = () => {
    setLoading(true);
    api('projects/list').then(data => { setItems(data.items); setLoading(false); });
  };

  useEffect(() => { load(); }, []);

  const handleAction = (action: string, selected?: any[]) => {
    if (action === 'create') navigate('/projects/create');
    if (action === 'delete' && selected?.length) {
      Promise.all(selected.map(item => api('projects/delete', { id: item.id })))
        .then(() => load());
    }
  };

  return (
    <AppShell
      navigation={navigation}
      breadcrumbs={[{ text: 'Home', href: '/' }, { text: 'Projects', href: '/projects' }]}
      activeHref="/projects"
    >
      <ListPage config={projectListConfig} items={items} loading={loading} onAction={handleAction} />
    </AppShell>
  );
}
