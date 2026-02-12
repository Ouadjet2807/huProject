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
import { GoArchive } from "react-icons/go";
import moment from "moment";
import "moment/locale/fr";
import { UseDimensionsContext } from "../context/UseDimensionsContext";
import { AuthContext } from "../context/AuthContext";
import { MdOutlineAutorenew } from "react-icons/md";

export default function RecipientTreatments({ recipient }) {
  const [showAddTreatment, setShowAddTreatement] = useState(false);
  const [showMedicationDetails, setShowMedicationDetails] = useState(false);
  const [selectedMedication, setSelectedMedication] = useState({});
  const [selectedTreatment, setSelectedTreatment] = useState({});
  const [treatments, setTreatments] = useState([]);
  const [archivedTreatments, setArchivedTreatments] = useState([]);
  const [archiveTab, setArchiveTab] = useState(false);

  const { width, height } = useContext(UseDimensionsContext);
  const { space } = useContext(AuthContext);
  const [loading, setLoading] = useState(true);

  moment.locale("fr");

  const today = moment(new Date());

  const getTreatments = async () => {
    setLoading(true)
     try {
      setTreatments([]);
      const response = await api.get(
        `http://127.0.0.1:8000/api/treatments/?archives=False&recipient=${recipient.id}`,
      );
      setTreatments(response.data)
    } catch (error) {
      console.log(error);
    }
    setLoading(false);
  }

  const getArchivedTreatments = async () => {
    setLoading(true)
    try {
      setArchivedTreatments([]);
      const response = await api.get(
        `http://127.0.0.1:8000/api/treatments/?archives=True&recipient=${recipient.id}`,
      );

      setArchivedTreatments(response.data)
    } catch (error) {
      console.log(error);
    }
    setLoading(false);
  };

  const selectTreatment = (treatment) => {
    setSelectedTreatment(treatment);
    setShowMedicationDetails(true);
  };

  const checkTodaysIntake = (intake_number, intake_time_range) => {
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

    if (start > today) return 100;

    const initialTime = end.diff(start);

    const currentTime = new Date().setTime(end - moment());

    const result = (currentTime / initialTime) * 100;

    return result;
  };

  const getProgressColor = (item) => {
    let value = getProgress(item);
    console.log(value);
    
    switch (true) {
      case value >= 50:
        return "success";
      case value > 10 && value < 50:
        return "warning";
      case value <= 10:
        return "danger";
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
    // const time = moment(end_date - moment().subtract(1, "days"));

    let totalUnits = 0;

    let reg = /(ml|l|g|mg|μg)$/i;

    if (reg.test(item.quantity.units_form)) {
      totalUnits = item.quantity.unit_number * item.quantity.number_of_boxes;
    } else {
      totalUnits = item.quantity.units_per_unit * item.quantity.number_of_boxes;
    }

    console.log(totalUnits);

    console.log(start_date > today);

    if (start_date > today) return totalUnits;

    let todaysIntakeCount = checkTodaysIntake(intake_number, intake_time_range);

    let frequency = item.frequency.intake_frequency;

    let remaining_time =
      end_date.add(1, `${frequency}s`).diff(today, `${frequency}s`) *
      intake_number;

      console.log(Math.ceil(remaining_time) > 0);

      console.log(remaining_time);
      console.log(todaysIntakeCount);

    return Math.ceil(remaining_time) > 0
      ? Math.ceil(remaining_time)
      : 0;
  };

  const renderTreatmentsList = () => {

    let treatmentsList = archiveTab ? archivedTreatments : treatments;

    if (!treatmentsList || treatmentsList.length == 0) {
      return (
        <small>
          <CiMedicalClipboard /> Aucun traitement enregistré
        </small>
      );
    }

    let breakPoints = width > 1200 ? 3 : width > 800 ? 2 : 1;

    treatmentsList.sort((a, b) => {
      return new Date(b.end_date) - new Date(a.end_date);
    });

    let rows = [];

    // split the array in arrays of 3 elements maximum
    for (let i = 0; i <= treatmentsList.length; i++) {
      if (i !== 0 && i % breakPoints == 0) {
        rows.push(treatmentsList.slice(i - breakPoints, i));
      } else if (i == treatmentsList.length) {
        let firstIndex = rows.length * breakPoints;
        rows.push(treatmentsList.slice(firstIndex, i)); // store the remaining
      }
    }

    return rows.map((row) => {
      return (
        <Row xs={1} md={2} lg={3} style={{ margin: "15px 0" }}>
          {row.map((item) => {
            return (
              <Col
                className={`${item.is_expired? "expired" : ""}`}
              >
                <Badge
                  pill
                  className="remove-treatment"
                  bg="light"
                  onClick={() => selectTreatment(item)}
                >
                  {archiveTab ? <MdOutlineAutorenew /> : <LuTrash2 />}
                </Badge>
                <Card className="treatment">
                  {item.is_expired && (
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
                      {!archiveTab && item.end_date && (
                        <ProgressBar
                          animated
                          variant={getProgressColor(item)}
                          now={getProgress(item)}
                        />
                      )}
                    </div>
                  </Card.Body>
                  <Card.ImgOverlay>
                    <Button
                      variant="aqua"
                      onClick={() => selectTreatment(item)}
                    >
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
    getTreatments()
    getArchivedTreatments()

  }, []);

  useEffect(() => {
    renderTreatmentsList();
  }, [width, archiveTab, archivedTreatments]);

  console.log(archivedTreatments);
  console.log(treatments);

  return (
    <div
      id="recipientTreatments"
      style={{
        alignItems: !loading ? "flex-end" : "center",
      }}
    >
      <SearchTreatmentsModal
        setShow={setShowAddTreatement}
        show={showAddTreatment}
        setSelectedMedication={setSelectedMedication}
      />
      <MedicationDetailsModal
        recipient={recipient}
        setShow={setShowMedicationDetails}
        showAddTreatmentModal={setShowAddTreatement}
        show={showMedicationDetails}
        medication={selectedMedication}
        treatment={selectedTreatment}
        setMedication={setSelectedMedication}
      />
      <div className="header">
        <h3>Traitements médicaux </h3>{" "}
        <Button
          variant="aqua"
          size="sm"
          onClick={() => setArchiveTab(!archiveTab)}
        >
          <GoArchive /> {!archiveTab ? "Archives" : "Retour"}
        </Button>
      </div>
      {!loading ? (
        <Container
          className="treatments-list"
          style={{
            justifyContent:
              recipient.treatments.length > 0 ? "flex-start" : "center",
          }}
        >
          {renderTreatmentsList()}
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
