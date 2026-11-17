import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import AppShell from './components/AppShell';
import { ALL_NAV } from './helpers/navigation.helper';
import PlaceholderPage from './pages/PlaceholderPage';
import RequestsIndex from './pages/RequestsIndex';

export function App() {
  return (
    <BrowserRouter>
      <AppShell>
        <Routes>
          <Route path="/" element={<Navigate to="/requests" replace />} />
          <Route path="/requests" element={<RequestsIndex />} />
          {ALL_NAV.filter((entry) => entry.id !== 'requests').map((entry) => (
            <Route
              key={entry.id}
              path={entry.path}
              element={<PlaceholderPage title={entry.label} />}
            />
          ))}
          <Route path="*" element={<Navigate to="/requests" replace />} />
        </Routes>
      </AppShell>
    </BrowserRouter>
  );
}

export default App;
