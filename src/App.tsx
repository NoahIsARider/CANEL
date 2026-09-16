import { StoreProvider, useStore } from './store';
import { LoginPage } from './components/LoginPage';
import { Dashboard } from './Dashboard';

function App() {
  const { state } = useStore();

  if (!state.user) {
    return <LoginPage />;
  }

  return <Dashboard />;
}

export default function Root() {
  return (
    <StoreProvider>
      <App />
    </StoreProvider>
  );
}
