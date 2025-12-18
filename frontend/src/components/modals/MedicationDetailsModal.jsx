import React, { useEffect, useRef, useState } from "react";
import Button from "react-bootstrap/esm/Button";
import Modal from "react-bootstrap/Modal";
import api from "../../api/api";
import { useContext } from "react";
import { AuthContext } from "../../context/AuthContext";
import { BsFillSunriseFill } from "react-icons/bs";
import { BsFillSunsetFill } from "react-icons/bs";
import { BsSunFill } from "react-icons/bs";
import moment from "moment";
import "moment/locale/fr";

export default function MedicationDetailsModal({
  show,
  setShow,
  medication,
  setMedication,
  showAddTreatmentModal,
}) {
  moment.locale("fr");

  const { space } = useContext(AuthContext);

  const [dayTime, setDayTime] = useState([]);
  const [presentation, setPresentation] = useState([]);
  const [freeTake, setFreeTake] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    dosage: "",
    medication_format: "",
    number_of_boxes: 1,
    quantity_per_box: {
      unit_type: "",
      unit_number: 1,
      units_form: "",
      units_per_unit: 1,
    },
    end_date: null,
    start_date: moment(new Date()).toISOString().split("T")[0],
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
    setPresentation([]);
    setMedication({});
    setFormData({
      name: "",
      dosage: "",
      medication_format: "",
      number_of_boxes: 1,
      quantity_per_box: {
        unit_type: "",
        unit_number: 1,
        units_form: "",
        units_per_unit: 1,
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

    console.log(s);

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
      "ra©cipient",
      "ra©cipients",
      "rÃ©cipient",
      "rÃ©cipients",
      "tube",
      "tubes",
      "patch",
      "patchs",
      "gélule",
      "gÃ©lule",
      "gÃ©lules",
      "gélules",
      "gelule",
      "gelules",
      "comprime",
      "comprimes",
      "comprimÃ©",
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
    console.log(str);

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
      .replace(/(a©|A©|Ã©|ã©)/g, "é")
      .replace(/(a»|A»|Ã»|ã»)/g, "û")
      .replace(/(a¨|A¨|Ã¨|ã¨)/g, "è")
      .replace(/\p{Diacritic}/gu, "");

    console.log(s);
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
      /([0-9]+)\s*(fut|fût|fûts|futs|plaquette|flacon|flacon en verre de|flacons en verre de|tube|sachet|recipient|récipient|ra©cipient|ra©cipients|rÃ©cipient|rÃ©cipients|blister|boite|boîte|cartouche)/g
    )) {
      push("pack", m, { n: parseInt(m[1], 10), type: m[2] }, m.index);
    }
    // countable units (pills, patches)
    for (const m of s.matchAll(
      /([0-9]+(?:\.[0-9]+)?)\s*(comprime|comprima©|comprima©s|comprimÃ©|comprimÃ©s|comprimes|comprimés|comprimé|gélule|gélules|gelule|gelules|patch|patchs|pastille|pastilles|pansement|pansements|suppositoire|suppositoires|bande|bandes?|ml|l|g|mg|μg)/g
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
    // let matches = getMatches(str);

    setFormData((prev) => ({
      ...prev,
      quantity_per_box: {
        unit_type: str.unit_type,
        unit_number: str.unit_number,
        units_form: str.units_form,
        units_per_unit: str.units_per_unit,
      },
    }));
  };

  const getEstimatedEndDate = (
    numberOfBoxes,
    quantity,
    frequency,
    startDateISO
  ) => {
    if (
      freeTake ||
      !numberOfBoxes ||
      !quantity ||
      !frequency ||
      !startDateISO
    ) {
      return null;
    }

    const quantityReg = /(ml|l|g|mg|μg)$/i;

    const startDate = moment(new Date(startDateISO));
    if (!startDate) return null;

    const boxes = Number(numberOfBoxes) || 1;

    const pillsPerIntake = Number(frequency.intake_number) || 1;

    let pillsPerBox = 0;

    if (quantityReg.test(quantity.units_form)) {
      pillsPerBox = Number(quantity.unit_number);
    } else pillsPerBox = Number(quantity.units_per_unit);
    const totalPills = pillsPerBox * boxes;
    if (totalPills <= 0 || pillsPerIntake <= 0) return null;

    let totalIntakes = totalPills / pillsPerIntake;

    if (totalIntakes <= 0) return null;

    const freq = frequency.intake_frequency;

    const end = moment(startDate).add(totalIntakes, `${freq}s`);

    return end;
  };

  const handleSubmit = async () => {
    let formattedStartDate = formData.start_date.split("T")[0];
    let formattedEndDate = formData.end_date
      ? formData.end_date.toISOString().split("T")[0]
      : null;

    formData.quantity_per_box.number_of_boxes = parseInt(
      formData.number_of_boxes
    );

    try {
      let data = {
        name: formData.name,
        dosage: formData.dosage,
        medication_format: formData.medication_format,
        notes: "",
        space: formData.space,
        quantity: formData.quantity_per_box,
        frequency: formData.frequency,
        start_date: formattedStartDate,
        end_date: formattedEndDate,
      };
      console.log(data);

      await api.post("http://127.0.0.1:8000/api/treatments/", data);
      console.log("Success");
      handleClose();
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

    if (Object.keys(medication).includes("presentation")) {
      medication.presentation.forEach((item) => {
        const libelle = getMatches(item.libelle);
        let current_presentation = {};
        if (libelle.length > 0) {
          libelle.forEach((elem) => {
            switch (elem.type) {
              case "pack":
                current_presentation.unit_type = elem.value.type;
                current_presentation.unit_number = elem.value.n;
              case "countUnit":
                current_presentation.units_form = elem.value.form;
                current_presentation.units_per_unit = elem.value.n;
            }
          });
        }
        if (
          !presentation.find(
            (e) => JSON.stringify(e) === JSON.stringify(current_presentation)
          )
        )
          setPresentation((prev) => [...prev, current_presentation]);
      });
    }
  }, [medication, space]);

  useEffect(() => {
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
      formData.number_of_boxes,
      formData.quantity_per_box,
      formData.frequency,
      formData.start_date
    );

    setFormData((prev) => ({ ...prev, end_date: end_date }));
  }, [
    formData.quantity_per_box,
    formData.start_date,
    formData.frequency,
    formData.number_of_boxes,
  ]);

  useEffect(() => {
    while (dayTime.length > formData.frequency.intake_number) {
      dayTime.pop();
    }
    console.log(dayTime);
  }, [formData.frequency.intake_number]);

  console.log(medication);
  console.log(presentation);
  console.log(formData);

  return (
    medication && (
      <Modal show={show} onHide={handleClose} id="medicationDetailsModal">
        <Modal.Header closeButton>
          <Modal.Title>{medication.elementPharmaceutique}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <form action="">
            <div className="posology">
              <label htmlFor="">Posologie :</label>
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
              <label htmlFor="">Contenance :</label>
              <div className="box-choices">
                {presentation.length > 0 &&
                  presentation.map((item) => {
                    return (
                      <div
                        className={`${
                          JSON.stringify(formData.quantity_per_box) ===
                          JSON.stringify(item)
                            ? "selected"
                            : ""
                        } size`}
                      >
                        <input
                          type="radio"
                          name="size"
                          onChange={() => handleQuantity(item)}
                        />
                        {item.units_form.match(/(ml|l|g|mg|μg)$/i) ? (
                          <>
                            <small className="units-form">
                              {item.unit_number} {item.unit_type}
                            </small>
                            <span className="units-per-unit">
                              de {item.units_per_unit}
                              {item.units_form}
                            </span>
                          </>
                        ) : (
                          <>
                            <span className="units-per-unit">
                              {item.units_per_unit}
                            </span>
                            <small className="units-form">
                              {item.units_form}
                              {item.units_per_unit > 1 && "(s)"}
                            </small>
                          </>
                        )}
                      </div>
                    );
                  })}
              </div>
              <div className="field">
                <input
                  type="number"
                  name="number_of_boxes"
                  id=""
                  min={1}
                  value={formData.number_of_boxes}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      number_of_boxes: e.target.value,
                    }))
                  }
                />
                <span>nombre de boîte prescrites</span>
              </div>
            </div>
            <div className="field start-date">
              <label htmlFor="start_date">Début du traitement :</label>
              <input
                type="date"
                name="start_date"
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    start_date: e.target.value,
                  }))
                }
                id=""
                value={formData.start_date}
              />
            </div>
          </form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="primary" onClick={handleSubmit}>
            Ajouter
          </Button>
          <Button variant="outline-secondary" onClick={handleClose}>
            Retour
          </Button>
        </Modal.Footer>
      </Modal>
    )
  );
}
