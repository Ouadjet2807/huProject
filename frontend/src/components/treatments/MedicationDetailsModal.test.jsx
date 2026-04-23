import MedicationDetailsModal from "./MedicationDetailsModal";
import { render, screen } from "@testing-library/react";
import { AuthProvider } from "../../context/AuthContext";
import { store } from "../../redux/store";
import { Provider } from "react-redux";
import { BrowserRouter } from "react-router";
import { ToastProvider } from "../../context/ToastContext";
import { ConfirmProvider } from "../../context/ConfirmContext";
import { setValues } from "../../redux/spaceSlice";
import { act } from "react";
import moment from "moment";
import "moment/locale/fr";
import userEvent from "@testing-library/user-event";

moment.locale("fr");

const ProviderWrapper = ({ children }) => (
  <Provider store={store}>
    <AuthProvider>
      <ToastProvider>
        <ConfirmProvider>
          <BrowserRouter>{children}</BrowserRouter>
        </ConfirmProvider>
      </ToastProvider>
    </AuthProvider>
  </Provider>
);

const medication = {
  cis: 62049552,
  composition: [
    {
      cis: 60904643,
      codeSubstance: 2202,
      denominationSubstance: "PARACÉTAMOL",
      dosage: "500 mg",
      elementPharmaceutique: "comprimé",
      natureComposant: "SA",
      referenceDosage: "un comprimé",
    },
  ],
  conditions: [
    "prescription limitée à 12 semaines",
    "liste I",
    "prescription en toutes lettres sur ordonnance sécurisée",
  ],
  dateAMM: "23/01/2017",
  elementPharmaceutique: "CODOLIPRANE 500 mg/30 mg, gélule",
  etatComercialisation: "Commercialisée",
  formePharmaceutique: "gélule",
  generiques: null,
  presentation: [
    {
      agreement: "oui",
      cip7: 2756239,
      cip13: 3400927562396,
      cis: 60904643,
      dateDeclaration: "14/01/2014",
      etatComercialisation: "Déclaration de commercialisation",
      libelle:
        "plaquette(s) thermoformée(s) PVC PVDC aluminium de 16 comprimé(s)",
      prix: 1.72,
      statusAdministratif: "Présentation active",
      tauxRemboursement: "65%",
    },
  ],
  statusAutorisation: "Autorisation active",
  surveillanceRenforcee: "Non",
  titulaire: "OPELLA HEALTHCARE FRANCE",
  typeProcedure: "Procédure nationale",
  voiesAdministration: ["orale"],
};

