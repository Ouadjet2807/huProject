import React, { useState, useEffect } from "react";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import axios from "axios";
import { IoIosSearch } from "react-icons/io";

export default function SearchTreatmentsModal({ show, setShow, setSelectedMedication }) {
  const [inputValue, setInputValue] = useState("");
  const [debouncedValue, setDebouncedValue] = useState("");
  const [searchResults, setSearchResults] = useState([]);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      setDebouncedValue(inputValue);
    }, 800);

    return () => clearTimeout(delayDebounceFn);
  }, [inputValue]);

  useEffect(() => {
    const getMedsData = async () => {
        if(debouncedValue !== "") {

            try {
                const response = await axios.get(
                    `https://medicaments-api.giygas.dev/medicament/${debouncedValue}`
                );
                
                console.log("Success", response.data);
                console.log(response.headers);
                setSearchResults(response.data);
            } catch (error) {
                console.log(error);
            }
        }
    };
    getMedsData();
  }, [debouncedValue]);

  const handleClose = () => {
    setShow(false);
  };

  console.log(searchResults);

  return (
    <Modal show={show} onHide={handleClose} id="searchTreatmentModal">
      <Modal.Header closeButton>
        <Modal.Title>Ajouter un traitement</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div className="search-bar">

        <input
          type="text"
          name="search_treatment"
          id=""
          placeholder="Rechercher un traitement"
          onChange={(e) => setInputValue(e.target.value)}
          />
          <div className="icon">
          <IoIosSearch/>
          </div>
        </div>
        <div className="search-results">
          {(searchResults && searchResults.length > 0) ? (
            searchResults.filter(result => result.etatComercialisation !== "Non commercialisée").map((med) => {
              return (
                <div className="medication" onClick={() => setSelectedMedication(med)}>{med.elementPharmaceutique}</div>
              );
            })
          ) : (
            <>{debouncedValue !== "" && <p>Aucun résultat</p>}</>
          )}
        </div>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose}>
          Annuler
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
