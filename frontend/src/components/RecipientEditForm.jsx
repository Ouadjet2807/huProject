import React, { useEffect, useState } from "react";
import Button from "react-bootstrap/esm/Button";
import { FaRegTrashCan } from "react-icons/fa6";
import { CiEdit } from "react-icons/ci";
import { MdCancelPresentation } from "react-icons/md";
import { LuSave } from "react-icons/lu";
import Loader from "./Loader";
export default function RecipientEditForm({
  data,
  medicalInfo,
  setMedicalInfo,
}) {
  const [editionMode, setEditionMode] = useState(false);
  const [loading, setLoading] = useState(true)
  const [formData, setFormData] = useState({})

  const genderChoices = [
    { name: "Femme", value: "F" },
    { name: "Homme", value: "M" },
    { name: "Neutre", value: "N" },
  ];


  const handleChange = (e) => {

    if (!editionMode) return

    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

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

  console.log(formData);

  useEffect(() => {
    if (Object.keys(data).length < 0) return

    setFormData(data)

    setLoading(false)
  }, [data])

  return (
    <div id="generalSection">
      <h3>Informations générales</h3>
      {!loading ?
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
            onChange={(e) => handleChange(e)}
            />
          <input
            type="text"
            name="last_name"
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
            id=""
            value={formData.birth_date}
            disabled={!editionMode}
            onChange={(e) => handleChange(e)}
            />
          <select name="gender" id="" disabled={!editionMode} onChange={(e) => handleChange(e)}>
            {genderChoices.map((item) => {
              return (
                <option
                value={item.value}
                selected={formData.gender === item.value}
                >
                  {item.name}
                </option>
              );
            })}
          </select>
        </div>
        <Button
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
                  variant="outline-green"
                  onClick={(e) => handleAllergiesField(e, index)}
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

      : 

      <Loader />
    }
      <Button variant="aqua"><LuSave /> Sauvegarder</Button>
    </div>
  );
}
