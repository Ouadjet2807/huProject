import { http, HttpResponse } from "msw";

// These request handlers focus on the endpoints
// that concern the user.
export const handlers = [
  http.get(
    "http://127.0.0.1:8000/api/treatments/?archives=True&recipient=5",
    () => {
      return HttpResponse.json([
        {
          id: "2865f6d5-93a3-456c-9c6f-47db4ca5ed28",
          name: "INSULINE ASPARTE SANOFI 100 unités/ml, solution injectable en cartouche",
          dosage: "100 unités",
          cis_code: "63054036",
          medication_format: "solution",
          quantity: {
            unit_type: "cartouche",
            units_form: "ml",
            unit_number: 5,
            units_per_unit: 3,
            number_of_boxes: 1,
          },
          frequency: {
            intake_number: 1,
            intake_frequency: "day",
            intake_time_range: ["evening"],
          },
          start_date: "2025-11-21",
          end_date: "2025-11-25",
          prescribed_by: null,
          prescribed_to: 5,
          prescribed_to_id: 5,
          registered_by: null,
          notes: "",
          space: "147447e9-53a2-4fd6-8fd3-6bf5bf159910",
          created_at: "2025-11-21T09:03:50.367938Z",
          is_expired: true,
          is_deleted: false,
        },
        {
          id: "ed46679b-ae36-4611-b860-a892b3b5840f",
          name: "LEVOTHYROX 200 microgrammes, comprimé sécable",
          dosage: "200 microgrammes",
          cis_code: "63054036",
          medication_format: "comprimé",
          quantity: {
            unit_type: "plaquette",
            units_form: "comprima©",
            unit_number: 1,
            units_per_unit: 30,
            number_of_boxes: 1,
          },
          frequency: {
            intake_number: 1,
            intake_frequency: "day",
            intake_time_range: ["morning"],
          },
          start_date: "2025-12-17",
          end_date: "2026-01-15",
          prescribed_by: null,
          prescribed_to: 5,
          prescribed_to_id: 5,
          registered_by: null,
          notes: "",
          space: "147447e9-53a2-4fd6-8fd3-6bf5bf159910",
          created_at: "2025-12-17T10:14:54.459406Z",
          is_expired: true,
          is_deleted: false,
        },
      ]);
    },
  ),
  //   http.post('/login', loginResolver),
  //   http.delete('/user/:userId', deleteUserResolver),
];
