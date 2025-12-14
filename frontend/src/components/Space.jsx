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
import { TbUsersMinus, TbUsersPlus } from "react-icons/tb";
import InviteUserModal from "../components/modals/InviteUserModal";
import CreateRecipient from "../components/modals/CreateRecipient";
import { TiDelete } from "react-icons/ti";

export default function Space({ editMode, setEditMode, roles }) {
  const { space, user } = useContext(AuthContext);
  const [spaceMemberships, setSpaceMemberships] = useState([]);
  const [deleteCaregiverModal, setDeleteCaregiverModal] = useState(false);
  const [selectedCaregiver, setSelectedCaregiver] = useState();
  const [selectedRecipient, setSelectedRecipient] = useState();
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [addRecipient, setAddRecipient] = useState(false);
  const [removeRecipient, setRemoveRecipient] = useState(false);
  const [refreshSpace, setRefreshSpace] = useState(false);
  const [validationField, setValidationField] = useState("");

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

  const handleDeleteModal = (e, item) => {
    if (!e.target) return;

    if (e.target.parentElement.parentElement.className === "caregiver") {
      setSelectedCaregiver(item);
      setDeleteCaregiverModal(true);
    } else {
      setSelectedRecipient(item);
      setRemoveRecipient(true);
    }
  };

  const handleClose = (e) => {
    if (deleteCaregiverModal) {
      setDeleteCaregiverModal(false);
    } else if (removeRecipient) {
      setRemoveRecipient(false);
    }
  };

  const isCreator = (user) => {
    if (!user) return;
    if (space.created_by === user) return true;
    return false;
  };

  const canEdit = (user) => {
    if (!user) return;

    let caregiver = space.caregivers.find((e) => e.user === user);

    console.log(caregiver.access_level);
    if (caregiver.access_level < 3) return true;

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

  const deleteRecipient = async (recipient) => {
    
    if(validationField.toUpperCase() !== "SUPPRIMER") return

    try {
      await api.delete(`http://127.0.0.1:8000/api/recipients/${recipient.id}/`)
      handleClose()
    } catch (error) {
      console.log(error);
      
    }
  }

  useEffect(() => {
    getSpaceMemberships();
  }, [space]);

  useEffect(() => {
    if (refreshSpace) {
      window.location.reload();
    }
  }, [refreshSpace]);

  console.log(validationField);
  console.log(selectedRecipient);

  return Object.keys(space).length > 0 && user ? (
    <div className="space-container">
      <InviteUserModal show={showInviteModal} setShow={setShowInviteModal} />

      <CreateRecipient
        show={addRecipient}
        setShow={setAddRecipient}
        space={space}
        setRefreshRecipients={setRefreshSpace}
      />
      <Modal
        show={deleteCaregiverModal}
        onHide={(e) => handleClose(e)}
        id="revokeCaregiverModal"
      >
        <Modal.Header closeButton>
          <Modal.Title>Révoquer l'accès</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>
            Êtes-vous sûr(e) de vouloir révoquer l'accès de cet utilisateur ?
          </p>
          {selectedCaregiver && (
            <strong>
              <TiDelete /> {selectedCaregiver.first_name}{" "}
              {selectedCaregiver.last_name}
            </strong>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="outline-danger"
            onClick={() => revokeAccess(selectedCaregiver)}
          >
            Continuer
          </Button>

          <Button variant="outline-secondary" onClick={handleClose}>
            Annuler
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal
        show={removeRecipient}
        onHide={(e) => handleClose(e)}
        id="removeRecipientModal"
      >
        <Modal.Header closeButton>
          <Modal.Title>Supprimer un aidé</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>
            Êtes-vous sûr(e) de vouloir supprimmer cette personne ?<br /> Toutes
            ses donnée seront perdues
          </p>
          {selectedRecipient && (
            <strong>
              <TiDelete /> {selectedRecipient.first_name}{" "}
              {selectedRecipient.last_name}
            </strong>
          )}
          <div className="validation-field">
            <label htmlFor="">SUPPRIMER</label>
            <input type="text" name="validation" id="" onChange={(e) => setValidationField(e.target.value)}/>
          </div>
          <small>Ecrivez "supprimer" dans le champ ci-dessus puis cliquez sur continuer</small>
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="outline-danger"
            onClick={() => deleteRecipient(selectedRecipient)}
          >
            Continuer
          </Button>

          <Button variant="outline-secondary" onClick={(e) => handleClose(e)}>
            Annuler
          </Button>
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
                 editMode.active && editMode.target === "caregivers"
                   ? "active"
                   : ""
               }
              `}
              onClick={(e) => handleEditMode(e)}
            >
              {editMode.active && editMode.target === "caregivers" ? (
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
                          variant="outline-danger"
                          className="revoke"
                          onClick={(e) => handleDeleteModal(e, item)}
                          size="sm"
                        >
                          <FaUserMinus />
                        </Button>
                      </div>
                    ) : (
                      <Badge pill className="role-badge">
                        {getAccessLevel(item)}
                      </Badge>
                    )}
                  </div>
                </li>
              );
            })}
        </ul>
        {isCreator(user.id) && (
          <Button
            onClick={() => setShowInviteModal(true)}
            className="add-person"
          >
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
                editMode.active && editMode.target === "recipients"
                  ? "active"
                  : ""
              }`}
              onClick={(e) => handleEditMode(e)}
            >
              {editMode.active && editMode.target === "recipients" ? (
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
          {space.recipients.length > 0 ? (
            space.recipients.map((item) => {
              return (
                <li
                  className={`recipient ${
                    item.user === user.id ? "current-user" : ""
                  }`}
                >
                  <div className="info">
                    <p>
                      {item.first_name} {item.last_name}
                    </p>
                    {editMode.active && editMode.target === "recipients" && canEdit(user.id) && (
                      <Button
                        onClick={(e) => handleDeleteModal(e, item)}
                        className="remove-person"
                        variant="outline-danger"
                      >
                        <FaUserMinus />
                      </Button>
                    )}
                  </div>
                </li>
              );
            })
          ) : (
            <small style={{ textAlign: "center" }}>Aucun aidé</small>
          )}
        </ul>
        {canEdit(user.id) && (
          <Button onClick={() => setAddRecipient(true)} className="add-person">
            <TbUsersPlus /> Ajouter un aidé
          </Button>
        )}
      </div>
    </div>
  ) : (
    <Loader />
  );
}
