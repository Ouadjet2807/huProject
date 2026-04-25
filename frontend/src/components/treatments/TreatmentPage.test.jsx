import TreatmentPage from "./TreatmentPage";
import { render, screen } from "@testing-library/react";
import { AuthProvider } from "../../context/AuthContext";
import { store } from "../../redux/store";
import { Provider } from "react-redux";
import { BrowserRouter, MemoryRouter, Route, Routes } from "react-router";
import { ToastProvider } from "../../context/ToastContext";
import { ConfirmProvider } from "../../context/ConfirmContext";
import { act } from "react";
import { setValues } from "../../redux/spaceSlice";
import { UseDimensionProvider } from "../../context/UseDimensionsContext";
import { afterEach, expect } from "vitest";
import { server } from "../../mocks/node";
import {handlers as treatmentHandlers} from "../../mocks/handlers/treatment"
import {  LuSunrise,
  LuSunset,
  LuSun} from "react-icons/lu"

afterEach(() => server.resetHandlers())

const ProviderWrapper = ({ children }) => (
  <Provider store={store}>
    <UseDimensionProvider>
      <AuthProvider>
        <ToastProvider>
          <ConfirmProvider>{children}</ConfirmProvider>
        </ToastProvider>
      </AuthProvider>
    </UseDimensionProvider>
  </Provider>
);
describe("TreatmentPage", () => {
  delete window.location;
  window.location = {
    reload: vi.fn(),
    href: "http://dummy.com?page=1&name=testing",
  };

  it("Should render without crash", async () => {
    store.dispatch(
      setValues({
        agenda: {},
        caregivers: [],
        created_at: "",
        created_by: {},
        description: "",
        id: "1",
        name: "",
        recipients: [
          {
            id: 5,
            first_name: "John",
            last_name: "Doe",
            birth_date: "1998-02-20",
            treatments: [
              {
                cis_code: "62237910",
                created_at: "2026-04-16T12:13:00.902094Z",
                dosage: "220 mg",
                end_date: "2026-04-28",
                frequency: {
                  intake_number: "3",
                  intake_frequency: "day",
                  intake_time_range: ["morning", "midday", "evening"],
                },
                id: "1",
                is_deleted: false,
                is_expired: false,
                medication_format: "gélule",
                name: "CODOLIPRANE 500 mg/30 mg, gélule",
                notes: "",
                prescribed_by: null,
                prescribed_to: 5,
                prescribed_to_id: 5,
                quantity: {
                  unit_type: "plaquette",
                  units_form: "gélule",
                  unit_number: 1,
                  units_per_unit: 24,
                  number_of_boxes: 1,
                },
                registered_by: "2",
                space: "1",
                start_date: "2026-04-16",
              },
            ],
          },
        ],
        todos: [],
        updated_at: "",
      }),
    );

    const route = "/recipient/5/treatments/1";
    await act(async () => {
      render(
        <MemoryRouter initialEntries={[route]}>
          <Routes>
            <Route
              path="/recipient/:id/treatments/:id"
              element={<TreatmentPage />}
            />
          </Routes>
        </MemoryRouter>,
        { wrapper: ProviderWrapper },
      );
    });
    const loader = screen.getByTestId("loader");

    expect(loader).toBeInTheDocument()
  });
  it("Should render without crash", async () => {

    server.use(...treatmentHandlers)
    store.dispatch(
      setValues({
        agenda: {},
        caregivers: [{id: "1", first_name: "John", last_name: "Doe", user: "1"}],
        created_at: "",
        created_by: {},
        description: "",
        id: "1",
        name: "",
        recipients: [
          {
            id: 5,
            first_name: "Jack",
            last_name: "Doe",
            birth_date: "1998-02-20",
            treatments: [
              {
                cis_code: "62237910",
                created_at: "2026-04-16T12:13:00.902094Z",
                dosage: "220 mg",
                end_date: "2026-04-28",
                frequency: {
                  intake_number: "3",
                  intake_frequency: "day",
                  intake_time_range: ["morning", "midday", "evening"],
                },
                id: "1",
                is_deleted: false,
                is_expired: false,
                medication_format: "gélule",
                name: "CODOLIPRANE 500 mg/30 mg, gélule",
                notes: "",
                prescribed_by: null,
                prescribed_to: 5,
                prescribed_to_id: 5,
                quantity: {
                  unit_type: "plaquette",
                  units_form: "gélule",
                  unit_number: 1,
                  units_per_unit: 24,
                  number_of_boxes: 1,
                },
                registered_by: "2",
                space: "1",
                start_date: "2026-04-16",
              },
            ],
          },
        ],
        todos: [],
        updated_at: "",
      }),
    );

    const route = "/recipient/5/treatments/1";
    await act(async () => {
      render(
        <MemoryRouter initialEntries={[route]}>
          <Routes>
            <Route
              path="/recipient/:id/treatments/:id"
              element={<TreatmentPage />}
            />
          </Routes>
        </MemoryRouter>,
        { wrapper: ProviderWrapper },
      );
    });

    const heading = screen.getByRole("heading", {level: 3})
    const presentation = screen.getByTestId("presentation")
    const registeredBy = screen.getByTestId("registeredBy")
    const intakeNumber = screen.getByTestId("intakeNumber")
    const intakeTimeRange = screen.getByTestId("intakeTimeRange")
    const editButton = screen.getByTestId("editButton")
    const deleteButton = screen.getByTestId("deleteButton")

    expect(heading).toBeInTheDocument()
    expect(heading).toHaveTextContent("ALEVETABS 220 mg, comprimé pelliculé")
    expect(registeredBy).toBeInTheDocument()
    expect(registeredBy).toHaveTextContent(/enregistré par john doe/i)
    expect(intakeNumber).toBeInTheDocument()
    expect(intakeNumber).toHaveTextContent(/2x par jour/i)
    expect(intakeTimeRange).toBeInTheDocument()
    expect(presentation).toBeInTheDocument()
    expect(presentation).toHaveTextContent(/plaquette\(s\) de 24 comprimés/i)

    expect(editButton).toBeInTheDocument()
    expect(editButton).toHaveTextContent(/modifier/i)
    expect(deleteButton).toBeInTheDocument()
    expect(deleteButton).toHaveTextContent(/supprimer/i)

  });
});
