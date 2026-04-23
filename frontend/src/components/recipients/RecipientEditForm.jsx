import React, { useEffect, useState } from "react";
import Button from "react-bootstrap/Button";
import { FaRegTrashCan } from "react-icons/fa6";
import { CiEdit } from "react-icons/ci";
import { MdCancelPresentation } from "react-icons/md";
import { LuSave } from "react-icons/lu";
import Loader from "../Loader";
export default function RecipientEditForm({
  data,
  medicalInfo,
  setMedicalInfo,
}) {
  const [editionMode, setEditionMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({});

  const genderChoices = [
    { name: "Femme", value: "F" },
    { name: "Homme", value: "M" },
    { name: "Neutre", value: "N" },
  ];

  const handleChange = (e) => {
    if (!editionMode) return;

    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const deleteAllergiesField = (e, index) => {
    e.stopPropagation();

    let filter = medicalInfo.allergies.toSpliced(index, 1);

    setMedicalInfo((prev) => ({
      ...prev,
      allergies: filter,
    }));
  };

  const addAllergiesField = (e, index) => {
    e.stopPropagation();

    setMedicalInfo((prev) => ({
      ...prev,
      allergies: [...prev.allergies, ""],
    }));
  };

  const handleMedicalInfo = (e, index) => {
    if (e.target.name === "allergies") {
      let allergiesArr = medicalInfo.allergies.toSpliced(
        index,
        1,
        e.target.value,
      );

      setMedicalInfo((prev) => ({
        ...prev,
        allergies: allergiesArr,
      }));
    }
  };

  useEffect(() => {
    if (Object.keys(data).length < 0) return;

    setFormData(data);

    setLoading(false);
  }, [data]);

  console.log("generalTab");

  return (
    <div id="generalSection" data-testid="generalSectionComponent">
      <h3>Informations générales</h3>
      {!loading ? (
        <form action="" role="form">
          <div className="form-row">
            <label htmlFor="first_name">Prénom</label>
            <label htmlFor="last_name">Nom</label>
            <input
              type="text"
              name="first_name"
              id=""
              role="firstNameInput"
              value={formData.first_name}
              disabled={!editionMode}
              onChange={(e) => handleChange(e)}
            />
            <input
              type="text"
              name="last_name"
              role="lastNameInput"
              id=""
              value={formData.last_name}
              disabled={!editionMode}
              onChange={(e) => handleChange(e)}
            />
          </div>
          <div className="form-row">
            <label htmlFor="birth_date">Date de naissance</label>
            <label htmlFor="gender">Genre</label>
            <input
              type="date"
              name="birth_date"
              role="birthDateInput"
              id=""
              value={formData.birth_date}
              disabled={!editionMode}
              onChange={(e) => handleChange(e)}
            />
            <select
              name="gender"
              id=""
              disabled={!editionMode}
              role="genderInput"
              value={formData.gender}
              onChange={(e) => handleChange(e)}
            >
              {genderChoices.map((item, index) => {
                return (
                  <option key={`option_${index + 1}`} value={item.value}>
                    {item.name}
                  </option>
                );
              })}
            </select>
          </div>
          <Button
            data-testid="editModeButton"
            variant="edit"
            className="edit-sensible-info"
            onClick={() => setEditionMode(!editionMode)}
          >
            {!editionMode ? (
              <>
                <CiEdit /> Modifier les informations ci-dessus
              </>
            ) : (
              <>Annuler</>
            )}
          </Button>
          <div className="field">
            <label htmlFor="allergies">Allergies</label>
            {Object.keys(medicalInfo).includes("allergies") &&
              medicalInfo.allergies.map((item, index) => {
                return (
                  <div
                    className="deletable_field"
                    data-testid={`field_${index + 1}`}
                    ey={`field_${index + 1}`}
                  >
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
                      data-testid={`deleteFieldButton_${index + 1}`}
                      className="delete"
                      variant="outline-green"
                      onClick={(e) => deleteAllergiesField(e, index)}
                      disabled={medicalInfo.allergies.length < 2}
                    >
                      <FaRegTrashCan />
                    </Button>
                  </div>
                );
              })}
            <Button
              variant="edit"
              name="add_field"
              data-testid="addFieldButton"
              onClick={(e) => addAllergiesField(e)}
            >
              Ajouter une allergie
            </Button>
          </div>
          <div className="field">
            <label htmlFor="notes">Notes</label>
            <textarea
              name="notes"
              id=""
              placeholder="Notez ici vos éventuels commentaires"
              cols={3}
              rows={5}
            ></textarea>
          </div>
        </form>
      ) : (
        <Loader />
      )}
      <Button variant="aqua">
        <LuSave /> Sauvegarder
      </Button>
    </div>
  );
}
