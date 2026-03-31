import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router";
import { AuthContext } from "../context/AuthContext";
import CreateRecipient from "../components/recipients/CreateRecipient";
import TodoList from "../components/todoList/TodoList";
import Loader from "../components/Loader";
import InviteUserModal from "../components/modals/InviteUserModal";
import { TbUsersPlus } from "react-icons/tb";
import { FaUserCircle } from "react-icons/fa";
import Button from "react-bootstrap/Button";
import api from "../api/api";
import { useSelector } from "react-redux";

export default function Home({ setRefreshSpace }) {
  const [addRecipient, setAddRecipient] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);

  const navigate = useNavigate();

  const { user, logout, loading } = useContext(AuthContext);
  const space = useSelector((state) => state.space);

  useEffect(() => {
    if (Object.keys(space).length <= 0) {
      setRefreshSpace(true);
    }
  }, [space]);


  return (
    <div id="home">
      <div className="home-container">
        <InviteUserModal show={showInviteModal} setShow={setShowInviteModal} />
        <div className="left-tab">
          <h1>Hi {user && user.first_name}, welcome</h1>

          <div className="recipients box">
            {loading && <Loader overlay={true} />}
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
            {loading && <Loader overlay={true} />}
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
                        {item.first_name} {item.last_name}{" "}
                        {space.created_by === item.user && (
                          <small>(administrateur)</small>
                        )}
                      </span>
                    </span>
                  </div>
                );
              })}
            {user && space.created_by && space.created_by.id === user.id && (
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
        <div className="right-tab">
          {loading && <Loader overlay={true} />}
          <h3>Todo list</h3>
          <TodoList user={user} space={space} />
        </div>
      </div>
    </div>
  );
}
