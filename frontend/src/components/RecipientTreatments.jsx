import React, { use, useEffect, useState } from "react";
import Button from "react-bootstrap/esm/Button";
import ProgressBar from "react-bootstrap/ProgressBar";
import SearchTreatmentsModal from "./modals/SearchTreatmentsModal";
import MedicationDetailsModal from "./modals/MedicationDetailsModal";
import api from "../api/api";
import Card from "react-bootstrap/Card";

export default function RecipientTreatments({ formData, space }) {
  const [addTreatment, setAddTreatment] = useState();
  const [showAddTreatment, setShowAddTreatement] = useState(false);
  const [showMedicationDetails, setShowMedicationDetails] = useState(false);
  const [selectedMedication, setSelectedMedication] = useState({});
  const [unitName, setUnitName] = useState("");
  const [treatments, setTreatments] = useState([]);

  console.log(selectedMedication);

  const getTreatments = async () => {
    try {
      const response = await api.get("http://127.0.0.1:8000/api/treatments");
      console.log("Success", response.data);
      setTreatments(response.data);
    } catch (error) {
      console.log(error);
    }
  };

  const checkTodaysIntake = (intake_number, intake_time_range, today) => {
    let todaysIntakeCount = 0;

    for (let i = 0; i < intake_number; i++) {
      if (intake_time_range[i] === "evening" && today.getHours() > 17) {
        todaysIntakeCount++;
      } else if (intake_time_range[i] === "midday" && today.getHours() > 11) {
        todaysIntakeCount++;
      } else if (intake_time_range[i] === "morning" && today.getHours() > 5) {
        todaysIntakeCount++;
      } else if (!intake_time_range.length > 0) {
        todaysIntakeCount = intake_number;
      }
    }

    return todaysIntakeCount;
  };

  const getProgress = (item) => {
    if (!item.start_date || !item.end_date) return;

    let start = new Date(item.start_date);
    let end = new Date(item.end_date);

    const today = new Date();

    if (start > today) return 100;

    const initialTime = new Date().setTime(end - start);

    const currentTime = new Date().setTime(end - new Date().getTime());

    const result = (currentTime / initialTime) * 100;
    return result;
  };

  const getRemainingUnits = (item) => {
    if (item.frequency == "" || !item.end_date) return;

    const today = new Date();

    const DAY_IN_MILLISECONDS = 86400000;

    const intake_time_range =
      !item.frequency.intake_time_range ||
      item.frequency.intake_time_range.length < 0
        ? null
        : item.frequency.intake_time_range;
    const intake_number = item.frequency.intake_number;

    const start_date = new Date(item.start_date);
    const end_date = new Date(item.end_date);
    const time = new Date().setTime(
      end_date - (new Date().getTime() - DAY_IN_MILLISECONDS)
    );

    let totalUnits = 0;

    let reg = /(ml|l|g|mg|μg)$/i;

    console.log(reg.test(item.quantity.units_form));

    if (reg.test(item.quantity.units_form)) {
      totalUnits = item.quantity.unit_number * item.quantity.number_of_boxes;
    } else {
      totalUnits = item.quantity.units_per_unit * item.quantity.number_of_boxes;
    }

    if (start_date > today) return totalUnits;

    let todaysIntakeCount = checkTodaysIntake(
      intake_number,
      intake_time_range,
      today
    );
    console.log(todaysIntakeCount);

    let frequency = item.frequency.intake_frequency;

    console.log(todaysIntakeCount);

    let remaining_time = 0;
    let remaining_days = Math.ceil(
      time / DAY_IN_MILLISECONDS - todaysIntakeCount
    );

    if (frequency === "day") {
      remaining_time = remaining_days;
    } else if (frequency === "week") {
      remaining_time = remaining_days / 7;
    } else {
      remaining_time = remaining_days / 30;
    }

    console.log(remaining_time);

    console.log(todaysIntakeCount);

    return Math.ceil(remaining_time);
  };

  useEffect(() => {
    if (Object.keys(selectedMedication).length > 0) {
      setShowAddTreatement(false);
      setShowMedicationDetails(true);
    }
  }, [selectedMedication]);

  useEffect(() => {
    if (showMedicationDetails) {
      setShowAddTreatement(false);
    }
  }, [showMedicationDetails]);

  useEffect(() => {
    getTreatments();
  }, []);

  console.log(treatments);

  return (
    <div id="recipientTreatments">
      <SearchTreatmentsModal
        setShow={setShowAddTreatement}
        show={showAddTreatment}
        setSelectedMedication={setSelectedMedication}
      />
      <MedicationDetailsModal
        setShow={setShowMedicationDetails}
        showAddTreatmentModal={setShowAddTreatement}
        show={showMedicationDetails}
        medication={selectedMedication}
      />
      <h3>Traitements médicaux</h3>
      <div className="treatments-list">
        {treatments.length > 0 ? (
          treatments.map((item) => {
            return (
              <Card className="treatment">
                <Card.Header>{item.name}</Card.Header>
                <Card.Body>
                  <span>
                    {item.quantity.units_per_unit} {item.medication_format} -{" "}
                    {item.frequency.intake_number} par
                    {item.frequency.intake_frequency === "day"
                      ? " jour"
                      : item.frequency.intake_frequency === "week"
                      ? " semaine"
                      : item.frequency.intake_frequency === "month" && " mois"}
                  </span>
                  <span>
                    traitement commencé le :{" "}
                    {new Date(item.start_date).toLocaleDateString()}
                  </span>
                  <span>
                    {getRemainingUnits(item)} {item.medication_format}(s)
                    restant(s)
                    {item.end_date && <ProgressBar now={getProgress(item)} />}
                  </span>
                </Card.Body>
              </Card>
            );
          })
        ) : (
          <p>Aucun traitement enregistré</p>
        )}
      </div>
      <Button
        className="add-treatment-btn"
        onClick={() => setShowAddTreatement(true)}
      >
        Ajouter un traitement
      </Button>
    </div>
  );
}
