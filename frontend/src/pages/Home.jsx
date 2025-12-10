import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import CreateRecipient from "../components/modals/CreateRecipient";
import { SlUserFemale } from "react-icons/sl";
import { SlUser } from "react-icons/sl";
import { AiOutlineLoading } from "react-icons/ai";
import Agenda from "../components/Agenda";
import TodoList from "../components/TodoList";
import Loader from "../components/Loader";
import InviteUserModal from "../components/modals/InviteUserModal";

export default function Home({ setRefreshRecipients, space }) {
  const [addRecipient, setAddRecipient] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);

  const navigate = useNavigate();

  const { user, logout, loading } = useContext(AuthContext);

  console.log(loading);

  // useEffect(() => {
  //   const checkUserLoggedIn = () => {
  //     if (!loading && !user) navigate("/login");
  //   };

  //   checkUserLoggedIn();
  // }, [loading, user, navigate]);

  return (
    <div id="home">
      {!loading ? (
        <div className="home-container">
          <InviteUserModal show={showInviteModal} setShow={setShowInviteModal}/>
          <div className="left-tab">
            <h1>Hi {user && user.first_name}, welcome</h1>

            <div className="recipients box">
              <h3>Your recipients</h3>
              {space &&
                Object.keys(space).includes("recipients") &&
                space.recipients.map((item) => {
                  return (
                    <div
                      className="recipient"
                      onClick={() => navigate(`/recipient/${item.id}`)}
                    >
                    <span>
                        <div className="icon">
                          {item.gender === "F" ? <SlUserFemale /> : <SlUser />}
                        </div>
                        <strong>{item.first_name} {item.last_name}</strong>
                      </span>
                    </div>
                  );
                })}

              <button onClick={() => setAddRecipient(true)}>
                Add a recipient
              </button>
            </div>
            <div className="caregivers box">
              <h3>Your recipients</h3>
              {space &&
                Object.keys(space).includes("caregivers") &&
                space.caregivers.map((item) => {
                  return (
                    <div
                      className="recipient"
                      onClick={() => navigate(`/caregivers/${item.id}`)}
                    >
                      <span>
                        <div className="icon">
                          {item.gender === "F" ? <SlUserFemale /> : <SlUser />}
                        </div>
                        <strong>{item.first_name} {item.last_name}</strong>
                      </span>
                    </div>
                  );
                })}

              <button onClick={() => setShowInviteModal(true)}>
                Inviter une personne
              </button>
            </div>
          </div>

          {addRecipient && (
            <CreateRecipient
              show={addRecipient}
              setShow={setAddRecipient}
              space={space}
              setRefreshRecipients={setRefreshRecipients}
            />
          )}
          <div className="right-tab">
            <TodoList user={user} space={space} />
          </div>
        </div>
      ) : (
        <Loader />
      )}
    </div>
  );
}
