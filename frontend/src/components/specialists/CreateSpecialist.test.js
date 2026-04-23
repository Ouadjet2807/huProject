import CreateSpecialist from "./CreateSpecialist";
import { render, screen } from "@testing-library/react";
import { AuthProvider } from "../../context/AuthContext";
import { store } from "../../redux/store";
import { Provider } from "react-redux";
import { BrowserRouter, MemoryRouter, Route, Routes } from "react-router";
import { ToastProvider } from "../../context/ToastContext";
import { ConfirmProvider } from "../../context/ConfirmContext";
import { act } from "react";
import { UseDimensionProvider } from "../../context/UseDimensionsContext";
import userEvent from "@testing-library/user-event";

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
        <CreateSpecialist
          show={true}
          recipient={{
            id: 5,
            first_name: "John",
            last_name: "Doe",
            birth_date: "1998-02-20",
          }}
        />,
        { wrapper: ProviderWrapper },
      );
    });

    const title = screen.getByTestId("title");

    const nameInput = screen.getByPlaceholderText(/nom/i);
    const specialityInput = screen.getByPlaceholderText(/spécialité/i);
    const addressInput = screen.getByPlaceholderText(/adresse/i);
    const phoneNumberInput = screen.getByPlaceholderText(/téléphone/i);
    const notesInput = screen.getByPlaceholderText(/notes/i);
    const submitButton = screen.getByTestId("submitButton")

    expect(title).toBeInTheDocument();
    expect(title).toHaveTextContent(/ajouter un/i);
    expect(nameInput).toBeInTheDocument();
    expect(specialityInput).toBeInTheDocument();
    expect(addressInput).toBeInTheDocument();
    expect(phoneNumberInput).toBeInTheDocument();
    expect(notesInput).toBeInTheDocument();
    expect(submitButton).toBeInTheDocument()
    expect(submitButton).toHaveTextContent(/ajouter/i)
  });
  it("Should prefill form if preloaded data are provided", async () => {
    await act(async () => {
      render(
        <CreateSpecialist
          show={true}
          recipient={{
            id: 5,
            first_name: "John",
            last_name: "Doe",
            birth_date: "1998-02-20",
          }}
          preloadedData={{
            contact: {
              address: { number: "10", street: "Street", city: "ZipCode City" },
              phone_number: "234235234",
            },
            id: "1",
            name: "Jack Doe",
            notes: "Test notes",
            space: "1",
            specialty: "Test",
          }}
        />,
        { wrapper: ProviderWrapper },
      );
    });

    const nameInput = screen.getByPlaceholderText(/nom/i);
    const specialityInput = screen.getByPlaceholderText(/spécialité/i);
    const addressInput = screen.getByPlaceholderText(/adresse/i);
    const phoneNumberInput = screen.getByPlaceholderText(/téléphone/i);
    const notesInput = screen.getByPlaceholderText(/notes/i);
    const editModeButton = screen.getByTestId("editModeButton")

    expect(nameInput).toBeDisabled();
    expect(specialityInput).toBeDisabled();
    expect(addressInput).toBeDisabled();
    expect(phoneNumberInput).toBeDisabled();
    expect(notesInput).toBeDisabled();

    expect(nameInput.value).toBe("Jack Doe");
    expect(specialityInput.value).toBe("Test");
    expect(addressInput.value).toBe("10 Street ZipCode City");
    expect(phoneNumberInput.value).toBe("234235234");
    expect(notesInput.value).toBe("Test notes");
    expect(editModeButton).toBeInTheDocument()
    expect(editModeButton).toHaveTextContent(/modifier/i)
  });
  it("Should enable inputs when user click on edit button", async () => {
    await act(async () => {
      render(
        <CreateSpecialist
          show={true}
          recipient={{
            id: 5,
            first_name: "John",
            last_name: "Doe",
            birth_date: "1998-02-20",
          }}
          preloadedData={{
            contact: {
              address: { number: "10", street: "Street", city: "ZipCode City" },
              phone_number: "234235234",
            },
            id: "1",
            name: "Jack Doe",
            notes: "Test notes",
            space: "1",
            specialty: "Test",
          }}
        />,
        { wrapper: ProviderWrapper },
      );
    });

    const nameInput = screen.getByPlaceholderText(/nom/i);
    const specialityInput = screen.getByPlaceholderText(/spécialité/i);
    const addressInput = screen.getByPlaceholderText(/adresse/i);
    const phoneNumberInput = screen.getByPlaceholderText(/téléphone/i);
    const notesInput = screen.getByPlaceholderText(/notes/i);
    const editModeButton = screen.getByTestId('editModeButton')
    
    
    await userEvent.click(editModeButton)
    
    const submitButton = screen.getByTestId("submitButton")

    expect(nameInput).not.toBeDisabled();
    expect(specialityInput).not.toBeDisabled();
    expect(addressInput).not.toBeDisabled();
    expect(phoneNumberInput).not.toBeDisabled();
    expect(notesInput).not.toBeDisabled();
    expect(submitButton).toHaveTextContent(/enregistrer/i);

  });
  it("Should enable inputs when user click on edit button", async () => {
    await act(async () => {
      render(
        <CreateSpecialist
          show={true}
          recipient={{
            id: 5,
            first_name: "John",
            last_name: "Doe",
            birth_date: "1998-02-20",
          }}
          preloadedData={{
            contact: {
              address: { number: "10", street: "Street", city: "ZipCode City" },
              phone_number: "234235234",
            },
            id: "1",
            name: "Jack Doe",
            notes: "Test notes",
            space: "1",
            specialty: "Test",
          }}
        />,
        { wrapper: ProviderWrapper },
      );
    });

    const nameInput = screen.getByPlaceholderText(/nom/i);
    const specialityInput = screen.getByPlaceholderText(/spécialité/i);
    const addressInput = screen.getByPlaceholderText(/adresse/i);
    const phoneNumberInput = screen.getByPlaceholderText(/téléphone/i);
    const notesInput = screen.getByPlaceholderText(/notes/i);

    const cancelButton = screen.getByTestId('cancelButton')

    await userEvent.click(cancelButton)

    expect(nameInput).toBeDisabled();
    expect(specialityInput).toBeDisabled();
    expect(addressInput).toBeDisabled();
    expect(phoneNumberInput).toBeDisabled();
    expect(notesInput).toBeDisabled();

  });
  // it("Should show address suggestions when user type in address input", async () => {
  //   await act(async () => {
  //     render(
  //       <CreateSpecialist
  //         show={true}
  //         recipient={{
  //           id: 5,
  //           first_name: "John",
  //           last_name: "Doe",
  //           birth_date: "1998-02-20",
  //         }}
  //       />,
  //       { wrapper: ProviderWrapper },
  //     );
  //   });

  //   const addressInput = screen.getByPlaceholderText(/adresse/i);
  //   const addressSuggestions = screen.getByTestId('addressSuggestions')

  //   await userEvent.type(addressInput, 'aaa')

  //   expect(addressSuggestions).toBeInTheDocument()

  // });
  it("Should ignore 0 as first char for phone number input", async () => {
    await act(async () => {
      render(
        <CreateSpecialist
          show={true}
          recipient={{
            id: 5,
            first_name: "John",
            last_name: "Doe",
            birth_date: "1998-02-20",
          }}
        />,
        { wrapper: ProviderWrapper },
      );
    });

    const phoneNumberInput = screen.getByPlaceholderText(/téléphone/i);

    await userEvent.type(phoneNumberInput, '01')

    expect(phoneNumberInput.value).toBe('1')

  });
});
