import type { Metadata } from 'next';
import HomePage from '@/components/pages/HomePage';

export const metadata: Metadata = {
  title: 'Skat Tracker - Home',
  description: 'Track your Skat games',
};

export default function Page() {
  return <HomePage />;
}