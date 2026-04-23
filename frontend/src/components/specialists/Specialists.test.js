import { render, screen } from "@testing-library/react";
import { AuthProvider } from "../../context/AuthContext";
import { store } from "../../redux/store";
import { Provider } from "react-redux";
import { BrowserRouter, MemoryRouter, Route, Routes } from "react-router";
import { ToastProvider } from "../../context/ToastContext";
import { ConfirmProvider } from "../../context/ConfirmContext";
import { act } from "react";
import { UseDimensionProvider } from "../../context/UseDimensionsContext";
import Specialists from "./Specialists";

const ProviderWrapper = ({ children }) => (
  <Provider store={store}>
    <UseDimensionProvider>
      <AuthProvider>
        <ToastProvider>
          <ConfirmProvider>
            <BrowserRouter>{children}</BrowserRouter>
          </ConfirmProvider>
        </ToastProvider>
      </AuthProvider>
    </UseDimensionProvider>
  </Provider>
);

describe("CreateSpecialist", () => {
  delete window.location;
  window.location = {
    reload: jest.fn(),
    href: "http://dummy.com?page=1&name=testing",
  };
  it("Should render without crash", async () => {
    await act(async () => {
      render(
        <Specialists
          recipient={{
            id: 5,
            first_name: "John",
            last_name: "Doe",
            birth_date: "1998-02-20",
            healthcare_professionals: [],
          }}
        />,

        { wrapper: ProviderWrapper },
      );
    });

    const heading = screen.getByRole("heading", { level: 3 });
    const addSpecialistButton = screen.getByTestId("addSpecialistButton");

    expect(heading).toBeInTheDocument();
    expect(heading).toHaveTextContent(/spécialistes/i);
    expect(addSpecialistButton).toBeInTheDocument();
    expect(addSpecialistButton).toHaveTextContent(/Ajouter un specialiste/i);
  });
  it("Should render 'aucun spécialiste' when specialists array is not provided", async () => {
    await act(async () => {
      render(
        <Specialists
          recipient={{
            id: 5,
            first_name: "John",
            last_name: "Doe",
            birth_date: "1998-02-20",
            healthcare_professionals: [],
          }}
        />,

        { wrapper: ProviderWrapper },
      );
    });

    const noSpecialist = screen.getByTestId("noSpecialist")
    expect(noSpecialist).toBeInTheDocument()
    expect(noSpecialist).toHaveTextContent(/aucun spécialiste/i)
  });
  it("Should render specialists when specialists array is provided", async () => {
    await act(async () => {
      render(
        <Specialists
          recipient={{
            id: 5,
            first_name: "John",
            last_name: "Doe",
            birth_date: "1998-02-20",
            healthcare_professionals: [   {
                contact:
                  '{"address":"Test, 31440 Test","phone_number":["234235234"]}',
                id: "1",
                name: "Jack Doe",
                notes: "",
                space: "1",
                specialty: "Test",
              },],
          }}
        />,

        { wrapper: ProviderWrapper },
      );
    });

    const specialistName = screen.getByTestId("specialistName");
    const specialistSpecialty = screen.getByTestId("specialistSpecialty");
    const specialistAddress = screen.getByTestId("specialistAddress");
    const specialistPhoneNumber = screen.getByTestId("specialistPhoneNumber");

    expect(specialistName).toBeInTheDocument();
    expect(specialistSpecialty).toBeInTheDocument();
    expect(specialistAddress).toBeInTheDocument();
    expect(specialistPhoneNumber).toBeInTheDocument();
    expect(specialistName).toHaveTextContent("Jack Doe");
    expect(specialistSpecialty).toHaveTextContent("Test");
    expect(specialistAddress).toHaveTextContent("31440 Test");
    expect(specialistPhoneNumber).toHaveTextContent("02 34 23 52 34");
  });
});
