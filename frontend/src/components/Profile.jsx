import React, { act, useContext, useEffect, useState } from "react";
import { FaUserCircle } from "react-icons/fa";
import Loader from "../components/Loader";
import { CiEdit } from "react-icons/ci";
import { LuSave } from "react-icons/lu";
import Button from "react-bootstrap/esm/Button";
import api from "../api/api";
import { PiAtLight } from "react-icons/pi";
import { AuthContext } from "../context/AuthContext";
import { ToastContext } from "../context/ToastContext";

export default function Profile({ editMode, setEditMode, roles }) {
    
  const { user } = useContext(AuthContext);
  const { setMessage, setColor, setShowToast } = useContext(ToastContext);
  const [caregiverProfile, setCaregiverProfile] = useState({});
  const [caregiverFormData, setCaregiverFormData] = useState({});
  const [userFormData, setUserFormData] = useState({});

  const getAccessLevel = () => {
    if (!caregiverProfile) return;
    const access_level = roles.find(
      (r) => r[0] == caregiverProfile.access_level
    );

    if (access_level && access_level.length > 0) return access_level[1];
  };

  const handleChange = (e) => {
    console.log(e.target);
    if (e.target.className === "caregiver-input") {
      setCaregiverFormData((prev) => ({
        ...prev,
        [e.target.name]: e.target.value,
      }));
    } else {
      setUserFormData((prev) => ({
        ...prev,
        [e.target.name]: e.target.value,
      }));
    }
  };

  const handleSubmit = async () => {

    try {
      if (
        JSON.stringify(user) === JSON.stringify(userFormData) &&
        JSON.stringify(caregiverProfile) === JSON.stringify(caregiverFormData)
      ) {
        setEditMode({ active: false, target: ''});
        return;
      } else {
        let userHasChanged =
          JSON.stringify(user) !== JSON.stringify(userFormData);
        let caregiverHasChanged =
          JSON.stringify(caregiverProfile) !==
          JSON.stringify(caregiverFormData);
        if (userHasChanged) {
          let put = await api.post(
            `http://127.0.0.1:8000/api/update_user/${user.id}/`,
            userFormData
          );
        } else if (caregiverHasChanged) {
          let put = await api.put(
            `http://127.0.0.1:8000/api/caregivers/${caregiverProfile.id}/`,
            caregiverFormData
          );
        }
      }
      setEditMode({ active: false, target: ''});
      setShowToast(true);
      setColor("success");
      setMessage("Vos modifications ont bien été prises en compte");
    } catch (error) {
      console.log(error);
      setShowToast(true);
      setColor("danger");
      if (error.response && error.response.data) {
        Object.keys(error.response.data).forEach((field) => {
          const errorMessages = error.response.data[field];
          if (errorMessages && errorMessages.length > 0) {
            setMessage(errorMessages[0]);
          } else {
            setMessage(
              "Une erreur inconnue s'est produite, veuillez réessayer ultérieurement"
            );
          }
        });
      }
    }
  };

  const handleEditMode = (e) => {
    if (!e.target) return;
    let target = e.target.parentElement.parentElement.id;

    if (target !== editMode.target) {
      setEditMode({
        active: true,
        target: target,
      });
    } else if (editMode.active) {
      handleSubmit();
    }
  };

  useEffect(() => {
    const getCaregiverProfile = async () => {
      if (!user) return;

      try {
        let res = await api.get(
          `http://127.0.0.1:8000/api/caregivers/?id=${user.id}`
        );
        setCaregiverProfile(res.data[0]);
      } catch (error) {
        console.log(error);
      }
    };

    getCaregiverProfile();
    setUserFormData(user);
  }, [user]);

  useEffect(() => {
    setCaregiverFormData(caregiverProfile);
  }, [caregiverProfile]);

  return userFormData && caregiverFormData ? (
    <div className="profile-container">
      <h1>Hello {user && user.first_name}</h1>
      <div className="box" id="generalInfo">
        <div className="icon">
          <FaUserCircle />
        </div>
        <div className="user-info">
          <div className="text">
            <strong className="name">
              {user && user.first_name} {user && user.last_name}
            </strong>
            {editMode.active && editMode.target === "generalInfo" ? (
              <div className="username-field">
                <PiAtLight />
                <input
                  type="text"
                  name="username"
                  id=""
                  value={userFormData.username}
                  onChange={(e) => handleChange(e)}
                />
              </div>
            ) : (
              <small>
                <PiAtLight />
                {userFormData && userFormData.username}
              </small>
            )}
            <span>{getAccessLevel()}</span>
          </div>
          <Button
            className={`edit-button ${
              editMode.active && editMode.target === "generalInfo"
                ? "active"
                : ""
            }`}
            onClick={(e) => handleEditMode(e)}
          >
            {editMode.active && editMode.target === "generalInfo" ? (
              <>
                Enregistrer <LuSave />
              </>
            ) : (
              <>
                Modifier <CiEdit />
              </>
            )}
          </Button>
        </div>
      </div>

      <div className="box" id="personalInfo">
        <div className="box-header">
          <strong>Informations personnelles</strong>
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
        </div>
        {editMode.active && editMode.target === "personalInfo" ? (
          <>
            <div className="item">
              <small>Prénom</small>
              <input
                type="text"
                name="first_name"
                value={userFormData.first_name}
                className="user-input"
                onChange={(e) => handleChange(e)}
              />
            </div>
            <div className="item">
              <small>Nom</small>
              <input
                type="text"
                name="last_name"
                value={userFormData.last_name}
                className="user-input"
                onChange={(e) => handleChange(e)}
              />
            </div>
            <div className="item">
              <small>Adresse email</small>
              <input
                type="email"
                name="email"
                value={userFormData.email}
                className="user-input"
                onChange={(e) => handleChange(e)}
              />
            </div>
            <div className="item">
              <small>Date de naissance</small>
              <input
                type="date"
                name="birth_date"
                className="caregiver-input"
                value={
                  caregiverFormData.birth_date
                    ? new Date(caregiverFormData.birth_date)
                        .toISOString()
                        .slice(0, 10)
                    : new Date()
                }
                onChange={(e) => handleChange(e)}
              />
            </div>
          </>
        ) : (
          <>
            <div className="item">
              <small>Prénom</small>
              <p>{userFormData.first_name}</p>
            </div>
            <div className="item">
              <small>Nom</small>
              <p>{userFormData.last_name}</p>
            </div>
            <div className="item">
              <small>Adresse email</small>
              <p>{userFormData.email}</p>
            </div>
            <div className="item">
              <small>Date de naissance</small>
              <p>
                {caregiverFormData.birth_date
                  ? new Date(caregiverFormData.birth_date).toLocaleDateString()
                  : "/"}
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  ) : (
    <Loader />
  );
}
