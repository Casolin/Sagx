import { AppRouter } from "./routes/AppRouter";
import { useAuth } from "./hooks/useAuth";
import Loader from "./components/Loader";
import { useEffect } from "react";
import { initSocket, disconnectSocket } from "./services/socket.service";

function App() {
  const { loading, user } = useAuth();

  useEffect(() => {
    if (user?._id) {
      initSocket(user._id);
    }

    return () => {
      disconnectSocket();
    };
  }, [user?._id]);

  if (loading) {
    return <Loader />;
  }

  return <AppRouter />;
}

export default App;