const treatment = [
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
  {
    cis_code: "62237910",
    created_at: "2026-04-16T12:13:00.902094Z",
    dosage: "220 mg",
    end_date: "2026-04-28",
    frequency: {
      intake_number: "2",
      intake_frequency: "day",
      intake_time_range: ["morning"],
    },
    id: "2",
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
];

describe("MedicationDetailsModal", () => {
  delete window.location;
  window.location = {
    reload: vi.fn(),
    href: "http://dummy.com?page=1&name=testing",
  };
  it("Should render without crash", async () => {
    await act(async () => {
      render(
        <MedicationDetailsModal
          show={true}
          recipient={{ id: 1, first_name: "John", last_name: "Doe" }}
          treatment={{}}
          medication={{}}
          treatmentsData={[]}
        />,
        { wrapper: ProviderWrapper },
      );
    });

    const title = screen.getByTestId("title");
    expect(title).toBeInTheDocument();
    expect(title).toHaveTextContent("");
  });
  it("Should render without crash", async () => {
    render(
      <MedicationDetailsModal
        show={true}
        recipient={{ id: 1, first_name: "John", last_name: "Doe" }}
        treatment={{}}
        medication={medication}
        treatmentsData={[]}
      />,
      {
        wrapper: ProviderWrapper,
      },
    );

    const title = screen.getByTestId("title");
    const intakeNumberInput = screen.getByTestId("intakeNumberInput");
    const intakeFrequencyInput = screen.getByTestId("intakeFrequencyInput");
    const freeTakeInput = screen.getByTestId("freeTakeInput");
    const timeOfIntakes = screen.getAllByTestId(/timeOfIntake_/);
    const numberOfBoxesInput = screen.getByTestId("numberOfBoxesInput");
    const startDateInput = screen.getByTestId("startDateInput");
    const prescribedByInput = screen.getByTestId("prescribedByInput");
    const saveButton = screen.getByTestId("saveButton");
    const cancelButton = screen.getByTestId("cancelButton");

    expect(title).toHaveTextContent("CODOLIPRANE 500 mg/30 mg, gélule");
    expect(intakeNumberInput).toBeInTheDocument();
    expect(intakeNumberInput.value).toBe("1");
    expect(intakeFrequencyInput).toBeInTheDocument();
    expect(intakeFrequencyInput.value).toBe("day");
    expect(freeTakeInput).toBeInTheDocument();
    expect(freeTakeInput).not.toBeChecked();

    timeOfIntakes.forEach((time) => {
      expect(time).toBeInTheDocument();
    });
    expect(numberOfBoxesInput).toBeInTheDocument();
    expect(numberOfBoxesInput.value).toBe("1");
    expect(startDateInput).toBeInTheDocument();
    expect(startDateInput.value).toBe(
      `${moment(new Date()).toISOString().split("T")[0]}`,
    );
    expect(prescribedByInput).toBeInTheDocument();
    expect(prescribedByInput.value).toBe("Non renseigné");
    expect(saveButton).toBeInTheDocument();
    expect(saveButton).toHaveTextContent(/enregistrer/i);
    expect(cancelButton).toBeInTheDocument();
    expect(cancelButton).toHaveTextContent(/retour/i);
  });
  it("Should disable intake number, intake frequency and time of intake inputs when user check free take input", async () => {
    render(
      <MedicationDetailsModal
        show={true}
        recipient={{ id: 1, first_name: "John", last_name: "Doe" }}
        treatment={{}}
        medication={medication}
        treatmentsData={[]}
      />,
      {
        wrapper: ProviderWrapper,
      },
    );
    const freeTakeInput = screen.getByTestId("freeTakeInput");
    const intakeNumberInput = screen.getByTestId("intakeNumberInput");
    const intakeFrequencyInput = screen.getByTestId("intakeFrequencyInput");
    const timeOfIntakes = screen.getAllByTestId(/timeOfIntake/);

    await userEvent.click(freeTakeInput);

    expect(freeTakeInput).toBeChecked();
    expect(intakeNumberInput).toBeDisabled();
    expect(intakeFrequencyInput).toBeDisabled();
    timeOfIntakes.forEach((time) => {
      expect(time).toBeDisabled();
    });
  });
  it("Should enable intake number and intake frequency inputs when user uncheck free take input", async () => {
    render(
      <MedicationDetailsModal
        show={true}
        recipient={{ id: 1, first_name: "John", last_name: "Doe" }}
        treatment={{}}
        medication={medication}
        treatmentsData={[]}
      />,
      {
        wrapper: ProviderWrapper,
      },
    );
    const freeTakeInput = screen.getByTestId("freeTakeInput");
    const intakeNumberInput = screen.getByTestId("intakeNumberInput");
    const intakeFrequencyInput = screen.getByTestId("intakeFrequencyInput");
    await userEvent.click(freeTakeInput);

    await userEvent.click(freeTakeInput);

    expect(freeTakeInput).not.toBeChecked();
    expect(intakeNumberInput).not.toBeDisabled();
    expect(intakeFrequencyInput).not.toBeDisabled();
  });
  it("Should enable time of intake inputs when intake number value increase", async () => {
    render(
      <MedicationDetailsModal
        show={true}
        recipient={{ id: 1, first_name: "John", last_name: "Doe" }}
        treatment={treatment[0]}
        medication={medication}
        treatmentsData={[]}
      />,
      {
        wrapper: ProviderWrapper,
      },
    );

    const intakeNumberInput = screen.getByTestId("intakeNumberInput");
    const timeOfIntakes = screen.getAllByTestId(/timeOfIntake_/);

    expect(intakeNumberInput.value).toBe("3");

    timeOfIntakes.forEach((time) => {
      expect(time).not.toBeDisabled();
    });
  });
  it("Should disable remaining time of intake inputs when intake number value is equal to the number of selected time of intake inputs", async () => {
    render(
      <MedicationDetailsModal
        show={true}
        recipient={{ id: 1, first_name: "John", last_name: "Doe" }}
        treatment={treatment[1]}
        medication={medication}
        treatmentsData={[]}
      />,
      {
        wrapper: ProviderWrapper,
      },
    );

    const intakeNumberInput = screen.getByTestId("intakeNumberInput");
    const morningTimeIntake = screen.getByTestId("timeOfIntake_morning");
    const middayTimeIntake = screen.getByTestId("timeOfIntake_midday");
    const eveningTimeIntake = screen.getByTestId("timeOfIntake_evening");

    await userEvent.click(middayTimeIntake);

    await new Promise((p) => setTimeout(p, 1000));

    expect(intakeNumberInput.value).toBe("2");
    expect(morningTimeIntake).not.toBeDisabled();
    expect(middayTimeIntake).not.toBeDisabled();
    expect(eveningTimeIntake).toBeDisabled();
  });
});
