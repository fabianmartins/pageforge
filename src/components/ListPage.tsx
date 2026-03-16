import React, { useState } from 'react';
import Table from '@cloudscape-design/components/table';
import Header from '@cloudscape-design/components/header';
import Button from '@cloudscape-design/components/button';
import SpaceBetween from '@cloudscape-design/components/space-between';
import TextFilter from '@cloudscape-design/components/text-filter';
import Pagination from '@cloudscape-design/components/pagination';
import StatusIndicator from '@cloudscape-design/components/status-indicator';
import Box from '@cloudscape-design/components/box';
import { Link } from '@remix-run/react';
import type { PageConfig, ListLayout, ColumnConfig } from '../types.js';
import { useI18n } from '../i18n.js';

interface ListPageProps {
  config: PageConfig;
  items: any[];
  loading?: boolean;
  onAction?: (action: string, selectedItems?: any[]) => void;
  nextToken?: string;
  onNextPage?: () => void;
}

function renderCell(item: any, col: ColumnConfig) {
  const value = item[col.key];
  if (col.type === 'badge' && col.badgeMap) {
    const badge = col.badgeMap[value];
    if (badge) {
      return (
        <StatusIndicator type={badge.color as any}>
          {badge.label ?? value}
        </StatusIndicator>
      );
    }
  }
  if (col.type === 'link' && col.linkPath) {
    const href = col.linkPath.replace(/\{(\w+)\}/g, (_, k) => item[k] ?? '');
    return <Link to={href}>{value}</Link>;
  }
  return value ?? '';
}

export function ListPage({ config, items, loading, onAction, nextToken, onNextPage }: ListPageProps) {
  const { t } = useI18n();
  const layout = config.layout as ListLayout;
  const [filterText, setFilterText] = useState('');
  const [selectedItems, setSelectedItems] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState(1);

  const filtered = filterText
    ? items.filter(item =>
        Object.values(item).some(v =>
          String(v).toLowerCase().includes(filterText.toLowerCase())
        )
      )
    : items;

  const hasSelection = layout.actions?.some(a => a.requiresSelection);

  return (
    <Table
      loading={loading}
      loadingText={t('list.loading', 'Loading...')}
      selectionType={hasSelection ? 'multi' : undefined}
      selectedItems={selectedItems}
      onSelectionChange={({ detail }) => setSelectedItems(detail.selectedItems)}
      columnDefinitions={layout.columns.map(col => ({
        id: col.key,
        header: t(col.label, col.label),
        cell: (item: any) => renderCell(item, col),
        sortingField: col.sortable ? col.key : undefined,
      }))}
      items={filtered}
      header={
        <Header
          description={layout.description ? t(layout.description, layout.description) : undefined}
          counter={`(${filtered.length})`}
          actions={
            layout.actions?.length ? (
              <SpaceBetween direction="horizontal" size="xs">
                {layout.actions.map(action => (
                  <Button
                    key={action.action}
                    variant={action.variant ?? 'normal'}
                    disabled={action.requiresSelection && selectedItems.length === 0}
                    onClick={() => onAction?.(action.action, selectedItems)}
                  >
                    {t(action.label, action.label)}
                  </Button>
                ))}
              </SpaceBetween>
            ) : undefined
          }
        >
          {t(layout.title, layout.title)}
        </Header>
      }
      filter={
        layout.searchable ? (
          <TextFilter
            filteringText={filterText}
            onChange={({ detail }) => setFilterText(detail.filteringText)}
            filteringPlaceholder={t('list.searchPlaceholder', 'Search...')}
          />
        ) : undefined
      }
      pagination={
        layout.pagination ? (
          <Pagination
            currentPageIndex={currentPage}
            pagesCount={nextToken ? currentPage + 1 : currentPage}
            onChange={({ detail }) => {
              setCurrentPage(detail.currentPageIndex);
              if (detail.currentPageIndex > currentPage && onNextPage) onNextPage();
            }}
          />
        ) : undefined
      }
      empty={
        <Box textAlign="center" color="inherit">
          <b>{t('list.emptyTitle', 'No items')}</b>
          <Box padding={{ bottom: 's' }} variant="p" color="inherit">
            {t('list.emptyDescription', 'No items to display.')}
          </Box>
        </Box>
      }
    />
  );
}
