import React from "react";
import Button from "react-bootstrap/esm/Button";
import Modal from "react-bootstrap/Modal";
import api from "../../api/api";
import { useContext } from "react";
import { AuthContext } from "../../context/AuthContext";

export default function MedicationDetailsModal({
  show,
  setShow,
  medication,
  showAddTreatmentModal,
}) {
  const { space } = useContext(AuthContext);
  const handleClose = () => {
    setShow(false);
    showAddTreatmentModal(true);
  };


  const addTreatment = async (item) => {

    const label = item.libelle

    const numberOfPills = label.match(/\d+/g)

    const medicationData = {
      name: medication.elementPharmaceutique,
      dosage: medication.composition[0].dosage,
      medication_format: medication.composition[0].elementPharmaceutique,
      number_of_pills: parseInt(numberOfPills[0]),
      frequency: "",
      notes: "",
      space: space.id,
    };

    console.log(medicationData);
    

    try {
      const post = await api.post(
        "http://127.0.0.1:8000/api/treatments/",
        medicationData
      );
      console.log("Success");
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <Modal show={show} onHide={handleClose}>
      <Modal.Header closeButton>
        <Modal.Title>{medication.elementPharmaceutique}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <ul>
          {(Object.keys(medication).length > 0 && medication.presentation.length > 0) ?
            medication.presentation.map((item) => {
              return (
                <li>
                  {item.libelle}
                  <Button onClick={() => addTreatment(item)}>Ajouter</Button>
                </li>
              );
            })
            : (Object.keys(medication).length > 0  && medication.composition.length > 0) &&
            medication.composition.map((item) => {
              return (
                <li> 
                  {item.elementPharmaceutique}
                  <Button onClick={() => addTreatment(item)}>Ajouter</Button>
                </li>
              );
            })
        }
        </ul>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose}>
          Retour
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
