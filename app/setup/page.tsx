import type { Metadata } from 'next';
import SetupPage from '@/components/pages/SetupPage';

export const metadata: Metadata = {
  title: 'Skat Tracker - Setup',
  description: 'Setup your Skat game',
};

export default function Page() {
  return <SetupPage />;
}