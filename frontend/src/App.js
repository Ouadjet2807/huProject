import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import CreateRecipient from "./components/CreateRecipient";
import AcceptInvite from "./components/AcceptInvite";
import Navbar from "./components/Navbar";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Recipient from "./pages/Recipient";
import { useEffect, useState } from "react";
import api from "./api/api";
import { useContext } from "react";
import { AuthContext } from "./context/AuthContext";

function App() {


  const { space, setRefreshSpace } = useContext(AuthContext)


  return (
    <div className="App">
      <BrowserRouter>
        <Navbar />
        <Routes>
          <Route path="login" element={<Login />} />
          <Route path="register" element={<Register />} />
          <Route
            path="home"
            element={
              <Home setRefreshRecipients={setRefreshSpace} space={space} />
            }
          />
          <Route path="create_recipient" element={<CreateRecipient />} />
          <Route path="accept-invite/:token" element={<AcceptInvite />} />
          <Route path="recipient/:id" element={<Recipient spaceId={space.id}/>} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
