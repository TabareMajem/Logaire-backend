"use client";

import { APIHeader } from '@/components/api/api-header';
import { APIAuthentication } from '@/components/api/api-authentication';
import { APIEndpoints } from '@/components/api/api-endpoints';

export default function APIPage() {
  return (
    <div className="min-h-screen">
      <APIHeader />
      <APIAuthentication />
      <APIEndpoints />
    </div>
  );
}