import { AppRouter } from "./routes/AppRouter";
import { useAuth } from "./hooks/useAuth";
import Loader from "./components/Loader";
import { useEffect } from "react";
import { initSocket, disconnectSocket } from "./services/socket.service";
import { useCallStore } from "./utils/call.store";
import { CallPage } from "./pages/CallPage";
import { startTokenAutoRefresh } from "./utils/tokenAutoRefresh";
import { CallBusyModal } from "./components/CallBusyModal";

function App() {
  const { loading, user } = useAuth();

  const incomingCall = useCallStore((s) => s.incomingCall);
  const callAccepted = useCallStore((s) => s.callAccepted);
  const isCalling = useCallStore((s) => s.isCalling);
  const callBusyOpen = useCallStore((s) => s.callBusyOpen);
  const setCallBusyOpen = useCallStore((s) => s.setCallBusyOpen);

  useEffect(() => {
    if (user?._id) {
      initSocket(user._id);
    }

    return () => {
      disconnectSocket();
    };
  }, [user?._id]);

  useEffect(() => {
    if (!user?._id) return;

    startTokenAutoRefresh();
  }, [user?._id]);

  useEffect(() => {
    const handleReload = () => {
      useCallStore.getState().endCall();
    };

    window.addEventListener("beforeunload", handleReload);

    return () => {
      window.removeEventListener("beforeunload", handleReload);
    };
  }, []);

  useEffect(() => {
    if (!callBusyOpen) return;

    const timer = setTimeout(() => {
      setCallBusyOpen(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, [callBusyOpen, setCallBusyOpen]);

  if (loading) {
    return <Loader />;
  }

  const showCall = incomingCall || callAccepted || isCalling;

  return (
    <>
      <AppRouter />

      {showCall && <CallPage />}

      <CallBusyModal
        open={callBusyOpen}
        onClose={() => setCallBusyOpen(false)}
      />
    </>
  );
}

export default App;
