import React, { useContext, useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { v4 as uuidv4 } from "uuid";
import { AuthContext } from "../context/AuthContext";
import { PiEyeBold } from "react-icons/pi";
import { PiEyeClosedDuotone } from "react-icons/pi";
import { ToastContext } from "../context/ToastContext"; 
import Button from "react-bootstrap/esm/Button";

export default function Register({data, token}) {
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState({
    invited: {
       invited: false,
      invited_by: null,
      role: 1
    },
    email: "",
    username: "",
    last_name: "",
    first_name: "",
    password: "",
    confirm_password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const navigate = useNavigate();

  const { register, message, user } = useContext(AuthContext);

  const { setShowToast, setMessage, setColor } = useContext(ToastContext);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));

    console.log(formData);
  };

  const handleSubmit = async (e) => {

    console.log(data);
    
    
    e.preventDefault();
    if (isLoading) {
      return;
    }

    setIsLoading(true);

    register(formData);

    // if(token) {
    //     data.accepted = true
    //     data.token = token
    //   try {
    //     const res = await axios.put(`http://127.0.0.1:8000/api/invitations/${token}/`, data)
    //   } catch (error) {
    //     console.log(error);
        
    //   }
    // }
    console.log(user);
    

    setIsLoading(false);
  };

  useEffect(() => {

    if(message.message === '') return
    setMessage(message.message)
    if (message.status === "success") {
      setShowToast(true);
      setColor("success");
      navigate("/home");
    } else {
      setShowToast(true);
      setColor("danger");
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

  useEffect(() => {
    if(!data) return

    let invitation = {
      invited: true,
      invited_by: data.sender,
      role: data.role
    }

    setFormData(prev => ({
      ...prev,
      invited: JSON.stringify(invitation),
      email: data.email,
    }))
  }, [data])

  console.log(data);
  

  return (
    <div id="register">
      <h2>Register</h2>
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
          placeholder="Prénom"
          onChange={(e) => handleChange(e)}
        />
        <input
          type="text"
          name="last_name"
          id=""
          value={formData.last_name}
          placeholder="Nom"
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
        <div className="password-field">
          <input
            type={showConfirmPassword ? "text" : "password"}
            name="confirm_password"
            id=""
            value={formData.confirm_password}
            placeholder="Confirmer le mot de passe"
            onChange={(e) => handleChange(e)}
          />
          <div
            className="show-hide-password"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
          >
            {showConfirmPassword ? <PiEyeBold /> : <PiEyeClosedDuotone />}
          </div>
        </div>

        <Button
          disabled={isLoading}
          onClick={(e) => handleSubmit(e)}
        >S'enregistrer</Button>
      </form>
    </div>
  );
}
