// src/app/lists/page.tsx
import YourListsPage from '@/components/pages/YourListsPage';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Your Lists - Skat Tracker',
  description: 'View and manage your Skat game lists',
};

export default function ListsRoute() {
  return <YourListsPage />;
}