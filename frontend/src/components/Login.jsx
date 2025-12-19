import React, { useContext, useState, useEffect, use } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { AuthContext, AuthProvider } from "../context/AuthContext";
import { ToastContext } from "../context/ToastContext";
import { PiEyeBold } from "react-icons/pi";
import { PiEyeClosedDuotone } from "react-icons/pi";
import Button from "react-bootstrap/esm/Button";
import Loader from "./Loader";

export default function Login() {


  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);

  const navigate = useNavigate();

  const { login, message, loading } = useContext(AuthContext);
  const { setShowToast, setMessage, setColor } = useContext(ToastContext);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) {
      return;
    }

    login(formData.email, formData.password);

  };

  useEffect(() => {
    console.log(message);

    if (message.message === "") return;
    setMessage(message.message);
    if (message.status === "success") {
      setShowToast(true);
      setColor("success");
      navigate("/home");
    } else {
      setShowToast(true);
      setColor("danger");
    }
  }, [message]);

  return (
    <div id="login">
      <h2>Se connecter</h2>
      <form onKeyDown={(e) => e.key === "Enter" && handleSubmit(e)}>
        <input
          type="email"
          name="email"
          id=""
          value={formData.email}
          placeholder="Email"
          onChange={(e) => handleChange(e)}
        />
        <div className="password-field">
          <input
            type={showPassword ? "text" : "password"}
            name="password"
            id=""
            value={formData.password}
            placeholder="Mot de passe"
            onChange={(e) => handleChange(e)}
          />
          <div
            className="show-hide-password"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? <PiEyeBold /> : <PiEyeClosedDuotone />}
          </div>
        </div>
        <div className="button-container" style={{display: 'flex', gap: '15px', alignItems: 'center', marginTop: loading ? 0 : '0.9vw', marginLeft: loading ? '-5.8vw' : 0}}>
          {loading && <Loader />}
          <Button disabled={loading} onClick={(e) => handleSubmit(e)} variant="aqua">
            Connexion
          </Button>
        </div>
      </form>
    </div>
  );
}
