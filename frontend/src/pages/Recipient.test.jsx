import Recipient from "./Recipient";
import { render, screen } from "@testing-library/react";
import { AuthProvider } from "../context/AuthContext";
import { store } from "../redux/store";
import { Provider } from "react-redux";
import { BrowserRouter, MemoryRouter, Routes, Route } from "react-router";
import { ToastProvider } from "../context/ToastContext";
import { ConfirmProvider } from "../context/ConfirmContext";
import userEvent from "@testing-library/user-event";
import { setValues } from "../redux/spaceSlice";
import { act } from "react";
import moment from "moment";
import { locale } from "moment";
import { UseDimensionProvider } from "../context/UseDimensionsContext";
import RecipientTreatments from "../components/treatments/RecipientTreatments";

moment.locale("fr");

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
describe("Recipient", () => {
  delete window.location;
  window.location = {
    reload: vi.fn(),
    assign: vi.fn(),
    pathname: "http://test.com/recipient/5",
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
            treatments: [],
          },
        ],
        todos: [],
        updated_at: "",
      }),
    );
    const route = "/recipient/5";
    await act(async () => {
      render(
        <MemoryRouter initialEntries={[route]}>
          <Routes>
            <Route path="/recipient/:id" element={<Recipient />} />
          </Routes>
        </MemoryRouter>,

        { wrapper: ProviderWrapper },
      );
    });

    const heading = screen.getByRole("heading", { level: 2 });
    const recipientAge = screen.getByTestId("recipientAge");
    expect(heading).toBeInTheDocument();
    expect(heading).toHaveTextContent("John Doe");
    expect(recipientAge).toBeInTheDocument();
    expect(recipientAge).toHaveTextContent(
      `${moment().diff("1998-02-20", "years")} ans`,
    );

    const generalSectionComponent = screen.getByTestId(
      "generalSectionComponent",
    );
    expect(generalSectionComponent).toBeInTheDocument();
  });
  it("Should display treatment component when user click on treatment tab", async () => {
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
            treatments: [],
          },
        ],
        todos: [],
        updated_at: "",
      }),
    );
    const route = "/recipient/5";
    await act(async () => {
      render(
        <MemoryRouter initialEntries={[route]}>
          <Routes>
            <Route path="/recipient/:id" element={<Recipient />} />
            <Route
              path="recipient/:id/treatments/"
              element={<Recipient tab="treatments" />}
            />
          </Routes>
        </MemoryRouter>,

        { wrapper: ProviderWrapper },
      );
    });

    const treatmentsTab = screen.getByTestId("treatmentsTab");

    expect(treatmentsTab).toBeInTheDocument();

    await userEvent.click(treatmentsTab);

    const treatmentsComponent = await screen.findByTestId(
      "treatmentsComponent",
    );
    expect(treatmentsComponent).toBeInTheDocument();
  });
  it("Should display treatment component when user click on treatment tab", async () => {
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
            treatments: [],
          },
        ],
        todos: [],
        updated_at: "",
      }),
    );
    const route = "/recipient/5";
    await act(async () => {
      render(
        <MemoryRouter initialEntries={[route]}>
          <Routes>
            <Route path="/recipient/:id" element={<Recipient />} />
            <Route
              path="recipient/:id/specialists/"
              element={<Recipient tab="specialists" />}
            />
          </Routes>
        </MemoryRouter>,

        { wrapper: ProviderWrapper },
      );
    });

    const specialistsTab = screen.getByTestId("specialistsTab");

    expect(specialistsTab).toBeInTheDocument();

    await userEvent.click(specialistsTab);

    const specialistsComponent = await screen.findByTestId(
      "specialistsComponent",
    );
    expect(specialistsComponent).toBeInTheDocument();
  });
  it("Should display general info component when user click on general info tab", async () => {
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
            treatments: [],
          },
        ],
        todos: [],
        updated_at: "",
      }),
    );
    const route = "/recipient/5";
    await act(async () => {
      render(
        <MemoryRouter initialEntries={[route]}>
          <Routes>
            <Route path="/recipient/:id" element={<Recipient />} />
            <Route
              path="recipient/:id/treatments/"
              element={<Recipient tab="treatments" />}
            />
          </Routes>
        </MemoryRouter>,

        { wrapper: ProviderWrapper },
      );
    });

    const treatmentsTab = screen.getByTestId("treatmentsTab");
    const generalTab = await screen.findByTestId("generalTab");

    await userEvent.click(treatmentsTab);
    expect(generalTab).toBeInTheDocument();

    await userEvent.click(generalTab);

    const generalSectionComponent = await screen.findByTestId(
      "generalSectionComponent",
    );
    expect(generalSectionComponent).toBeInTheDocument();
  });
});
