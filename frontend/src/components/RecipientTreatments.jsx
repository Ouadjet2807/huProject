import React, { use, useContext, useEffect, useState } from "react";
import Button from "react-bootstrap/esm/Button";
import ProgressBar from "react-bootstrap/ProgressBar";
import SearchTreatmentsModal from "./modals/SearchTreatmentsModal";
import MedicationDetailsModal from "./modals/MedicationDetailsModal";
import Loader from "./Loader";
import api from "../api/api";
import Card from "react-bootstrap/Card";
import Container from "react-bootstrap/Container";
import Col from "react-bootstrap/Col";
import Row from "react-bootstrap/Row";
import { GrPowerCycle } from "react-icons/gr";
import { CiMedicalClipboard } from "react-icons/ci";
import { PiPillDuotone } from "react-icons/pi";
import Badge from "react-bootstrap/Badge";
import ListGroup from "react-bootstrap/ListGroup";
import { LuLoader, LuSunrise } from "react-icons/lu";
import { LuSunset } from "react-icons/lu";
import { LuSun } from "react-icons/lu";
import { LuCalendarFold } from "react-icons/lu";
import { LuTrash2 } from "react-icons/lu";
import moment from "moment";
import "moment/locale/fr";
import { UseDimensionsContext } from "../context/UseDimensionsContext";


