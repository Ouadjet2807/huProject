import React, { useContext, useEffect, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import Loader from "./Loader";
import { PiCrownSimpleDuotone } from "react-icons/pi";
import Button from "react-bootstrap/esm/Button";
import { CiEdit } from "react-icons/ci";
import { LuSave } from "react-icons/lu";
import Badge from "react-bootstrap/Badge";
import api from "../api/api";
import { FaUserMinus } from "react-icons/fa";
import Modal from "react-bootstrap/Modal";
import { TbUsersPlus } from "react-icons/tb";
import InviteUserModal from "../components/modals/InviteUserModal";
import CreateRecipient from "../components/modals/CreateRecipient";

export default function Space({ editMode, setEditMode, roles }) {
  const { space, user } = useContext(AuthContext);
  const [spaceMemberships, setSpaceMemberships] = useState([]);
  const [deleteCaregiverModal, setDeleteCaregiverModal] = useState(false);
  const [selectedCaregiver, setSelectedCaregiver] = useState();
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [addRecipient, setAddRecipient] = useState(false);

  const handleEditMode = (e) => {
    if (!e.target) return;
    let target = e.target.parentElement.parentElement.id;

    if (target !== editMode.target) {
      setEditMode({
        active: true,
        target: target,
      });
    } else if (editMode.active) {
      // handleSubmit();
      setEditMode({
        active: !editMode.active,
        target: "",
      });
    }
  };

  const handleDeleteModal = (caregiver) => {
    setSelectedCaregiver(caregiver);
    setDeleteCaregiverModal(true);
  };

  const handleClose = () => {
    setDeleteCaregiverModal(false);
  };

  const isCreator = (user) => {
    if (!user) return;
    if (space.created_by === user) return true;
    return false;
  };

  const canEdit = (user) => {
    if (!user) return;

    let caregiver = space.caregivers.find((e) => e.user === user);

    if (caregiver.access_level < 2) return true;

    return false;
  };

  const getSpaceMemberships = async () => {
    if (!space || !space.id) return;
    try {
      let res = await api.get(
        `http://127.0.0.1:8000/api/space_memberships/?space=${space.id}`
      );
      setSpaceMemberships(res.data);
    } catch (error) {
      console.log(error);
    }
  };

  const getSpaceCreator = () => {
    if (!space.caregivers || !user) return;

    if (space.caregivers.length > 1 && space.created_by !== user.id) {
      let creator = space.caregivers.find((e) => e.user == space.created_by);
      return creator.first_name + " " + creator.last_name;
    } else return "vous";
  };

  const getAccessLevel = (caregiver) => {
    if (!caregiver) return;
    const access_level = roles.find((r) => r[0] == caregiver.access_level);

    if (access_level && access_level.length > 0) return access_level[1];
  };

  const getAccessDate = (caregiver) => {
    if (!spaceMemberships.length > 0) return;

    console.log(caregiver.user);

    const membership = spaceMemberships.find(
      (e) => e.user.id === caregiver.user
    );

    return membership.created_at;
  };

  const handleChange = async (e, id) => {
    if (!e.target) return;
    let targetCaregiver = space.caregivers.find((e) => e.id == id);

    targetCaregiver[e.target.name] =
      e.target.type === "select-one"
        ? parseInt(e.target.value)
        : e.target.value;

    try {
      await api.put(
        `http://127.0.0.1:8000/api/caregivers/${targetCaregiver.id}/`,
        targetCaregiver
      );
      console.log("success");
    } catch (error) {
      console.log(error);
    }
  };

  const revokeAccess = async (caregiver) => {
    const membership = spaceMemberships.find(
      (e) => e.user.id == caregiver.user
    );
    try {
      let res = await api.delete(
        `http://127.0.0.1:8000/api/space_memberships/${membership.id}/`
      );
    } catch (error) {
      console.log(error);
    }
    console.log(membership);
  };

  useEffect(() => {
    getSpaceMemberships();
  }, [space]);

  console.log(space.caregivers);
  console.log(spaceMemberships);

  return space && user ? (
    <div className="space-container">
      <InviteUserModal show={showInviteModal} setShow={setShowInviteModal} />

      <CreateRecipient
        show={addRecipient}
        setShow={setAddRecipient}
        space={space}
      />
      <Modal show={deleteCaregiverModal} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>Révoquer l'accès</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>
            Êtes-vous sûr(e) de vouloir révoquer l'accès de cet utilisateur ?
          </p>
          {selectedCaregiver && (
            <strong>
              {selectedCaregiver.first_name} {selectedCaregiver.last_name}
            </strong>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="danger"
            onClick={() => revokeAccess(selectedCaregiver)}
          >
            Continuer
          </Button>

          <Button variant="outline-secondary">Annuler</Button>
        </Modal.Footer>
      </Modal>
      <h1>Votre espace</h1>
      <small className="creation-info">
        crée le{" "}
        <strong>
          {new Date(space.created_at).toLocaleString().slice(0, 10)}
        </strong>{" "}
        par <strong>{getSpaceCreator()}</strong>
      </small>
      <div className="box" id="caregivers">
        <div className="box-header">
          <strong>Membres</strong>
          {isCreator(user.id) && (
            <Button
              className={`edit-button
               ${
                 editMode.active && editMode.target === "personalInfo"
                   ? "active"
                   : ""
               }
              `}
              onClick={(e) => handleEditMode(e)}
            >
              {editMode.active && editMode.target === "personalInfo" ? (
                <>
                  Enregistrer <LuSave />
                </>
              ) : (
                <>
                  Modifier <CiEdit />
                </>
              )}
            </Button>
          )}
        </div>
        <ul>
          {space.caregivers &&
            space.caregivers.map((item) => {
              return (
                <li
                  className={`caregiver ${
                    item.user === user.id ? "current-user" : ""
                  }`}
                >
                  <div className="status-badge">
                    {isCreator(item.user) && <PiCrownSimpleDuotone />}
                  </div>
                  <div className="info">
                    <p>
                      {item.first_name} {item.last_name}
                    </p>
                    <small>
                      {new Date(getAccessDate(item)).toLocaleDateString()}
                    </small>
                    {editMode.active &&
                    editMode.target === "caregivers" &&
                    item.user !== user.id ? (
                      <div className="actions">
                        <select
                          name="access_level"
                          id=""
                          onChange={(e) => handleChange(e, item.id)}
                        >
                          {roles.map((role) => {
                            return (
                              <option
                                value={role[0]}
                                selected={item.access_level == role[0]}
                              >
                                {role[1]}
                              </option>
                            );
                          })}
                        </select>

                        <Button
                          variant="danger"
                          className="revoke"
                          onClick={() => handleDeleteModal(item)}
                        >
                          <FaUserMinus /> Révoquer l'accès
                        </Button>
                      </div>
                    ) : (
                      <Badge>{getAccessLevel(item)}</Badge>
                    )}
                  </div>
                </li>
              );
            })}
        </ul>
        {isCreator(user.id) && (
          <Button onClick={() => setShowInviteModal(true)}>
            <TbUsersPlus /> Inviter un membre
          </Button>
        )}
      </div>
      <div className="box" id="recipients">
        <div className="box-header">
          <strong>Membres</strong>
          {isCreator(user.id) && (
            <Button
              className={`edit-button ${
                editMode.active && editMode.target === "personalInfo"
                  ? "active"
                  : ""
              }`}
              onClick={(e) => handleEditMode(e)}
            >
              {editMode.active && editMode.target === "personalInfo" ? (
                <>
                  Enregistrer <LuSave />
                </>
              ) : (
                <>
                  Modifier <CiEdit />
                </>
              )}
            </Button>
          )}
        </div>
        <ul>
          {space.recipients.length > 1 ? (
            space.recipients.map((item) => {
              return (
                <li
                  className={`caregiver ${
                    item.user === user.id ? "current-user" : ""
                  }`}
                >
                  <div className="info">
                    <p>
                      {item.first_name} {item.last_name}
                    </p>
                    {/* <small>{new Date(getAccessDate(item))}</small> */}
                    {/* {editMode.active && editMode.target === "caregivers" ?
                  <select name="access_level" id="" onChange={(e) => handleChange(e, item.id)}>
                    {roles.map(role => {
                      return <option value={role[0]} selected={item.access_level == role[0]}>{role[1]}</option>
                    })}
                  </select>
                :
                <Badge>{getAccessLevel(item)}</Badge>
              } */}
                  </div>
                </li>
              );
            })
          ) : (
            <small style={{ textAlign: "center" }}>Aucun aidé</small>
          )}
        </ul>
        {canEdit(user.id) && (
          <Button onClick={() => setAddRecipient(true)}>
            <TbUsersPlus /> Ajouter un aidé
          </Button>
        )}
      </div>
    </div>
  ) : (
    <Loader />
  );
}
