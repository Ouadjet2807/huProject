import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import CreateRecipient from "../components/CreateRecipient";
import { SlUserFemale } from "react-icons/sl";
import { SlUser } from "react-icons/sl";
import { AiOutlineLoading } from "react-icons/ai";
import Agenda from "../components/Agenda";

export default function Home() {
  const [userInfo, setUserInfo] = useState({});
  const [addRecipient, setAddRecipient] = useState(false);
  const [refreshRecipients, setRefreshRecipients] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState();
  const [space, setSpace] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState();
  const navigate = useNavigate();

  const { user, logout, loading } = useContext(AuthContext);

  console.log(loading);

  const handleLogout = async () => {
    try {
      const refreshToken = localStorage.getItem("refreshToken");

      logout(refreshToken);

      console.log(refreshToken);
    } catch (error) {
      console.log(error);
    } finally {
      navigate("/login");
    }
  };

  const fetchSpaces = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("accessToken");

      if (token) {
        const config = {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        };
        const res = await axios.get(
          "http://127.0.0.1:8000/api/spaces/",
          config
        );
        setSpace(res.data[0]);
      }
    } catch (err) {
      console.error(err);
      if (err.response) {
        setError(err.response.data);
      } else {
        setError({ detail: "Network error" });
      }
    } finally {
      setIsLoading(false);
      setRefreshRecipients(false);
    }
  };


  useEffect(() => {
    const checkUserLoggedIn = () => {
      if (!loading && !user) navigate("/login");
    };
    fetchSpaces();
    checkUserLoggedIn();
  }, [loading, user, navigate]);

  useEffect(() => {
    fetchSpaces();
  }, [refreshRecipients]);

  console.log(user);
  console.log(space);
  console.log(Object.keys(space).includes("recipients"));

  return (
    <div id="home">
      {!loading ? (
        <>
          <div className="left-tab">
          <h1>Hi {user && user.first_name}, welcome</h1>

            <div className="recipients">
            <h3>Your recipients</h3>
              {Object.keys(space).includes("recipients") &&
                space.recipients.map((item) => {
                  return (
                    <div className="recipient" onClick={() => navigate(`/recipient/${item.id}`)}>
                      <h4>
                        <div className="icon">
                          {item.gender === "F" ? <SlUserFemale /> : <SlUser />}
                        </div>
                        {item.first_name} {item.last_name}
                      </h4>
                    </div>
                  );
                })}

            <button onClick={() => setAddRecipient(true)}>
              Add a recipient
            </button>
            </div>
          </div>

          {addRecipient && (
            <CreateRecipient
              space={space}
              setRefreshRecipients={setRefreshRecipients}
            />
          )}
          <div className="rightTab">
            <Agenda space={space}/>
          </div>
          <button onClick={handleLogout}>Logout</button>
        </>
      ) : (
        <div>Loading</div>
      )}
    </div>
  );
}