export default function RecipientTreatments({ formData, space }) {
  const [showAddTreatment, setShowAddTreatement] = useState(false);
  const [showMedicationDetails, setShowMedicationDetails] = useState(false);
  const [selectedMedication, setSelectedMedication] = useState({});
  const [treatments, setTreatments] = useState([]);

  const { width, height } = useContext(UseDimensionsContext)
  const [loading, setLoading] = useState(true);

  moment.locale("fr");

  const getTreatments = async () => {
    try {
      const response = await api.get("http://127.0.0.1:8000/api/treatments");
      console.log("Success", response.data);
      setTreatments(response.data);
      setLoading(false);
    } catch (error) {
      console.log(error);
    }
  };

  const checkTodaysIntake = (intake_number, intake_time_range, today) => {
    let todaysIntakeCount = 0;

    if (!intake_time_range) return intake_number;

    let intake_count = {
      morning: false,
      midday: false,
      evening: false,
    };

    switch (true) {
      case today.hours() > 17:
        intake_count.evening = true;
      case today.hours() > 11:
        intake_count.midday = true;
      case today.hours() > 5:
        intake_count.morning = true;
    }

    if (intake_time_range.length > 1) {
      for (let i = 0; i < intake_number; i++) {
        if (intake_count[intake_time_range[i]]) {
          todaysIntakeCount++;
        }
      }
    } else if (
      intake_count[intake_time_range[0]] ||
      intake_time_range.length == 0
    ) {
      todaysIntakeCount = intake_number;
    }

    return todaysIntakeCount;
  };

  const getProgress = (item) => {
    if (!item.start_date || !item.end_date) return;

    let start = moment(new Date(item.start_date));
    let end = moment(new Date(item.end_date));

    const today = moment(new Date());

    if (start > today) return 100;

    const initialTime = end.diff(start);

    const currentTime = new Date().setTime(end - moment());

    const result = (currentTime / initialTime) * 100;

    return result;
  };

  const getProgressColor = (item) => {
    let value = getProgress(item);

    switch (true) {
      case value >= 50:
        return "success";
      case value > 10 && value < 45:
        return "warning";
      case value <= 10:
        return "danger";
    }
  };

  const deleteTreatement = async (id) => {
    if (
      window.confirm("Êtes-vous sûr(e) de vouloir supprimer ce traitement ?")
    ) {
      try {
        await api.delete(`http://127.0.0.1:8000/api/treatments/${id}/`);
        console.log("success");

        let filter = treatments.filter((t) => t.id !== id);
        setTreatments(filter);
      } catch (error) {
        console.log(error);
      }
    }
  };

  const getRemainingUnits = (item) => {
    if (item.frequency == "" || !item.end_date) return;

    const today = moment(new Date());

    const intake_time_range =
      !item.frequency.intake_time_range ||
      item.frequency.intake_time_range.length < 0
        ? null
        : item.frequency.intake_time_range;
    const intake_number = item.frequency.intake_number;

    const start_date = moment(new Date(item.start_date));
    const end_date = moment(new Date(item.end_date));
    const time = moment(end_date - moment().subtract(1, "days"));

    let totalUnits = 0;

    let reg = /(ml|l|g|mg|μg)$/i;

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

    let frequency = item.frequency.intake_frequency;

    let remaining_time =
      end_date.add(1, `${frequency}s`).diff(today, `${frequency}s`) *
      intake_number;

    return Math.ceil(remaining_time) > 0
      ? Math.ceil(remaining_time) - todaysIntakeCount
      : 0;
  };

  const renderTreatmentsList = () => {
    if (!treatments || treatments.length == 0) return;

    let breakPoints =
      width > 1200 ? 3 : width > 800 ? 2 : 1;

    console.log(breakPoints);

    treatments.sort((a, b) => {
      return new Date(b.end_date) - new Date(a.end_date);
    });

    let rows = [];

    // split the array in arrays of 3 maximum elements
    for (let i = 0; i <= treatments.length; i++) {
      if (i !== 0 && i % breakPoints == 0) {
        rows.push(treatments.slice(i - breakPoints, i));
      } else if (i == treatments.length) {
        let firstIndex = rows.length * breakPoints;
        rows.push(treatments.slice(firstIndex, i)); // store the remaining
      }
    }

    console.log(rows);

    return rows.map((row) => {
      return (
        <Row xs={1} md={2} lg={3} style={{ margin: "15px 0" }}>
          {row.map((item) => {
            return (
              <Col
                className={`${getRemainingUnits(item) > 0 ? "" : "expired"}`}
              >
                <Badge
                  pill
                  className="remove-treatment"
                  bg="light"
                  onClick={() => deleteTreatement(item.id)}
                >
                  <LuTrash2 />
                </Badge>
                <Card className="treatment">
                  {getRemainingUnits(item) == 0 && (
                    <h5>
                      <Badge bg="danger">expiré</Badge>
                    </h5>
                  )}
                  <Card.Header>{item.name}</Card.Header>
                  <Card.Body>
                    <ListGroup horizontal>
                      <ListGroup.Item>
                        <PiPillDuotone />{" "}
                        {item.quantity.units_form.match(/(ml|l|g|mg|μg)$/i)
                          ? item.quantity.unit_number *
                            item.quantity.number_of_boxes
                          : item.quantity.units_per_unit *
                            item.quantity.number_of_boxes}
                      </ListGroup.Item>
                      <ListGroup.Item>
                        {item.frequency.intake_number} par
                        {item.frequency.intake_frequency === "day"
                          ? " jour"
                          : item.frequency.intake_frequency === "week"
                          ? " semaine"
                          : item.frequency.intake_frequency === "month" &&
                            " mois"}
                      </ListGroup.Item>
                      {item.frequency.intake_time_range &&
                        item.frequency.intake_time_range.length > 0 && (
                          <ListGroup.Item className="time-range">
                            {item.frequency.intake_time_range.map((elem) => {
                              return elem === "morning" ? (
                                <LuSunrise />
                              ) : elem === "midday" ? (
                                <LuSun />
                              ) : (
                                <LuSunset />
                              );
                            })}
                          </ListGroup.Item>
                        )}
                    </ListGroup>
                    <span className="start-time">
                      <LuCalendarFold />{" "}
                      <strong>
                        {new Date(item.start_date).toLocaleDateString()}
                      </strong>
                    </span>
                    <div className="remaining">
                      <small>
                        {getRemainingUnits(item)} {item.medication_format}(s)
                        restant(s)
                      </small>
                      {item.end_date && (
                        <ProgressBar
                          animated
                          variant={getProgressColor(item)}
                          now={getProgress(item)}
                        />
                      )}
                    </div>
                  </Card.Body>
                  <Card.ImgOverlay>
                    <Button variant="aqua">
                      <GrPowerCycle /> Renouveler le traitement
                    </Button>
                  </Card.ImgOverlay>
                </Card>
              </Col>
            );
          })}
        </Row>
      );
    });
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

  useEffect(() => {
    renderTreatmentsList();
  }, [width]);

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
        setMedication={setSelectedMedication}
      />
      <h3>Traitements médicaux</h3>
      {!loading ? (
        <Container
          className="treatments-list"
          style={{
            justifyContent: treatments.length > 0 ? "flex-start" : "center",
          }}
        >
          {treatments.length > 0 ? (
            renderTreatmentsList()
          ) : (
            <small>
              <CiMedicalClipboard /> Aucun traitement enregistré
            </small>
          )}
        </Container>
      ) : (
        <div>
          <Loader />
        </div>
      )}
      <Button
        variant="aqua"
        className="add-treatment-btn"
        onClick={() => setShowAddTreatement(true)}
      >
        <CiMedicalClipboard /> Ajouter un traitement
      </Button>
    </div>
  );
}
