import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../api/api";
import axios from "axios";
import RecipientEditForm from "../components/RecipientEditForm";
import RecipientTreatments from "../components/RecipientTreatments";
import Specialists from "../components/Specialists";

export default function Recipient({spaceId}) {
  const [recipient, setRecipient] = useState({});

  const [activeTab, setActiveTab] = useState("general");

  const [medicalInfo, setMedicalInfo] = useState({
    allergies: [""],
    notes: "",
  });

  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    birth_date: "",
    treatments: [],
    gender: "",
    medical_info: "",
    space_id: "",
  });

  const today = new Date();

  const params = useParams();

  const recipient_id = params.id;

  console.log(params);

  const handleTab = (e) => {
    if (e.target.id) {
      setActiveTab(e.target.id);
    }
  };

  const getAge = () => {
    if (Object.keys(recipient).includes("birth_date")) {
      const birth_date = new Date(recipient.birth_date);

      console.log(birth_date);

      const age = today.getFullYear() - birth_date.getFullYear();

      return age;
    }
  };

  const renderActiveTab = () => {
    switch (activeTab) {
      case "general":
        console.log("general tab");
        return (
          <RecipientEditForm
            data={formData}
            medicalInfo={medicalInfo}
            setMedicalInfo={setMedicalInfo}
          />
        );
      case "treatments":
        console.log("treatments tab");
        return <RecipientTreatments formData={formData} setFormData={setFormData}/>;

      case "specialists":
        return <Specialists />;

      default:
        return <RecipientEditForm />;
    }
  };

  useEffect(() => {
    const getRecipientData = async () => {
      const token = localStorage.getItem("accessToken");
      if (token) {
        try {
          const response = await api.get(
            `http://127.0.0.1:8000/api/recipients/${recipient_id}`
          );
          setRecipient(response.data);
          setFormData({
            first_name: response.data.first_name,
            last_name: response.data.last_name,
            birth_date: response.data.birth_date,
            treatments: response.data.treatments,
            gender: response.data.gender,
            medical_info: response.data.medical_info,
            space_id: spaceId,
          });
          console.log("Success", response.data);
        } catch (error) {
          console.log(error);
        }
      }
    };

    const getMedsData = async () => {
      const token = localStorage.getItem("accessToken");
      if (token) {
        try {
          const response = await axios.get(
            `https://medicaments-api.giygas.dev/medicament/sme`
          );

          console.log("Success", response.data);
        } catch (error) {
          console.log(error);
        }
      }
    };
    getMedsData();
    getRecipientData();
  }, []);

  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      medical_info: JSON.stringify(medicalInfo),
    }));
  }, [medicalInfo]);

  console.log(recipient);
  console.log(formData);
  console.log(medicalInfo.allergies.length);

  return (
    <div id="recipient">
      {Object.keys(recipient).includes("first_name") ? (
        <div className="recipient-container">
          <h2>
            {recipient.first_name} {recipient.last_name} -{" "}
            <span className="age text-secondary">{getAge()} ans</span>
          </h2>

          <div className="recipient-left-tab">
            <ul>
              <li id="general" className={activeTab === "general" ? "active" : ""} onClick={(e) => handleTab(e)}>
                Information génerales
              </li>
              <li id="treatments" className={activeTab === "treatments" ? "active" : ""} onClick={(e) => handleTab(e)}>
                Traitements
              </li>
              <li id="specialists" className={activeTab === "specialists" ? "active" : ""} onClick={(e) => handleTab(e)}>
                Spécialiste
              </li>
            </ul>
          </div>

          {renderActiveTab()}
        </div>
      ) : (
        "loading"
      )}
    </div>
  );
}
