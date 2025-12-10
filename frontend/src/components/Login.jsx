import React, { useContext, useState, useEffect, use } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { AuthContext, AuthProvider } from "../context/AuthContext";
import { ToastContext } from "../context/ToastContext";
import { PiEyeBold } from "react-icons/pi";
import { PiEyeClosedDuotone } from "react-icons/pi";
import Button from "react-bootstrap/esm/Button";

export default function Login() {
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false)

  const navigate = useNavigate();

  const { login, message } = useContext(AuthContext);
  const { setShowToast, setMessage, setColor } = useContext(ToastContext);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isLoading) {
      return;
    }

    setIsLoading(true);
    login(formData.email, formData.password);
    setIsLoading(false);
  };

  useEffect(() => {
    setMessage(message.message)
    if (message.status === "success") {
        setShowToast(true)
        setColor("success")
        navigate("/home");
    } else {
      setShowToast(true)
      setColor("danger")
    }
  }, [message]);

  return (
    <div id="login">
      <h2>Se connecter</h2>
      <form>
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
          <div className="show-hide-password" onClick={() => setShowPassword(!showPassword)}>
            {showPassword ?
             <PiEyeBold />

             :

             <PiEyeClosedDuotone />
            }
          </div>
          </div>
        <Button
          disabled={isLoading}
          onClick={(e) => handleSubmit(e)}
        >Connexion</Button>
      </form>
    </div>
  );
}
