import ClientLayoutShell from '@/components/ClientLayoutShell';

export default async function Layout({ children }) {

  return (
    <ClientLayoutShell >
      {children}
    </ClientLayoutShell>
  );
}