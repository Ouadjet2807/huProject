import React, { useEffect, useState } from 'react';
import api from '../api/api';
import { useAuth } from '../context/AuthContext';
import { useParams, useNavigate } from 'react-router-dom';

export default function AcceptInvite() {
  const { token } = useParams(); // route: /accept-invite/:token
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (loading) return;
    const accept = async () => {
      if (!user) {
        setMessage('Please log in or sign up to accept the invite.');
        return;
      }
      try {
        const res = await api.post('/invites/accept/', { token });
        setMessage('Invite accepted!');
        navigate(`/spaces/${res.data.space_id}`);
      } catch (err) {
        setMessage(err.response?.data?.detail || 'Failed to accept invite');
      }
    };
    accept();
  }, [user, loading, token, navigate]);

  return <div>{message}</div>;
}