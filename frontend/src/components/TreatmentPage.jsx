import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../api/api";
import Loader from "./Loader";
import moment from "moment";
import "moment/locale/fr";

export default function TreatmentPage() {
  const { id } = useParams();

  const [treatmentData, setTreatmentData] = useState({});
  const [remainingUnits, setRemainingUnits] = useState();
  const [unitsNumber, setUnitsNumber] = useState(0);
  console.log(id);
  moment.locale("fr");

  const today = moment(new Date());

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
  }, [treatmentData]);

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

  console.log(treatmentData);
  console.log(remainingUnits);
  console.log(remainingUnits / treatmentData.quantity.number_of_boxes);


  return (
    <div className="treatment-container">
      {Object.keys(treatmentData).length > 1 ? (
        <div className="treatment-info">
          <h2>{treatmentData.name}</h2>
          <div className="container">
            <div className="medication-tracker">
              <div className="tablet" id="tablet_1">
                {Array(unitsNumber)
                  .fill(treatmentData.quantity.units_form)
                  .map((item, i) => {
                    return (
                      <div
                        className={`pill ${i + 1 > (remainingUnits - (unitsNumber * (treatmentData.quantity.number_of_boxes - 1))) ? "empty" : "fill"}`}
                        style={{
                          width: `${4 / Math.log10(unitsNumber)}vw`,
                          height: `${4 / Math.log10(unitsNumber)}vw`,
                        }}
                        id={i + 1}
                      ></div>
                    );
                  })}
              </div>
              {treatmentData.quantity.number_of_boxes > 1 &&
                Array(treatmentData.quantity.number_of_boxes)
                  .fill(treatmentData.quantity.number_of_boxes)
                  .map((item, i) => {
                    return (
                      <div className="tablet" id={`tablet_${i + 2}`} style={{filter: `brightness(${1 - ((i+2) / 10)})`, zIndex: 6 - (i+2)}}>
                        {Array(unitsNumber)
                          .fill(treatmentData.quantity.units_form)
                          .map((item, i) => {
                            return (
                              <div
                                className="pill fill"
                                style={{
                                  width: `${Math.log10(unitsNumber)}vw`,
                                  height: `${Math.log10(unitsNumber)}vw`,
                                }}
                                id={i + 1}
                              ></div>
                            );
                          })}
                      </div>
                    );
                  })}
            </div>
          </div>
        </div>
      ) : (
        <Loader />
      )}
    </div>
  );
}
