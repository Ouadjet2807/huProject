import { useState, useEffect } from "react";
import moment from "moment";
import "moment/locale/fr";

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

export function useGetTreatmentRemainingUnits(treatment) {
  const [remainingUnits, setRemainingUnits] = useState();

  useEffect(() => {
    function getRemainingUnits() {
      console.log(treatment);

      if (
        Object.keys(treatment).length <= 0 ||
        treatment.frequency == "" ||
        !treatment.end_date
      ) {
        setRemainingUnits(-1);
        return;
      }

      const intake_time_range =
        !treatment.frequency.intake_time_range ||
        treatment.frequency.intake_time_range.length < 0
          ? null
          : treatment.frequency.intake_time_range;
      const intake_number = treatment.frequency.intake_number;

      const start_date = moment(new Date(treatment.start_date));
      const end_date = moment(new Date(treatment.end_date));

      let totalUnits = 0;

      let reg = /(ml|l|g|mg|μg)$/i;

      if (reg.test(treatment.quantity.units_form)) {
        totalUnits =
          treatment.quantity.unit_number * treatment.quantity.number_of_boxes;
      } else {
        totalUnits =
          treatment.quantity.units_per_unit *
          treatment.quantity.number_of_boxes;
      }

      if (start_date > today) return totalUnits;

      let todaysIntakeCount = checkTodaysIntake(
        intake_number,
        intake_time_range,
      );

      let frequency = treatment.frequency.intake_frequency;

      let remaining_time =
        end_date.add(1, `${frequency}s`).diff(today, `${frequency}s`) *
        intake_number;

      let result =
        Math.ceil(remaining_time) > 0
          ? Math.ceil(remaining_time) - todaysIntakeCount
          : 0;

      setRemainingUnits(result);
    }

    getRemainingUnits();
  }, []);

  return remainingUnits;
}
