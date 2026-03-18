import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import CreateRecipient from "./components/modals/CreateRecipient";
import AcceptInvite from "./components/AcceptInvite";
import Navbar from "./components/Navbar";
import Recipient from "./pages/Recipient";
import { useEffect, useState } from "react";
import api from "./api/api";
import { useContext } from "react";
import { AuthContext } from "./context/AuthContext";
import Account from "./pages/Account";
import Sign from "./pages/Sign";
import Agenda from "./components/Agenda";
import Toast from "./components/Toast";
import { ToastContext } from "./context/ToastContext";
import { ConfirmContext } from "./context/ConfirmContext";
import Confirm from "./components/modals/Confirm";
import TreatmentPage from "./components/TreatmentPage";

function App() {
  const { user, space, setRefreshSpace } = useContext(AuthContext);
  const { showToast, setShowToast, message, color } = useContext(ToastContext);
  const { showConfirm, setShowConfirm, action, text, setReturnValue, returnValue } = useContext(ConfirmContext);
  const [notifications, setNotifications] = useState([])

  const getNotifications = async () => {
    try {
      let response = await api.get("http://127.0.0.1:8000/api/notifications/")

      setNotifications(response.data)
    } catch (error) {
      console.log(error);
    }
  }

  useEffect(() => {
    getNotifications()
  }, [user])
  console.log("user ", user);
  console.log("space ", space)

  return (
    <div className="App">
      <Toast show={showToast} setShow={setShowToast} message={message} color={color}/>
      <Confirm show={showConfirm} setShow={setShowConfirm} text={text} action={action} setReturnValue={setReturnValue}/>
      <BrowserRouter>
        <Navbar notifications={notifications}/>
        <Routes>
          <Route path="login" element={<Sign />} />
          <Route path="account" element={<Account />} />
          <Route path="account/:tab" element={<Account />} />
          <Route
            path="home"
            element={
              <Home setRefreshSpace={setRefreshSpace} />
            }
          />
          <Route path="calendar" element={<Agenda space={space}/>} />
          <Route path="create_recipient" element={<CreateRecipient />} />
          <Route path="accept-invite/:token" element={<AcceptInvite />} />
          <Route
            path="recipient/:id"
            element={<Recipient spaceId={space && space.id} />}
          />
          <Route
            path="recipient/:id/treatments/"
            element={<Recipient spaceId={space && space.id} tab="treatments"/>}
          />
          <Route
            path="recipient/:id/specialists/"
            element={<Recipient spaceId={space && space.id} tab="specialists"/>}
          />
          <Route
            path="recipient/:id/treatments/:id"
            element={<TreatmentPage spaceId={space && space.id}/>}
          />
          <Route
            path="invite/:token"
            element={<AcceptInvite />}
          />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
