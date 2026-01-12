import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import CreateRecipient from "../components/modals/CreateRecipient";
import TodoList from "../components/TodoList";
import Loader from "../components/Loader";
import InviteUserModal from "../components/modals/InviteUserModal";
import { TbUsersPlus } from "react-icons/tb";
import { FaUserCircle } from "react-icons/fa";
import Button from "react-bootstrap/esm/Button";
import GroceryList from "../components/GroceryList";


export default function Home({ setRefreshSpace }) {
  const [addRecipient, setAddRecipient] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);

  const navigate = useNavigate();

  const { user, space, logout, loading } = useContext(AuthContext);

  console.log(loading);

  // useEffect(() => {
  //   const checkUserLoggedIn = () => {
  //     if (!loading && !user) navigate("/login");
  //   };

  //   checkUserLoggedIn();
  // }, [loading, user, navigate]);

  const isCreator = () => {
    if (!user || !space) return false;

    if (space.created_by === user.id) return true;
  };

  console.log(space);

  useEffect(() => {
    if (Object.keys(space).length <= 0) {
      setRefreshSpace(true);
    }
  }, [space]);

  return (
    <div id="home">
      {!loading ? (
        <div className="home-container">
          <InviteUserModal
            show={showInviteModal}
            setShow={setShowInviteModal}
          />
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
                          <FaUserCircle />
                        </div>
                        <span>
                          {item.first_name} {item.last_name}
                        </span>
                      </span>
                    </div>
                  );
                })}

              <Button variant="aqua" onClick={() => setAddRecipient(true)}>
                Add a recipient
              </Button>
            </div>
            <div className="caregivers box">
              <h3>Your recipients</h3>
              {space &&
                Object.keys(space).includes("caregivers") &&
                space.caregivers.map((item) => {
                  return (
                    <div
                      className="caregiver"
                      onClick={() => navigate(`/account/space`)}
                    >
                      <span>
                        <div className="icon">
                          <FaUserCircle />
                        </div>
                        <span>
                          {item.first_name} {item.last_name}
                        </span>
                      </span>
                    </div>
                  );
                })}
              {isCreator() && (
                <Button variant="aqua" onClick={() => setShowInviteModal(true)}>
                  <TbUsersPlus /> Inviter une personne
                </Button>
              )}
            </div>
          </div>

          <CreateRecipient
            show={addRecipient}
            setShow={setAddRecipient}
            space={space}
            setRefreshRecipients={setRefreshSpace}
          />
          <div className="middle-tab">
            <h3>Liste de courses</h3>
              <GroceryList />
          </div>
          <div className="right-tab">
            <h3>Todo list</h3>
            <TodoList user={user} space={space} />
          </div>
        </div>
      ) : (
        <Loader />
      )}
    </div>
  );
}
