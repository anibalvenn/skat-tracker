import type { Metadata } from 'next';
import ListPage from '@/components/pages/ListPage';

export const metadata: Metadata = {
  title: 'Skat Tracker - List',
  description: 'Track your Skat game',
};

export default function Page() {
  return <ListPage />;
}