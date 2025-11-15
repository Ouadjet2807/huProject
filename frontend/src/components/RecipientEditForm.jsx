import React, { useState } from "react";
import Button from "react-bootstrap/esm/Button";
import { FaRegTrashCan } from "react-icons/fa6";
import { CiEdit } from "react-icons/ci";
import { MdCancelPresentation } from "react-icons/md";

export default function RecipientEditForm({
  data,
  medicalInfo,
  setMedicalInfo,
}) {
  const [editionMode, setEditionMode] = useState(false);
  const [allergieFieldCount, setAllergieFieldCount] = useState(1);

  const genderChoices = [
    { name: "Femme", value: "F" },
    { name: "Homme", value: "M" },
    { name: "Neutre", value: "N" },
  ];

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

  return (
    <div id="generalSection">
      <h3>Informations générales</h3>
      <form action="">
        <div className="form-row">
          <label htmlFor="first_name">Prénom</label>
          <label htmlFor="last_name">Nom</label>
          <input
            type="text"
            name="first_name"
            id=""
            value={data.first_name}
            disabled={!editionMode}
          />
          <input
            type="text"
            name="last_name"
            id=""
            value={data.last_name}
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
            value={data.birth_date}
            disabled={!editionMode}
          />
          <select name="gender" id="" disabled={!editionMode}>
            {genderChoices.map((item) => {
              return (
                <option
                  value={item.value}
                  selected={data.gender === item.value}
                >
                  {item.name}
                </option>
              );
            })}
          </select>
        </div>
        <Button
          variant="primary"
          className="edit-sensible-info"
          onClick={() => setEditionMode(!editionMode)}
        >
          {!editionMode ? (
            <>
              Modifier les informations ci-dessus <CiEdit />
            </>
          ) : (
            <>Annuler</>
          )}
        </Button>
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
          <textarea
            name="notes"
            id=""
            placeholder="Notez ici vos éventuels commentaires"
            cols={3}
            rows={5}
          ></textarea>
        </div>
      </form>
    </div>
  );
}
