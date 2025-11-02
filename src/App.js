import React from 'react';
import AdminLogin from './AdminLogin';
import AdminDashboard from './AdminDashboard';

function App() {
  const [route, setRoute] = React.useState(window.location.hash || '#/login');

  React.useEffect(() => {
    const onHashChange = () => setRoute(window.location.hash || '#/login');
    window.addEventListener('hashchange', onHashChange);
    if (!window.location.hash) window.location.hash = '#/login';
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  if (route === '#/login') return <AdminLogin />;
  return <AdminDashboard />;
}

export default App;
