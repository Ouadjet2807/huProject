import { http } from 'msw'

// These request handlers focus on the endpoints
// that concern the user.
export const handlers = [
  http.get(
    "http://127.0.0.1:8000/api/treatments/?archives=True&recipient=5",
    () => {
      return HttpResponse.json(
        {
          id: "cc9fd268-4a8c-4813-818f-eaebe84cfa77",
          name: "ALEVETABS 220 mg, comprimé pelliculé",
          dosage: "220 mg",
          cis_code: "62237910",
          medication_format: "comprimé",
          quantity: {
            unit_type: "plaquette",
            units_form: "comprimés",
            unit_number: 1,
            units_per_unit: 24,
            number_of_boxes: 1,
          },
          frequency: {
            intake_number: "2",
            intake_frequency: "day",
            intake_time_range: ["morning", "midday"],
          },
          start_date: "2026-04-16",
          end_date: "2026-04-28",
          prescribed_by: null,
          prescribed_to: 5,
          prescribed_to_id: 5,
          registered_by: "03601ebf-d5cc-4c45-9f46-d823375e712e",
          notes: "",
          space: "147447e9-53a2-4fd6-8fd3-6bf5bf159910",
          created_at: "2026-04-16T12:13:00.902094Z",
          is_expired: false,
          is_deleted: false,
        },
        {
          id: "906b7720-566c-4e7f-a63d-7b413cfdefd9",
          name: "CODOLIPRANE 500 mg/30 mg, comprimé",
          dosage: "500 mg",
          cis_code: "60904643",
          medication_format: "comprimé",
          quantity: {
            unit_type: "",
            units_form: "",
            unit_number: 1,
            units_per_unit: 1,
            number_of_boxes: 1,
          },
          frequency: {
            intake_number: 1,
            intake_frequency: "day",
            intake_time_range: [],
          },
          start_date: "2026-04-16",
          end_date: "2026-04-17",
          prescribed_by: null,
          prescribed_to: 5,
          prescribed_to_id: 5,
          registered_by: "03601ebf-d5cc-4c45-9f46-d823375e712e",
          notes: "",
          space: "147447e9-53a2-4fd6-8fd3-6bf5bf159910",
          created_at: "2026-04-16T12:11:12.397520Z",
          is_expired: true,
          is_deleted: false,
        },
      );
    },
  ),
//   http.post('/login', loginResolver),
//   http.delete('/user/:userId', deleteUserResolver),
]