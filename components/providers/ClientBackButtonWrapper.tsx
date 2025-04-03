"use client";

import React, { useEffect, useState } from 'react';
import BackButtonProvider from './BackButtonProvider';

interface ClientBackButtonWrapperProps {
  children: React.ReactNode;
}

export default function ClientBackButtonWrapper({ children }: ClientBackButtonWrapperProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return mounted ? <BackButtonProvider>{children}</BackButtonProvider> : <>{children}</>;
}