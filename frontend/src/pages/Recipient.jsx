import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import api from "../api/api";
import RecipientEditForm from "../components/recipients/RecipientEditForm";
import RecipientTreatments from "../components/treatments/RecipientTreatments";
import Specialists from "../components/specialists/Specialists";
import Loader from "../components/Loader";
import moment from "moment";
import { locale } from "moment";
import { IoInformationCircleOutline } from "react-icons/io5";
import { FaMedkit } from "react-icons/fa";
import { FaUserMd } from "react-icons/fa";
import { useSelector } from "react-redux";


export default function Recipient({ tab, match}) {
  moment.locale("fr");
  const [recipient, setRecipient] = useState({});
  const space = useSelector((state) => state.space);
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

  const params = useParams();

  const navigate = useNavigate()

  const recipient_id = params.id;

  const handleTab = (e) => {
    if (e.target.id && e.target.id !== 'general') {
      navigate(`/recipient/${recipient.id}/${e.target.id}`);
    } else {
      navigate(`/recipient/${recipient.id}`)
    }
  };

  const getAge = () => {
    if (Object.keys(recipient).includes("birth_date")) {
      const birth_date = moment(recipient.birth_date);

      const today = moment();
      const age = today.diff(birth_date, "years");

      return age;
    }
  };

  const renderActiveTab = () => {
    switch (activeTab) {
      case "general":
        return (
          <RecipientEditForm
            data={formData}
            medicalInfo={medicalInfo}
            setMedicalInfo={setMedicalInfo}
          />
        );
      case "treatments":
        return (
          <RecipientTreatments
            formData={formData}
            setFormData={setFormData}
            recipient={recipient}
          />
        );

      case "specialists":
        return <Specialists recipient={recipient} />;
      default:
        return (
          <RecipientEditForm
            data={formData}
            medicalInfo={medicalInfo}
            setMedicalInfo={setMedicalInfo}
          />
        );
    }
  };

  useEffect(() => {
    const getRecipientData = async () => {

      let findRecipient = space.recipients.find(r => r.id == recipient_id)
      if(findRecipient) {
        setRecipient(space.recipients.find(r => r.id == recipient_id))
        return
      }

      const token = localStorage.getItem("accessToken");
      if (token) {
        try {
          const response = await api.get(
            `http://127.0.0.1:8000/api/recipients/${recipient_id}`
          );
          setRecipient(response.data);
        } catch (error) {
          console.log(error);
        }
      }
    };
    getRecipientData();
  }, []);

  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      medical_info: JSON.stringify(medicalInfo),
    }));
  }, [medicalInfo]);

useEffect(() => {
  if(recipient && Object.keys(recipient).length > 0) {
     setFormData({
            first_name: recipient.first_name,
            last_name: recipient.last_name,
            birth_date: recipient.birth_date,
            treatments: recipient.treatments,
            gender: recipient.gender,
            medical_info: recipient.medical_info,
            space: recipient.space,
          });
  }
}, [recipient])
  useEffect(() => {
    if(tab) setActiveTab(tab)

      else setActiveTab('general')
  }, [tab])

  console.log(window.location.pathname);
  console.log(space);
  console.log(formData);
  console.log("recip");
  

  return (
    <div id="recipient">
      {Object.keys(recipient).includes("first_name") ? (
        <div className="recipient-container">
          <div className="recipient-left-tab">
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <h2>
                {recipient.first_name} {recipient.last_name} -{" "}
              </h2>
              <span data-testid="recipientAge">{getAge()} ans</span>
            </div>
            <ul>
              <li
                  data-testid="generalTab"
                id="general"
                className={activeTab === "general" ? "active" : ""}
                onClick={(e) => handleTab(e)}
              >
                <IoInformationCircleOutline /> Information génerales
              </li>
              <li
                data-testid="treatmentsTab"
                id="treatments"
                className={activeTab === "treatments" ? "active" : ""}
                onClick={(e) => handleTab(e)}
              >
               <FaMedkit /> Traitements
              </li>
              <li
                  data-testid="specialistsTab"
                id="specialists"
                className={activeTab === "specialists" ? "active" : ""}
                onClick={(e) => handleTab(e)}
              >
                <FaUserMd /> Spécialiste
              </li>
            </ul>
          </div>

          {renderActiveTab()}
        </div>
      ) : (
        <Loader />
      )}
    </div>
  );
}
