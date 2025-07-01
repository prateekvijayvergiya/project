import { AuthProvider } from '@/contexts/AuthContext';
import { VisitorsProvider } from '@/hooks/useVisitors';
import { AuthGuard } from '@/components/auth/AuthGuard';
import { AppLayout } from '@/components/layout/AppLayout';
import { VisitorsDashboard } from '@/components/visitors/VisitorsDashboard';
import { VisitorsList } from '@/components/visitors/VisitorsList';
import { AddVisitor } from '@/components/visitors/AddVisitor';
import { Statistics } from '@/components/stats/Statistics';
import { Toaster } from 'sonner';
import './App.css';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { VisitorDetails } from '@/components/visitors/VisitorDetails';

function App() {
  return (
    <AuthProvider>
      <VisitorsProvider>
        <BrowserRouter>
          <AuthGuard>
            <AppLayout>
              <Routes>
                <Route path="/" element={<VisitorsDashboard />} />
                <Route path="/visitors" element={<VisitorsList />} />
                <Route path="/add-visitor" element={<AddVisitor />} />
                <Route path="/stats" element={<Statistics />} />
                <Route path="/visitors/:id" element={<VisitorDetails />} />
              </Routes>
            </AppLayout>
          </AuthGuard>
        </BrowserRouter>
        <Toaster 
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: 'white',
              border: '1px solid #e5e7eb',
              color: '#374151',
            },
          }}
        />
      </VisitorsProvider>
    </AuthProvider>
  );
}

export default App;