import React, { useContext, useState, useEffect, use } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { AuthContext, AuthProvider } from "../context/AuthContext";

export default function Login() {
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const navigate = useNavigate();

  const { login, message } = useContext(AuthContext);

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
    if (message.status === "success") {
      setTimeout(() => {
        navigate("/home");
      }, 2000);
    }
  }, [message]);

  return (
    <div id="login">
      <h2>Se connecter</h2>
      {message.message != "" && (
        <div className={`validation ${message.status}`}>{message.message}</div>
      )}
      <form>
        <input
          type="email"
          name="email"
          id=""
          value={formData.email}
          placeholder="Email"
          onChange={(e) => handleChange(e)}
        />
        <input
          type="password"
          name="password"
          id=""
          value={formData.password}
          placeholder="Password"
          onChange={(e) => handleChange(e)}
        />
        <input
          type="submit"
          value="Login"
          disabled={isLoading}
          onClick={(e) => handleSubmit(e)}
        />
      </form>
    </div>
  );
}
