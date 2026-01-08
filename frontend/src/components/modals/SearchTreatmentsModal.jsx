import React, { useState, useEffect } from "react";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import axios from "axios";
import { IoIosSearch } from "react-icons/io";

export default function SearchTreatmentsModal({
  show,
  setShow,
  setSelectedMedication,
}) {
  const [inputValue, setInputValue] = useState("");
  const [debouncedValue, setDebouncedValue] = useState("");
  const [searchResults, setSearchResults] = useState([]);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      setDebouncedValue(inputValue);
    }, 800);

    return () => clearTimeout(delayDebounceFn);
  }, [inputValue]);

  const displayMedName = (med) => {
    console.log(debouncedValue.length);
    const regex = new RegExp(debouncedValue, "i");
    console.log(regex);
    let index = med.search(regex);
    let endIndex = index + debouncedValue.length;

    let substrings = [];
    if (index > 0) {
      substrings.push(
        med.substring(0, index),
        med.substring(index, endIndex),
        med.substring(endIndex, med.length)
      );
    } else {
      substrings.push(
        med.substring(0, endIndex),
        med.substring(endIndex, med.length)
      );
    }

    return (
      <>
        {substrings.map((sub, index) => {
          return (substrings.length > 2 && index == 1) ||
            (substrings.length == 2 && index == 0) ? (
            <span className="search-value">{sub}</span>
          ) : (

              sub.replace(" ", "").length < 80 ? (
                <span>{sub}</span>
              ) : (
                <span>{sub.slice(0, 80).padEnd(83, "...")}</span>
              )
      
          );
        })}
      </>
    );
  };

  useEffect(() => {
    const getMedsData = async () => {
      if (debouncedValue !== "") {
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
    setDebouncedValue("");
    setSearchResults([]);
    setShow(false);
  };

  console.log(searchResults);

  return (
    <Modal size="lg" show={show} onHide={handleClose} id="searchTreatmentModal">
      <Modal.Header closeButton>
        <Modal.Title>Ajouter un traitement</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div className="search-container">
          <div className="search-bar">
            <input
              type="text"
              name="search_treatment"
              id=""
              defaultValue={debouncedValue}
              placeholder="Rechercher un traitement"
              onChange={(e) => setInputValue(e.target.value)}
            />
            <div className="icon">
              <IoIosSearch />
            </div>
          </div>
          <ul className="search-results">
            {searchResults && searchResults.length > 0 ? (
              searchResults
                .filter(
                  (result) =>
                    result.etatComercialisation !== "Non commercialisée"
                )
                .map((med) => {
                  return (
                    <li
                      className="medication"
                      onClick={() => setSelectedMedication(med)}
                    >
                     <IoIosSearch /> <p>{displayMedName(med.elementPharmaceutique)}</p>
                    </li>
                  );
                })
            ) : (
              <>
                {debouncedValue !== "" && (
                  <p className="no-result" style={{ margin: "1vw" }}>Aucun résultat</p>
                )}
              </>
            )}
          </ul>
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
