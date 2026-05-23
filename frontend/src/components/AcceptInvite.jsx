import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useParams } from 'react-router';
import axios from 'axios';
import Sign from '../pages/Sign';

export default function AcceptInvite() {
  const { token } = useParams();
  const { register, loading, setLoading, message } = useContext(AuthContext)
  const [invitation, setInvitation] = useState({});
  const [errorMessage, setErrorMessage] = useState('')

  const getInvitation = async () => {

    if(!token) return

    try {
      const res = await axios.get(`https://huproject-production.up.railway.app/api/invitations/validate/?token=${token}`)
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
    <Sign inviteData={invitation} token={token} register={register} loading={loading} message={message}/>
    </div>
  </div>
);
}