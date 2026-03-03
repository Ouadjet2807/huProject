import React, { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import { LuSunrise, LuSunset, LuSun, LuTrash2 } from "react-icons/lu";
import api from "../api/api";
import Loader from "./Loader";
import moment from "moment";
import "moment/locale/fr";
import { BsBoxSeam } from "react-icons/bs";
import Button from 'react-bootstrap/Button';
import { CiEdit } from "react-icons/ci";
import { PiPillDuotone } from "react-icons/pi";

export default function TreatmentPage() {
  const { id } = useParams();

  const [treatmentData, setTreatmentData] = useState({});
  const [remainingUnits, setRemainingUnits] = useState(0);
  const [medicationFocus, setMedicationFocus] = useState(false);
  const [unitsNumber, setUnitsNumber] = useState(0);
  const [totalUnits, setTotalUnits] = useState([]);
  const [nbBoxes, setNbBoxes] = useState(0);
  const [boxes, setBoxes] = useState([]);

  console.log(id);
  moment.locale("fr");

  const today = moment(new Date());

  const tabletRef = useRef()

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

  const getRemainingUnits = (item) => {
    if (item.frequency == "" || !item.end_date) return;

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

    if (start_date > today) return totalUnits;

    let todaysIntakeCount = checkTodaysIntake(intake_number, intake_time_range);

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
    console.log(nbBoxes);
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
      console.log(!totalUnits.length > 0);

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
      console.log("fire");

      if (!boxes.length > 0 || remainingUnits == 0) return;

      console.log(remainingUnits > boxes[1].length);
      console.log(boxes[0][boxes[0].length - 1]);

      if (remainingUnits > boxes[0][boxes[0].length - 1]) {
        console.log("reverse");

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
        console.log(response);
        setTreatmentData(response.data);
      } catch (error) {
        console.log(error);
      }
    };

    getTreatmentData();
  }, [id]);



  console.log(totalUnits);
  console.log(treatmentData);
  console.log(remainingUnits);
  console.log(boxes);

  return (
    <div className="treatment-container">
      {Object.keys(treatmentData).length > 1 ? (
        <div className="treatment-info">
          <div className="container">
            <div className="left-tab">
              <div
                className={`medication-tracker ${medicationFocus ? "focus" : ""}`}
                style={{height: `${tabletRef.current ? (tabletRef.current.offsetHeight * 1.2) : 0}px`, width: `${tabletRef.current ? tabletRef.current.offsetWidth : 0}px`}}
                onMouseEnter={() => setMedicationFocus(true)}
                onMouseLeave={() => setMedicationFocus(false)}
              >
            

                {boxes.length > 1 &&
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
              <div className="stock" style={{width: `${tabletRef.current ? tabletRef.current.offsetWidth : 0}px`}}>
                <div className="remaining-pills">
                    {remainingUnits} <PiPillDuotone/> restant(e)s
                </div>
                <span className="box-number" style={{ float: "right" }}>
                  x {boxes.length} <BsBoxSeam />
                </span>
              </div>
            </div>
            <div className="right-tab">
              <h3>{treatmentData.name}</h3>
              <div className="intake-frequency">
                <div className="" id="intakeNumber">
                  {treatmentData.frequency.intake_number}x par jour
                </div>
                <div className="" id="intakeTimeRange">
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
              <div className="actions">
                <Button variant="outline-md-green"><CiEdit /> Modifier</Button>
                <Button variant="outline-danger"><LuTrash2 /> Supprimer</Button>
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
