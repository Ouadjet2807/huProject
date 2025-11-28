import React, { useContext, useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { v4 as uuidv4 } from "uuid";
import { AuthContext } from "../context/AuthContext";

export default function Register() {
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState({
    email: "",
    username: "",
    last_name: "",
    first_name: "",
    password: "",
    confirm_password: "",
  });

  const navigate = useNavigate();

  const { register, message } = useContext(AuthContext);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));

    console.log(formData);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isLoading) {
      return;
    }

    setIsLoading(true);

    register(formData);

    setIsLoading(false);
  };

  useEffect(() => {
    if (message.status === "success") {
      setTimeout(() => {
        navigate("/home");
      }, 2000);
    }
  }, [message]);

  useEffect(() => {
    if (formData.first_name.length > 0 && formData.last_name.length > 0) {
      const username =
        formData.first_name[0].toLowerCase() +
        formData.last_name.toLowerCase() +
        uuidv4().slice(0, 4);

      setFormData((prev) => ({
        ...prev,
        username: username,
      }));
    }
  }, [formData.first_name, formData.last_name]);

  return (
    <div id="register">
      <h2>Register</h2>
      {message !== "" && (
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
          type="text"
          name="first_name"
          id=""
          value={formData.first_name}
          placeholder="First name"
          onChange={(e) => handleChange(e)}
        />
        <input
          type="text"
          name="last_name"
          id=""
          value={formData.last_name}
          placeholder="Last name"
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
          type="password"
          name="confirm_password"
          id=""
          value={formData.confirm_password}
          placeholder="Confirm password"
          onChange={(e) => handleChange(e)}
        />
        <input
          type="submit"
          value="Register"
          disabled={isLoading}
          onClick={(e) => handleSubmit(e)}
        />
      </form>
    </div>
  );
}
