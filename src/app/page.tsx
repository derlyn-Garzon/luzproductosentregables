import Navbar from '@/components/Navbar';
import AdminPanel from '@/components/AdminPanel';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <Navbar />
      <AdminPanel />
    </div>
  );
}
