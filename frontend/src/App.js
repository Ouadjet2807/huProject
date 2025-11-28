import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import CreateRecipient from "./components/CreateRecipient";
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

function App() {
  const { user, space, setRefreshSpace } = useContext(AuthContext);

  console.log("user ", user);

  let currentPage = window.location.pathname;

  useEffect(() => {
    console.log(!user && currentPage !== "/login");
    console.log(user);
    if (user && !user.id && currentPage !== "/login") {
      window.location.assign("/login");
    }
  }, []);

  return (
    <div className="App">
      <BrowserRouter>
        <Navbar />
        <Routes>
          <Route path="login" element={<Sign />} />
          <Route path="account" element={<Account />} />
          <Route
            path="home"
            element={
              <Home setRefreshRecipients={setRefreshSpace} space={space} />
            }
          />
          <Route path="calendar" element={<Agenda />} />
          <Route path="create_recipient" element={<CreateRecipient />} />
          <Route path="accept-invite/:token" element={<AcceptInvite />} />
          <Route
            path="recipient/:id"
            element={<Recipient spaceId={space.id} />}
          />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
