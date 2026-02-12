'use client';

import { useRouter } from 'next/navigation';
import { CreateSidebar, CreateForm } from '@/app/_components/create';

export default function CreatePage() {
  const router = useRouter();

  const handleSubmit = (data: { name: string; logo?: File }) => {
    console.log('Organization created:', data);
    // TODO: Save organization data
    router.push('/');
  };

  const handleSkip = () => {
    router.push('/');
  };

  return (
    <div className="flex h-screen w-full">
      <CreateSidebar />
      <CreateForm onSubmit={handleSubmit} onSkip={handleSkip} />
    </div>
  );
}
