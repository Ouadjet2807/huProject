import RecipientTreatments from "./RecipientTreatments";
import { render, screen } from "@testing-library/react";
import { AuthProvider } from "../../context/AuthContext";
import { store } from "../../redux/store";
import { Provider } from "react-redux";
import { MemoryRouter, Route, Routes } from "react-router";
import { ToastProvider } from "../../context/ToastContext";
import { ConfirmProvider } from "../../context/ConfirmContext";
import { act } from "react";
import { UseDimensionProvider } from "../../context/UseDimensionsContext";
import Recipient from "../../pages/Recipient";
import { setValues } from "../../redux/spaceSlice";
import userEvent from "@testing-library/user-event";
import { http } from 'msw'
import { server } from "../../mocks/node";
import { handlers as treatmentsHandlers } from '../../mocks/handlers/treatments'
import { handlers as archivedTreatmentsHandlers } from '../../mocks/handlers/archivedTreatments'
import { afterAll, afterEach } from "vitest";


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

describe("RecipientTreatments", () => {
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
        id: "",
        name: "",
        recipients: [
          {
            id: 5,
            first_name: "John",
            last_name: "Doe",
            birth_date: "1998-02-20",
            gender: "N",
            treatments: [],
          },
        ],
        todos: [],
        updated_at: "",
      }),
    );
    const route = "/recipient/5/treatments";

    await act(async () => {
      render(
        <MemoryRouter initialEntries={[route]}>
          <Routes>
            <Route
              path="/recipient/:id/treatments"
              element={<Recipient tab="treatments" />}
            />
          </Routes>
        </MemoryRouter>,
        { wrapper: ProviderWrapper },
      );
    });

    const heading = screen.getByRole("heading", { level: 3 });
    const archiveButton = screen.getByTestId("archiveButton");
    const addTreatmentButton = screen.getByTestId("addTreatmentButton");

    expect(heading).toBeInTheDocument();
    expect(heading).toHaveTextContent(/traitements médicaux/i);
    expect(archiveButton).toBeInTheDocument();
    expect(archiveButton).toHaveTextContent(/archive/i);
    expect(addTreatmentButton).toBeInTheDocument();
    expect(addTreatmentButton).toHaveTextContent(/ajouter/i);
    expect(addTreatmentButton).not.toBeDisabled();
  });
  it("Should render a list of treatments", async () => {
    server.use(...treatmentsHandlers)
    store.dispatch(
      setValues({
        agenda: {},
        caregivers: [],
        created_at: "",
        created_by: {},
        description: "",
        id: "",
        name: "",
        recipients: [
          {
            id: 5,
            first_name: "John",
            last_name: "Doe",
            birth_date: "1998-02-20",
            gender: "N",
            treatments: [],
          },
        ],
        todos: [],
        updated_at: "",
      }),
    );

    
    const route = "/recipient/5/treatments";

    await act(async () => {
      render(
        <MemoryRouter initialEntries={[route]}>
          <Routes>
            <Route
              path="/recipient/:id/treatments"
              element={<Recipient tab="treatments" />}
            />
          </Routes>
        </MemoryRouter>,
        { wrapper: ProviderWrapper },
      );
    });

    const heading = screen.getByRole("heading", { level: 3 });
    const archiveButton = screen.getByTestId("archiveButton");
    const addTreatmentButton = screen.getByTestId("addTreatmentButton");
    const treatments = screen.getAllByTestId('treatment')
    const expiredTreatments = screen.queryAllByTestId('expiredTreatment')
    const treatmentHeaders = screen.getAllByTestId("treatmentHeader")


    expect(heading).toBeInTheDocument();
    expect(heading).toHaveTextContent(/traitements médicaux/i);
    expect(archiveButton).toBeInTheDocument();
    expect(archiveButton).toHaveTextContent(/archive/i);
    expect(addTreatmentButton).toBeInTheDocument();
    expect(addTreatmentButton).toHaveTextContent(/ajouter/i);
    expect(addTreatmentButton).not.toBeDisabled();

    expect(treatments).toHaveLength(2)
    expect(expiredTreatments).toHaveLength(0)
    expect(treatmentHeaders).toHaveLength(2)

  });
  it("Should display archived treatments when user click on 'archives' button", async () => {

    server.use(...archivedTreatmentsHandlers)

    store.dispatch(
      setValues({
        agenda: {},
        caregivers: [],
        created_at: "",
        created_by: {},
        description: "",
        id: "",
        name: "",
        recipients: [
          {
            id: 5,
            first_name: "John",
            last_name: "Doe",
            birth_date: "1998-02-20",
            gender: "N",
            treatments: [],
          },
        ],
        todos: [],
        updated_at: "",
      }),
    );
    const route = "/recipient/5/treatments";

    await act(async () => {
      render(
        <MemoryRouter initialEntries={[route]}>
          <Routes>
            <Route
              path="/recipient/:id/treatments"
              element={<Recipient tab="treatments" />}
            />
          </Routes>
        </MemoryRouter>,
        { wrapper: ProviderWrapper },
      );
    });

    const archiveButton = screen.getByTestId("archiveButton");
    await userEvent.click(archiveButton);

    const treatments = screen.queryAllByTestId("treatment")
    const expiredTreatments = screen.getAllByTestId("expiredTreatment")

    expect(treatments).toHaveLength(0)
    expect(expiredTreatments).toHaveLength(2)
    expect(archiveButton).toHaveTextContent(/retour/i);

  });
  it("Should display 0 as remaining units for expired treatments", async () => {
    server.use(...archivedTreatmentsHandlers)
    store.dispatch(
      setValues({
        agenda: {},
        caregivers: [],
        created_at: "",
        created_by: {},
        description: "",
        id: "",
        name: "",
        recipients: [
          {
            id: 5,
            first_name: "John",
            last_name: "Doe",
            birth_date: "1998-02-20",
            gender: "N",
            treatments: [],
          },
        ],
        todos: [],
        updated_at: "",
      }),
    );
    const route = "/recipient/5/treatments";

    await act(async () => {
      render(
        <MemoryRouter initialEntries={[route]}>
          <Routes>
            <Route
              path="/recipient/:id/treatments"
              element={<Recipient tab="treatments" />}
            />
          </Routes>
        </MemoryRouter>,
        { wrapper: ProviderWrapper },
      );
    });

    const archiveButton = screen.getByTestId("archiveButton");
    await userEvent.click(archiveButton);

    const expiredTreatments = screen.getAllByTestId("expiredTreatment")
    const remainingUnits = screen.getAllByTestId("remainingUnits")
    remainingUnits.forEach(item => {
      expect(item).toHaveTextContent(/0/i)
    })

  });
  it("Should display current treatments when user click on 'back' button", async () => {
    store.dispatch(
      setValues({
        agenda: {},
        caregivers: [],
        created_at: "",
        created_by: {},
        description: "",
        id: "",
        name: "",
        recipients: [
          {
            id: 5,
            first_name: "John",
            last_name: "Doe",
            birth_date: "1998-02-20",
            gender: "N",
            treatments: [],
          },
        ],
        todos: [],
        updated_at: "",
      }),
    );
    const route = "/recipient/5/treatments";

    await act(async () => {
      render(
        <MemoryRouter initialEntries={[route]}>
          <Routes>
            <Route
              path="/recipient/:id/treatments"
              element={<Recipient tab="treatments" />}
            />
          </Routes>
        </MemoryRouter>,
        { wrapper: ProviderWrapper },
      );
    });

    const archiveButton = screen.getByTestId("archiveButton");
    await userEvent.click(archiveButton);

    await userEvent.click(archiveButton);

    expect(archiveButton).toHaveTextContent(/archives/i);
  });
});
