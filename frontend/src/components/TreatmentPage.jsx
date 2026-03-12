import React, { useEffect, useState, useRef, useContext } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  LuSunrise,
  LuSunset,
  LuSun,
  LuTrash2,
  LuCalendarFold,
} from "react-icons/lu";
import api from "../api/api";
import Loader from "./Loader";
import moment from "moment";
import "moment/locale/fr";
import { BsBoxSeam } from "react-icons/bs";
import Button from "react-bootstrap/Button";
import { CiEdit, CiCircleInfo } from "react-icons/ci";
import { PiPillDuotone } from "react-icons/pi";
import { TiArrowBackOutline } from "react-icons/ti";
import { AuthContext } from "../context/AuthContext";
import MedicationDetailsModal from "./modals/MedicationDetailsModal";
import { ConfirmContext } from "../context/ConfirmContext";
import Badge from "react-bootstrap/esm/Badge";
import { useSelector } from "react-redux";

export default function TreatmentPage() {
  const { id } = useParams();
  const { showConfirm, setShowConfirm, setText, setAction, returnValue } =
    useContext(ConfirmContext);
  const space = useSelector((state) => state.space)
  const navigate = useNavigate();
  const pathname = window.location.pathname.split("/");
  const today = moment(new Date());
  const tabletRef = useRef();

  const [recipient, setRecipient] = useState();
  const [treatmentsArray, setTreatmentsArray] = useState([]);
  const [boxes, setBoxes] = useState([]);
  const [totalUnits, setTotalUnits] = useState([]);
  const [selectedMedication, setSelectedMedication] = useState({});
  const [treatmentData, setTreatmentData] = useState({});
  const [remainingUnits, setRemainingUnits] = useState(0);
  const [nbBoxes, setNbBoxes] = useState(0);
  const [unitsNumber, setUnitsNumber] = useState(0);
  const [medicationFocus, setMedicationFocus] = useState(false);
  const [showMedicationDetails, setShowMedicationDetails] = useState(false);
  const [visualTrackerDimensions, setVisualTrackerDimensions] = useState({
    width: 0,
    height: 0,
  })

  moment.locale("fr");

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
      intake_time_range.length === 0
    ) {
      todaysIntakeCount = intake_number;
    }

    return todaysIntakeCount;
  };

  const confirmRemoval = () => {
    setText("Êtes-vous sûr(e) de vouloir supprimer ce traitement ?");
    setAction(() => async () => {
      const response = await api.post(
        `http://127.0.0.1:8000/api/soft_delete_treatment/${treatmentData.id}/`,
      );
      navigate(`/${pathname[1]}/${pathname[2]}/${pathname[3]}`)
    });
    setShowConfirm(true);
  };

  const getRemainingUnits = (item) => {
    if (item.frequency === "" || !item.end_date) return;

    const intake_time_range =
      !item.frequency.intake_time_range ||
      item.frequency.intake_time_range.length < 0
        ? null
        : item.frequency.intake_time_range;

    const intake_number = item.frequency.intake_number;

    const start_date = moment(new Date(item.start_date));
    const end_date = moment(new Date(item.end_date));

    let totalUnits = 0;

    let reg = /(ml|l|g|mg|μg)$/i;

    if (reg.test(item.quantity.units_form)) {
      totalUnits = item.quantity.unit_number * item.quantity.number_of_boxes;
    } else {
      totalUnits = item.quantity.units_per_unit * item.quantity.number_of_boxes;
    }
    console.log(totalUnits);
    
    if (start_date > today) return totalUnits;

    let todaysIntakeCount = checkTodaysIntake(intake_number, intake_time_range);

    console.log(todaysIntakeCount);

    let frequency = item.frequency.intake_frequency;

    let remaining_time =
      end_date.add(1, `${frequency}s`).diff(today, `${frequency}s`) *
      intake_number;

    return Math.ceil(remaining_time) > 0
      ? Math.ceil(remaining_time) - todaysIntakeCount
      : 0;
  };

  useEffect(() => {
    if (!Object.keys(treatmentData).length > 0) return;
    let remaining = getRemainingUnits(treatmentData);
    setRemainingUnits(remaining);
    setUnitsNumber(treatmentData.quantity.units_per_unit);

    setNbBoxes(treatmentData.quantity.number_of_boxes);
  }, [treatmentData]);

  useEffect(() => {
    const fillUnits = () => {
      for (let i = 1; i <= unitsNumber * nbBoxes; i++) {
        if (!totalUnits.includes(i)) {
          setTotalUnits((prev) => [...prev, i]);
        }
      }
    };

    fillUnits();
  }, [nbBoxes]);

  useEffect(() => {
    const fillBoxes = () => {
      if (!totalUnits.length > 0) return;
      setBoxes([]);
      for (let i = 0; i < nbBoxes; i++) {
        if (totalUnits.length <= 0) return;

        let low = unitsNumber * i;
        let high = unitsNumber * (i + 1);
        setBoxes((prev) => [...prev, totalUnits.slice(low, high)]);
      }
    };

    fillBoxes();
  }, [totalUnits]);

  useEffect(() => {
    const sortBoxes = () => {
      if (!boxes.length > 0 || remainingUnits === 0) return;

      if (remainingUnits > boxes[0][boxes[0].length - 1]) {
        setBoxes((prev) => prev.reverse());
      }
    };
    sortBoxes();
  }, [remainingUnits, boxes]);

  useEffect(() => {
    const getTreatmentData = async () => {
      if (!id) return;
      try {
        let response = await api.get(
          `http://127.0.0.1:8000/api/treatments/${id}`,
        );
        setTreatmentData(response.data);
      } catch (error) {
        console.log(error);
      }
    };

    getTreatmentData();
  }, [id]);

  useEffect(() => {
    if(!tabletRef.current) return

    setVisualTrackerDimensions({
        height: tabletRef.current.offsetHeight,
        width: tabletRef.current.offsetWidth,
    })

  }, [tabletRef.current, boxes, window.innerWidth, window.innerHeight])

  useEffect(() => {
    let reg = /^[0-9]+$/g;
    if (Object.keys(space).length > 1 && reg.test(pathname[2])) {
      console.log(space.recipients.find((r) => r.id === pathname[2]));
      setRecipient(space.recipients.find((r) => r.id === pathname[2]));
    }
  }, [space]);

  useEffect(() => {
    const getTreatments = async () => {
      if (!pathname[2].match("^/0-9/$")) return;
      try {
        const response = await api.get(
          `http://127.0.0.1:8000/api/treatments/?archives=False&recipient=${pathname[2].id}`,
        );

        const data = {
          content: response.data,
          status: response.status,
        };

        setTreatmentsArray((prev) => ({
          ...prev,
          treatments: data,
        }));
        console.log(response);
      } catch (error) {
        console.log(error);
      }
    };

    getTreatments();
  }, []);

  console.log(treatmentData);
  console.log(remainingUnits);

  return (
    <div className="treatment-container">
      <Button
        variant="aqua"
        onClick={() =>
          navigate(`/${pathname[1]}/${pathname[2]}/${pathname[3]}`)
        }
      >
        <TiArrowBackOutline /> Retour
      </Button>
      <MedicationDetailsModal
        recipient={recipient}
        setShow={setShowMedicationDetails}
        show={showMedicationDetails}
        treatment={treatmentData}
        medication={selectedMedication}
        setMedication={setSelectedMedication}
        treatmentsData={treatmentsArray}
        setTreatmentsData={setTreatmentsArray}
      />
      {Object.keys(treatmentData).length > 1 ? (
        <div className="treatment-info">
          <div className="container">
            <div className="left-tab">
                {treatmentData.is_expired &&
                   <h5>
                      <Badge bg="danger">expiré</Badge>
                    </h5>
                }
              <div
                className={`medication-tracker ${medicationFocus ? "focus" : ""}`}
                style={{
                  height: `${visualTrackerDimensions.height * Math.sqrt(nbBoxes)}px`,
                  width: `${visualTrackerDimensions.width}px`,
                  filter: `${treatmentData.is_expired ? 'brightness(0.7)' : 'none'}`
                }}
                onMouseEnter={() => setMedicationFocus(true)}
                onMouseLeave={() => setMedicationFocus(false)}
              >
                {boxes.length > 0 &&
                  boxes.map((box, i) => {
                    return (
                      <div
                        className="tablet"
                        ref={tabletRef}
                        id={`tablet_${boxes.length - i}`}
                        style={{
                          filter: `brightness(${1 - (i + 1) / 10})`,
                          zIndex: 6 - (i + 2),
                        }}
                      >
                        {box.map((unit, j) => {
                          return (
                            <div
                              className={`pill ${unit <= remainingUnits ? "fill" : "empty"}`}
                              style={{
                                width: `${2 / Math.log10(unitsNumber)}vw`,
                                height: `${2 / Math.log10(unitsNumber)}vw`,
                              }}
                              id={unit}
                            ></div>
                          );
                        })}
                      </div>
                    );
                  })}
              </div>
              <div
                className="stock"
                style={{
                  width: `${visualTrackerDimensions.width}px`,
                }}
              >
                <div className="remaining-pills">
                  {remainingUnits} <PiPillDuotone /> restant(e)s
                </div>
                <span className="box-number" style={{ float: "right" }}>
                  x {boxes.length} <BsBoxSeam />
                </span>
              </div>
            </div>
            <div className="right-tab">
              <h3>{treatmentData.name}</h3>
              <span><CiCircleInfo /> {treatmentData.quantity.unit_type}(s) de {treatmentData.quantity.units_per_unit} {treatmentData.quantity.units_form}</span>
              <div className="header">
                <div className="intake-frequency">
                  <div className="pill-radius" id="intakeNumber">
                    {treatmentData.frequency.intake_number}x par jour
                  </div>
                  <div className="pill-radius" id="intakeTimeRange">
                    {treatmentData.frequency.intake_time_range.length > 0 &&
                      treatmentData.frequency.intake_time_range.map((time) => {
                        return time === "morning" ? (
                          <LuSunrise />
                        ) : time === "midday" ? (
                          <LuSun />
                        ) : (
                          <LuSunset />
                        );
                      })}
                  </div>
                </div>
                <div className="registration-info">
                  <div className="registered-by">
                    enregistré par
                    {Object.keys(space).length > 1 && (
                      <span className="pill-radius">
                        {space.caregivers.find(
                          (c) => c.user === treatmentData.registered_by,
                        ).first_name +
                          " " +
                          space.caregivers.find(
                            (c) => c.user === treatmentData.registered_by,
                          ).last_name}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <div className="date">
                <LuCalendarFold /> Traitement commencé le{" "}
                <strong>
                  {moment(treatmentData.start_date)
                    .local()
                    .format("dddd Do MMMM YYYY")}
                </strong>
              </div>
              <div className="actions">
                <Button
                  variant="outline-md-green"
                  onClick={() => setShowMedicationDetails(true)}
                >
                  <CiEdit /> Modifier
                </Button>
                <Button
                  variant="outline-danger"
                  onClick={() => confirmRemoval()}
                >
                  <LuTrash2 /> Supprimer
                </Button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <Loader />
      )}
    </div>
  );
}
