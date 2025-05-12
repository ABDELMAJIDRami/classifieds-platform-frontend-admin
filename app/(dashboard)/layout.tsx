'use client';
import * as React from 'react';
import { usePathname, useParams } from 'next/navigation';
import { DashboardLayout } from '@toolpad/core/DashboardLayout';
import { PageContainer } from '@toolpad/core/PageContainer';

export default function Layout(props: { children: React.ReactNode }) {
  const pathname = usePathname();
  const params = useParams();
  const id = params.id;

  const title = React.useMemo(() => {
    // Users routes
    if (pathname.startsWith('/users') && id && pathname.includes('/edit')) {
      return `User ${id} - Edit`;
    }
    if (pathname.startsWith('/users') && id) {
      return `User ${id}`;
    }
    if (pathname === '/users') {
      return 'Users';
    }

    // Ads routes
    if (pathname === '/ads/new') {
      return 'New Ad';
    }
    if (pathname.startsWith('/ads') && id && pathname.includes('/edit')) {
      return `Ad ${id} - Edit`;
    }
    if (pathname.startsWith('/ads') && id) {
      return `Ad ${id}`;
    }
    if (pathname === '/ads') {
      return 'Ads';
    }
    if (pathname === '/ads/pending') {
      return 'Pending Ads';
    }

    // Categories routes
    if (pathname === '/categories/new') {
      return 'New Category';
    }
    if (pathname.startsWith('/categories') && id && pathname.includes('/edit')) {
      return `Category ${id} - Edit`;
    }
    if (pathname.startsWith('/categories') && id) {
      return `Category ${id}`;
    }
    if (pathname === '/categories') {
      return 'Categories';
    }

    // Subcategories routes
    if (pathname === '/subcategories/new') {
      return 'New Subcategory';
    }
    if (pathname.startsWith('/subcategories') && id && pathname.includes('/edit')) {
      return `Subcategory ${id} - Edit`;
    }
    if (pathname.startsWith('/subcategories') && id) {
      return `Subcategory ${id}`;
    }
    if (pathname === '/subcategories') {
      return 'Subcategories';
    }

    // Dashboard home
    if (pathname === '/') {
      return 'Dashboard';
    }

    return undefined;
  }, [id, pathname]);

  return (
    <DashboardLayout>
      <PageContainer title={title}>{props.children}</PageContainer>
    </DashboardLayout>
  );
}
