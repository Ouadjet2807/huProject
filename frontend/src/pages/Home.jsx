import { useState } from "react";
import { useNavigate } from "react-router";
import CreateRecipient from "../components/recipients/CreateRecipient";
import TodoList from "../components/todoList/TodoList";
import Loader from "../components/Loader";
import InviteUserModal from "../components/modals/InviteUserModal";
import { TbUsersPlus } from "react-icons/tb";
import { FaUserCircle } from "react-icons/fa";
import Button from "react-bootstrap/Button";
import { FiPlus } from "react-icons/fi";

export default function Home({ user, loading, caregivers, recipients }) {
  const [addRecipient, setAddRecipient] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);

  const navigate = useNavigate();
  
  return (
    <div id="home">
      <div className="home-container">
        <InviteUserModal show={showInviteModal} setShow={setShowInviteModal} />
        <div className="left-tab">
          <h1>Hello {user && user.first_name}, Bienvenue</h1>

          <div className="recipients box">
            {loading && <Loader overlay={true} />}
            <h3>Vos aidés</h3>

            {recipients && recipients.length > 0 ? (
              <ul>
                {recipients.map((item, index) => {
                  return (
                    <li
                    key={`recipient_${index}`}
                      role="recipientListItem"
                      data-testid={`${item.first_name}_${item.last_name}`}
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
                    </li>
                  );
                })}
              </ul>
            ) : (
              <p data-testid="noRecipients">Aucun aidé</p>
            )}
            {(user && user.can_edit) &&
            <Button variant="aqua" onClick={() => setAddRecipient(true)}>
              <FiPlus /> Ajouter un aidé
            </Button>
            }
          </div>
          <div className="caregivers box">
            {loading && <Loader overlay={true} />}
            <h3>Les autres aidants</h3>
            {caregivers && caregivers.length > 1 ? (
              <ul>
                {caregivers
                  .filter((caregiver) => caregiver.user !== user.id)
                  .map((item, index) => {
                    return (
                      <li
                            key={`caregiver_${index}`}
                        role="caregiverListItem"
                        data-testid={`${item.first_name}_${item.last_name}`}
                        className="caregiver"
                        onClick={() => navigate(`/account/space`)}
                      >
                        <span>
                          <div className="icon">
                            <FaUserCircle />
                          </div>
                          <span>
                            {item.first_name} {item.last_name}{" "}
                            {item.access_level === 1 && (
                              <small data-testid="adminTag">(administrateur)</small>
                            )}
                          </span>
                        </span>
                      </li>
                    );
                  })}
              </ul>
            ) : (
              <p data-testid="noCaregivers">Aucun aidant</p>
            )}
            {user && user.is_admin && (
              <Button
                data-testid="inviteUser"
                variant="aqua"
                onClick={() => setShowInviteModal(true)}
              >
                <TbUsersPlus /> Inviter une personne
              </Button>
            )}
          </div>
        </div>

        <CreateRecipient show={addRecipient} setShow={setAddRecipient} />
        <div className="right-tab">
          {loading && <Loader overlay={true} />}
          <h3>Todo list</h3>
          <TodoList user={user} />
        </div>
      </div>
    </div>
  );
}
