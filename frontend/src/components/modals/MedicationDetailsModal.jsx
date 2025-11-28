import React, { useEffect, useRef, useState } from "react";
import Button from "react-bootstrap/esm/Button";
import Modal from "react-bootstrap/Modal";
import api from "../../api/api";
import { useContext } from "react";
import { AuthContext } from "../../context/AuthContext";
import { BsFillSunriseFill } from "react-icons/bs";
import { BsFillSunsetFill } from "react-icons/bs";
import { BsSunFill } from "react-icons/bs";

export default function MedicationDetailsModal({
  show,
  setShow,
  medication,
  showAddTreatmentModal,
}) {
  const { space } = useContext(AuthContext);

  const [dayTime, setDayTime] = useState([]);
  const [freeTake, setFreeTake] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    dosage: "",
    medication_format: "",
    quantity: {
      number_of_boxes: 1,
      unit_number: 1,
      unit_type: "",
      units_per_unit: 1,
      units_form: "",
    },
    end_date: null,
    start_date: new Date().toISOString().split("T")[0],
    frequency: {
      intake_time_range: [""],
      intake_frequency: "day",
      intake_number: 1,
    },
    notes: "",
    space: "",
  });

  const handleClose = () => {
    setShow(false);
    showAddTreatmentModal(true);
    setFreeTake(false);
  };

  const handleDayTime = (e) => {
    if (
      dayTime.length <= formData.frequency.intake_number &&
      !dayTime.includes(e.target.value)
    ) {
      setDayTime((prev) => [...prev, e.target.value]);
    } else if (dayTime.length <= formData.frequency.intake_number) {
      let remove = dayTime.filter((time) => time !== e.target.value);
      setDayTime(remove);
    } else {
      console.log("Intake numer is inferior to time of the day");
    }
  };

  const addImplicitOneIfNeeded = (s) => {
    let normalized = s.trim().toLowerCase();

    const unitTypes = [
      "plaquette",
      "plaquettes",
      "cartouche",
      "cartouches",
      "boite",
      "boites",
      "boîte",
      "boîtes",
      "flacon",
      "flacons",
      "ampoule",
      "ampoules",
      "sachet",
      "sachets",
      "récipient",
      "récipients",
      "tube",
      "tubes",
      "patch",
      "patchs",
      "gélule",
      "gélules",
      "gelule",
      "gelules",
      "comprime",
      "comprimes",
      "comprimé",
      "comprimés",
      "suppositoire",
      "suppositoires",
      "pansement",
      "pansements",
    ];

    const firstWord = normalized
      .split(/\s+/)[0]
      .replace(/\(s\)/g, "s")
      .normalize("NFD")
      .replace(/\p{Diacritic}/gu, "");

    if (/^\d/.test(firstWord)) {
      return s;
    }

    if (unitTypes.includes(firstWord)) {
      return "1 " + s;
    }

    return s;
  };

  const normalizeForRegexes = (str) => {
    // Clean str for addImplicitOneIfNeeded function
    let s = str
      .toLowerCase()
      .replace(/\u00A0/g, " ")
      .replace(/\s+/g, " ")
      .trim();

    // Check if unit number is present, if not add an implicit 1
    s = addImplicitOneIfNeeded(s);

    // Clean s again after unit number verification
    s = s
      .replace(/,/g, ".")
      .replace(/×/g, "x")
      .replace(/\(s\)/g, "s")
      .normalize("NFD")
      .replace(/\p{Diacritic}/gu, "");

    return s;
  };

  const getMatches = (str) => {
    let s = normalizeForRegexes(str);

    console.log(s);
    

    const matches = [];
    const push = (type, m, value, index = m.index) =>
      matches.push({ type, value, index, raw: m[0] });

    // multiplicative
    for (const m of s.matchAll(
      /([0-9]+(?:\.[0-9]+)?)\s*(?:x|\*)\s*([0-9]+(?:\.[0-9]+)?)/g
    )) {
      push("mult", m, { a: parseFloat(m[1]), b: parseFloat(m[2]) }, m.index);
    }
    // packaging
    for (const m of s.matchAll(
      /([0-9]+)\s*(plaquette|flacon|flacon en verre de|flacons en verre de|tube|sachet|récipient|blister|boite|boîte|cartouche)/g
    )) {
      push("pack", m, { n: parseInt(m[1], 10), type: m[2] }, m.index);
    }
    // countable units (pills, patches)
    for (const m of s.matchAll(
      /([0-9]+(?:\.[0-9]+)?)\s*(comprime|comprimes|gelule|gelules|patch|patchs|pastille|pastilles|pansement|pansements|bande|bandes?|ml|l|g|mg|μg)/g
    )) {
      push("countUnit", m, { n: parseFloat(m[1]), form: m[2] }, m.index);
    }
    // measures (ml, g, mg)
    for (const m of s.matchAll(
      /(?:de|d'|en)\s*([0-9]+(?:\.[0-9]+)?)\s*(ml|g|mg|l|µg|ug)/g
    )) {
      push("measure", m, { n: parseFloat(m[1]), unit: m[2] }, m.index);
    }
    // plain numbers fallback
    for (const m of s.matchAll(/([0-9]+(?:\.[0-9]+)?)/g)) {
      push("number", m, { n: parseFloat(m[1]) }, m.index);
    }

    return matches.sort((a, b) => a.index - b.index);
  };

  const handleQuantity = (str) => {
    let matches = getMatches(str);

    matches.forEach((match) => {
      setFormData((prev) => ({
        ...prev,
        quantity: {
          number_of_boxes: prev.quantity.number_of_boxes,
          unit_number:
            match.type === "pack" ? match.value.n : prev.quantity.unit_number,
          unit_type:
            match.type === "pack" ? match.value.type : prev.quantity.unit_type,
          units_per_unit:
            match.type === "countUnit"
              ? match.value.n
              : prev.quantity.units_per_unit,
          units_form:
            match.type === "countUnit"
              ? match.value.form
              : prev.quantity.units_form,
        },
      }));
    });
  };

  const getEstimatedEndDate = (quantity, frequency, startDateISO) => {
    if (freeTake || !quantity || !frequency || !startDateISO) {
      return null;
    }

    const quantityReg = /(ml|l|g|mg|μg)$/i

    const startDate = new Date(startDateISO);
    if (Number.isNaN(startDate.getTime())) return null;

    const boxes = Number(quantity.number_of_boxes) || 1;
    const pillsPerIntake = Number(frequency.intake_number) || 1;
    let pillsPerBox = 0;

    if(quantityReg.test(quantity.units_form)) {
      pillsPerBox = Number(quantity.unit_number)
    } else (
      pillsPerBox = Number(quantity.units_per_unit)
    )
    const totalPills = pillsPerBox * boxes;
    if (totalPills <= 0 || pillsPerIntake <= 0) return null;

    let totalIntakes = totalPills / pillsPerIntake;


    console.log(totalIntakes);
    

    if (totalIntakes <= 0) return null;

    const freq = frequency.intake_frequency;

    // Helper: days in month for a given date
    const daysInMonth = (d) =>
      new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();

    if (freq === "day") {      
      const end = new Date(startDate);
      end.setDate(end.getDate() + Math.ceil(totalIntakes) - 1);
      console.log(end);
      
      return end;
    }

    if (freq === "week") {
      const daysNeeded = Math.ceil(totalIntakes * 7);
      const end = new Date(startDate);
      end.setDate(end.getDate() + daysNeeded - 1);
      return end;
    }

    if (freq === "month") {

      let end = new Date(startDate);

      for(let i = 1; i < totalIntakes; i++) {
        
         if(end.getMonth() + 1 > 11) {
          end.setMonth(0)
          end.setFullYear(end.getFullYear() + 1)
         }
         end.setMonth(end.getMonth() + 1)
      }

      end = new Date(`${end.getFullYear()}/${end.getMonth()}/${end.getDate()}`);

      console.log(end);
      

      return end;
    }

    // fallback: treat as daily
    {
      const intakesPerDay = Number(frequency.intake_number) || 1;
      const daysNeeded = Math.ceil(totalIntakes / intakesPerDay);
      const end = new Date(startDate);
      end.setDate(end.getDate() + daysNeeded - 1);
      return end;
    }
  };

  const handleSubmit = async () => {
    let formattedStartDate = formData.start_date.split("T")[0];
    let formattedEndDate = formData.end_date
      ? formData.end_date.toISOString().split("T")[0]
      : null;

    try {
      let data = {
        name: formData.name,
        dosage: formData.dosage,
        medication_format: formData.medication_format,
        notes: "",
        space: formData.space,
        quantity: formData.quantity,
        frequency: formData.frequency,
        start_date: formattedStartDate,
        end_date: formattedEndDate,
      };

      const post = await api.post(
        "http://127.0.0.1:8000/api/treatments/",
        data
      );
      console.log("Success");
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    if (Object.keys(medication).length > 0) {
      setFormData((prev) => ({
        ...prev,
        name: medication && medication.elementPharmaceutique,
        dosage: medication && medication.composition[0].dosage,
        medication_format:
          medication && medication.composition[0].elementPharmaceutique,
        space: space && space.id,
      }));
    }
  }, [medication, space]);

  useEffect(() => {
    console.log("changin'");
    
    setFormData((prev) => ({
      ...prev,
      frequency: {
        intake_time_range: dayTime,
        intake_frequency: prev.frequency.intake_frequency,
        intake_number: prev.frequency.intake_number,
      },
    }));
  }, [dayTime, formData.frequency.intake_number]);

  useEffect(() => {
    const end_date = getEstimatedEndDate(
      formData.quantity,
      formData.frequency,
      formData.start_date
    );

    setFormData((prev) => ({ ...prev, end_date: end_date }));
  }, [formData.quantity, formData.start_date, formData.frequency]);

  useEffect(() => {
    while (dayTime.length > formData.frequency.intake_number) {
      dayTime.pop();
    }
    console.log(dayTime);
    
  }, [formData.frequency.intake_number]);

  console.log(formData);

  return (
    <Modal show={show} onHide={handleClose} id="medicationDetailsModal">
      <Modal.Header closeButton>
        <Modal.Title>{medication.elementPharmaceutique}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <form action="">
          <div className="posology">
            <label htmlFor="">Posologie</label>
            <div className="field" id="freeTake">
              <input
                type="checkbox"
                name=""
                id=""
                onChange={() => setFreeTake(!freeTake)}
              />
              <label htmlFor="">Prise libre si douleur</label>
            </div>
            <div className="fields">
              <input
                type="number"
                name="intake_number"
                id=""
                min={1}
                value={formData.frequency.intake_number}
                disabled={freeTake}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    frequency: {
                      intake_number: e.target.value,
                      intake_frequency: prev.frequency.intake_frequency,
                      intake_time_range: prev.frequency.dayTime,
                    },
                  }))
                }
              />
              <span>fois par</span>
              <select
                name="intake_frequency"
                id=""
                disabled={freeTake}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    frequency: {
                      intake_frequency: e.target.value,
                      intake_number: prev.frequency.intake_number,
                      intake_time_range: prev.frequency.dayTime,
                    },
                  }))
                }
              >
                <option value="day">Jour</option>
                <option value="week">Semaine</option>
                <option value="month">Mois</option>
              </select>
            </div>
            <label htmlFor="">Quand ?</label>
            <div className="fields">
              <div
                className={`dayTime field ${
                  dayTime.includes("morning")
                    ? "selected"
                    : dayTime.length == formData.frequency.intake_number &&
                      !dayTime.includes("morning")
                    ? "disabled"
                    : ""
                }`}
                id="morning"
              >
                <input
                  type="checkbox"
                  name="day_time"
                  value="morning"
                  disabled={
                    dayTime.length == formData.frequency.intake_number &&
                    !dayTime.includes("morning")
                  }
                  id=""
                  onChange={(e) => handleDayTime(e)}
                />
                <BsFillSunriseFill />
                <label htmlFor="">matin</label>
              </div>
              <div
                className={`dayTime field ${
                  dayTime.includes("midday")
                    ? "selected"
                    : dayTime.length == formData.frequency.intake_number &&
                      !dayTime.includes("midday")
                    ? "disabled"
                    : ""
                }`}
                id="midday"
              >
                <input
                  type="checkbox"
                  name="day_time"
                  value="midday"
                  disabled={
                    dayTime.length == formData.frequency.intake_number &&
                    !dayTime.includes("midday")
                  }
                  id=""
                  onChange={(e) => handleDayTime(e)}
                />
                <BsSunFill />
                <label htmlFor="">midi</label>
              </div>
              <div
                className={`dayTime field ${
                  dayTime.includes("evening")
                    ? "selected"
                    : dayTime.length == formData.frequency.intake_number &&
                      !dayTime.includes("evening")
                    ? "disabled"
                    : ""
                }`}
                id="evening"
              >
                <input
                  type="checkbox"
                  name="day_time"
                  value="evening"
                  disabled={
                    dayTime.length == formData.frequency.intake_number &&
                    !dayTime.includes("evening")
                  }
                  id=""
                  onChange={(e) => handleDayTime(e)}
                />
                <BsFillSunsetFill />
                <label htmlFor="">soir</label>
              </div>
            </div>
          </div>
          <div className="box-size">
            <label htmlFor="">Contenance</label>
            {Object.keys(medication).length > 0 &&
            medication.presentation.length > 0
              ? medication.presentation.map((item) => {
                  return (
                    <div className="size">
                      <input
                        type="radio"
                        name="size"
                        value={item.libelle}
                        onChange={() => handleQuantity(item.libelle)}
                      />
                      <label htmlFor="size">{item.libelle}</label>
                    </div>
                  );
                })
              : Object.keys(medication).length > 0 &&
                medication.composition.length > 0 &&
                medication.composition.map((item) => {
                  return (
                    <li>
                      {item.elementPharmaceutique}
                      <Button
                        onClick={() =>
                          setFormData((prev) => ({
                            ...prev,
                            quantity: {
                              pills_per_box: Number(item.match(/\d+/g)),
                              number_of_boxes: prev.quantity.number_of_boxes,
                            },
                          }))
                        }
                      >
                        Ajouter
                      </Button>
                    </li>
                  );
                })}
            <div className="field">
              <input
                type="number"
                name="number_of_boxes"
                id=""
                min={1}
                value={formData.quantity.number_of_boxes}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    quantity: {
                      pills_per_box: prev.quantity.pills_per_box,
                      number_of_boxes: e.target.value,
                    },
                  }))
                }
              />
              <span>nombre de boîte prescrites</span>
            </div>
          </div>
          <div className="field start-date">
            <label htmlFor="start_date">Début du traitement</label>
            <input
              type="date"
              name="start_date"
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, start_date: e.target.value }))
              }
              id=""
              value={formData.start_date}
            />
          </div>
        </form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="primary" onClick={handleSubmit}>
          Retour
        </Button>
        <Button variant="secondary" onClick={handleClose}>
          Retour
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
