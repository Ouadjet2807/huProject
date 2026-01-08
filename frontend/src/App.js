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

function App() {
  const { user, space, setRefreshSpace } = useContext(AuthContext);
  const { showToast, setShowToast, message, color } = useContext(ToastContext);

  console.log("user ", user);


  return (
    <div className="App">
      <Toast show={showToast} setShow={setShowToast} message={message} color={color}/>
      <BrowserRouter>
        <Navbar />
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
          <Route path="calendar" element={<Agenda />} />
          <Route path="create_recipient" element={<CreateRecipient />} />
          <Route path="accept-invite/:token" element={<AcceptInvite />} />
          <Route
            path="recipient/:id"
            element={<Recipient spaceId={space && space.id} />}
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
