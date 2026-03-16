import React from 'react';
import CloudscapeAppLayout from '@cloudscape-design/components/app-layout';
import SideNavigation from '@cloudscape-design/components/side-navigation';
import BreadcrumbGroup from '@cloudscape-design/components/breadcrumb-group';
import type { NavItem } from '../types.js';

interface AppShellProps {
  navigation: NavItem[];
  breadcrumbs: { text: string; href: string }[];
  children: React.ReactNode;
  activeHref?: string;
}

export function AppShell({ navigation, breadcrumbs, children, activeHref }: AppShellProps) {
  return (
    <CloudscapeAppLayout
      navigation={
        <SideNavigation
          activeHref={activeHref}
          items={navigation as any}
        />
      }
      breadcrumbs={<BreadcrumbGroup items={breadcrumbs} />}
      content={children}
    />
  );
}
