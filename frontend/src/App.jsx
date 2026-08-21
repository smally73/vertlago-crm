import { Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Layout from './pages/Layout';
import ClientsList from './pages/ClientsList';
import ClientNew from './pages/ClientNew';
import ClientDetail from './pages/ClientDetail';
import ExpensesList from './pages/ExpensesList';
import ExpenseNew from './pages/ExpenseNew';
import ExpenseDetail from './pages/ExpenseDetail';

function PrivateRoute({ children }) {
  const { token, loading } = useAuth();
  if (loading) return null;
  return token ? children : <Navigate to="/login" replace />;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        path="/"
        element={
          <PrivateRoute>
            <Layout />
          </PrivateRoute>
        }
      >
        <Route index element={<Navigate to="/clients" replace />} />
        <Route path="clients" element={<ClientsList />} />
        <Route path="clients/new" element={<ClientNew />} />
        <Route path="clients/:id" element={<ClientDetail />} />
        <Route path="expenses" element={<ExpensesList />} />
        <Route path="expenses/new" element={<ExpenseNew />} />
        <Route path="expenses/:id" element={<ExpenseDetail />} />
      </Route>
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}
