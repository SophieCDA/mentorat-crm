// src/app/dashboard/formations/[id]/preview/page.tsx
'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import StudentFormationView from '@/components/formations/StudentFormationView';

export default function FormationPreviewPage() {
  const params = useParams();
  
  return <StudentFormationView formationId={params.id as string} />;
}