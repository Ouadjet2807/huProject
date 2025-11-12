import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../api/api";
import Button from "react-bootstrap/esm/Button";
import { FaRegTrashCan } from "react-icons/fa6";
import { CiEdit } from "react-icons/ci";
import { MdCancelPresentation } from "react-icons/md";

export default function Recipient() {
  const [recipient, setRecipient] = useState({});

  const [editionMode, setEditionMode] = useState(false);
  const [allergieFieldCount, setAllergieFieldCount] = useState(1);
  const [medicalInfo, setMedicalInfo] = useState({
    allergies: [""],
    notes: "",
  });

  const genderChoices = [
    {name: 'Femme', value: 'F'},
    {name: 'Homme', value: 'M'},
    {name: 'Neutre', value: 'N'},
  ]

  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    birth_date: "",
    gender: "",
    medical_info: "",
    space_id: "",
  });

  const today = new Date();

  const params = useParams();

  const recipient_id = params.id;

  console.log(params);

  const getAge = () => {
    if (Object.keys(recipient).includes("birth_date")) {
      const birth_date = new Date(recipient.birth_date);

      console.log(birth_date);

      const age = today.getFullYear() - birth_date.getFullYear();

      return age;
    }
  };

  const handleAllergiesField = (e, index) => {
    e.stopPropagation();
    console.log(e.target);

    console.log(e.target.name);

    if (e.target.name === "delete_field") {
      let filter = medicalInfo.allergies.toSpliced(index, 1);
      console.log(filter);

      setMedicalInfo((prev) => ({
        ...prev,
        allergies: filter,
      }));
    } else if (e.target.name === "add_field") {
      setMedicalInfo((prev) => ({
        ...prev,
        allergies: [...prev.allergies, ""],
      }));
    }
  };

  const handleMedicalInfo = (e, index) => {
    console.log(e.target.name);
    console.log(index);

    if (e.target.name === "allergies") {
      let allergiesArr = medicalInfo.allergies.toSpliced(
        index,
        1,
        e.target.value
      );
      console.log(allergiesArr);

      setMedicalInfo((prev) => ({
        ...prev,
        allergies: allergiesArr,
      }));
    }
  };

  useEffect(() => {
    const getRecipientData = async () => {
      const token = localStorage.getItem("accessToken");
      if (token) {
        const config = {
          headers: `Bearer ${token}`,
        };
        try {
          const response = await api.get(
            `http://127.0.0.1:8000/api/recipients/${recipient_id}`
          );
          setRecipient(response.data);
          setFormData({
            first_name: response.data.first_name,
            last_name: response.data.last_name,
            birth_date: response.data.birth_date,
            gender: response.data.gender,
            medical_info: response.data.medical_info,
            space_id: response.data.space_id,
          });
          console.log("Success", response.data);
        } catch (error) {
          console.log(error);
        }
      }
    };
    getRecipientData();
  }, []);

  useEffect(() => {
    setFormData(prev => ({
        ...prev,
        medical_info: JSON.stringify(medicalInfo)
    }))

  }, [medicalInfo])

  console.log(recipient);
  console.log(formData);
  console.log(medicalInfo.allergies.length);

  return (
    <div id="recipient">
      {Object.keys(recipient).includes("first_name") ? (
        <div className="recipient-container">
          <h2>
            {recipient.first_name} {recipient.last_name} - <span className="age text-secondary">{getAge()} ans</span>
          </h2>

          <form action="">
            <div className="form-row">
              <label htmlFor="first_name">Prénom</label>
              <label htmlFor="last_name">Nom</label>
              <input
                type="text"
                name="first_name"
                id=""
                value={formData.first_name}
                disabled={!editionMode}
              />
              <input
                type="text"
                name="last_name"
                id=""
                value={formData.last_name}
                disabled={!editionMode}
              />
            </div>
            <div className="form-row">
              <label htmlFor="birth_date">Date de naissance</label>
              <label htmlFor="gender">Genre</label>
              <input
                type="date"
                name="birth_date"
                id=""
                value={formData.birth_date}
                disabled={!editionMode}
              />
              <select name="gender" id="" disabled={!editionMode}>
               {genderChoices.map(item => {
                return <option value={item.value} selected={formData.gender === item.value}>{item.name}</option>
               })}
              </select>
            </div>
            <Button variant="primary" className="edit-sensible-info" onClick={() => setEditionMode(!editionMode)}>{!editionMode ? <>Modifier les informations ci-dessus <CiEdit /></> : <>Annuler</>}</Button>
            <div className="field">
              <label htmlFor="birth_date">Allergies</label>
              {medicalInfo.allergies.map((item, index) => {
                return (
                  <div className="deletable_field">
                    <input
                      type="text"
                      name="allergies"
                      id=""
                      value={medicalInfo.allergies[index]}
                      onChange={(e) => handleMedicalInfo(e, index)}
                    />
                    <Button
                      type="button"
                      name="delete_field"
                      className="delete"
                      variant="outline-primary"
                      onClick={(e) => handleAllergiesField(e, index)}
                      disabled={medicalInfo.allergies.length < 2}
                    >
                      <FaRegTrashCan />
                    </Button>
                  </div>
                );
              })}
              <Button
                variant="primary"
                name="add_field"
                onClick={(e) => handleAllergiesField(e)}
              >
                Ajouter une allergie
              </Button>
            </div>
            <div className="field">
                <label htmlFor="notes">Notes</label>
                <textarea name="notes" id="" placeholder="Notez ici vos éventuels commentaires" cols={3} rows={5}></textarea>
            </div>
          </form>
        </div>
      ) : (
        "loading"
      )}
    </div>
  );
}
