import React, { useEffect, useState } from 'react';
import api from '../api/api';
import { useAuth } from '../context/AuthContext';
import { useParams, useNavigate } from 'react-router';
import axios from 'axios';
import Register from './authentification/Register';

export default function AcceptInvite() {
  const { token } = useParams(); // route: /accept-invite/:token

  const navigate = useNavigate();
  const [invitation, setInvitation] = useState({});
  const [loading, setLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')

  const getInvitation = async () => {

    if(!token) return

    try {
      const res = await axios.get(`http://127.0.0.1:8000/api/invitations/validate/?token=${token}`)
      setInvitation(res.data)
    }
    catch (error) {
      console.log(error);
      if(Object.keys(error.response.data).includes("valid") && !error.response.data.valid) {
        setErrorMessage("Le token a expiré veuillez renvoyer une invitation")
      }
    }

    setLoading(false)
  }
  
  useEffect(() => {
    getInvitation()
  }, [])

  return (
  <div id="acceptInvite">
    {errorMessage}
    <div className="container">
    <Register data={invitation} token={token}/>
    </div>
  </div>
);
}