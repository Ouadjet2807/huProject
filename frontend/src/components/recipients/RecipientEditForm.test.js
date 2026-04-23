import RecipientEditForm from "./RecipientEditForm";
import { render, screen } from "@testing-library/react";
import { AuthProvider } from "../../context/AuthContext";
import { store } from "../../redux/store";
import { Provider } from "react-redux";
import { BrowserRouter, MemoryRouter, Route, Routes } from "react-router";
import { ToastProvider } from "../../context/ToastContext";
import { ConfirmProvider } from "../../context/ConfirmContext";
import { setValues } from "../../redux/spaceSlice";
import { act } from "react";
import Recipient from "../../pages/Recipient";
import { UseDimensionProvider } from "../../context/UseDimensionsContext";
import userEvent from "@testing-library/user-event";

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
describe("RecipientEditForm", () => {
  delete window.location;
  window.location = {
    reload: jest.fn(),
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
            gender: "N"
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

    const heading = await screen.findByRole("heading", { level: 3 });
    const form = await screen.findByRole("form")
    const firstNameInput = await screen.findByRole("firstNameInput")
    const lastNameInput = await screen.findByRole("lastNameInput")
    const birthDateInput = await screen.findByRole("birthDateInput")
    const genderInput = await screen.findByRole("genderInput")

    expect(heading).toBeInTheDocument()
    expect(heading).toHaveTextContent(/général/i)
    expect(form).toBeInTheDocument()
    expect(firstNameInput).toBeInTheDocument()
    expect(lastNameInput).toBeInTheDocument()
    expect(birthDateInput).toBeInTheDocument()
    expect(genderInput).toBeInTheDocument()
    expect(firstNameInput).toBeDisabled()
    expect(lastNameInput).toBeDisabled()
    expect(birthDateInput).toBeDisabled()
    expect(genderInput).toBeDisabled()
    expect(firstNameInput.value).toBe("John")
    expect(lastNameInput.value).toBe("Doe")
    expect(birthDateInput.value).toBe("1998-02-20")
    expect(genderInput.value).toBe("N")
  });
  it("Should enable inputs when user clicks on the edit mode button", async () => {
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
            gender: "N"
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

    const editModeButton = screen.getByTestId("editModeButton")

    expect(editModeButton).toBeInTheDocument()
    expect(editModeButton).toHaveTextContent(/modifier/i)

    await userEvent.click(editModeButton)

    const firstNameInput = await screen.findByRole("firstNameInput")
    const lastNameInput = await screen.findByRole("lastNameInput")
    const birthDateInput = await screen.findByRole("birthDateInput")
    const genderInput = await screen.findByRole("genderInput")

    expect(firstNameInput).not.toBeDisabled()
    expect(lastNameInput).not.toBeDisabled()
    expect(birthDateInput).not.toBeDisabled()
    expect(genderInput).not.toBeDisabled()
  });
  it("Should disable inputs when user clicks on the cancel button in edit mode", async () => {
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
            gender: "N"
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
    const editModeButton = screen.getByTestId("editModeButton")
    await userEvent.click(editModeButton)

    expect(editModeButton).toHaveTextContent(/annuler/i)
    await userEvent.click(editModeButton)

    const firstNameInput = await screen.findByRole("firstNameInput")
    const lastNameInput = await screen.findByRole("lastNameInput")
    const birthDateInput = await screen.findByRole("birthDateInput")
    const genderInput = await screen.findByRole("genderInput")

    expect(firstNameInput).toBeDisabled()
    expect(lastNameInput).toBeDisabled()
    expect(birthDateInput).toBeDisabled()
    expect(genderInput).toBeDisabled()
  });
  it("Should add text input when user clicks on add field", async () => {
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
            gender: "N"
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
    const addFieldButton = screen.getByTestId("addFieldButton")
    expect(addFieldButton).toBeInTheDocument()
    expect(addFieldButton).toHaveTextContent(/ajouter une allergie/i)
    await userEvent.click(addFieldButton)

    const fields = screen.getAllByTestId(/field_/)

    expect(fields.length).toBeGreaterThan(1)

    fields.forEach(field => {
      expect(field).toBeInTheDocument()
    })
  });
    it("Should remove text input when user clicks on delete field", async () => {
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
            gender: "N"
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
    const addFieldButton = screen.getByTestId("addFieldButton")
    await userEvent.click(addFieldButton)

    const deleteFieldButtons = screen.getAllByTestId(/deleteFieldButton_/)

   await userEvent.click(deleteFieldButtons[1])

    const field_two = screen.queryByTestId("field_2")

    expect(field_two).not.toBeInTheDocument()
  });
  it("Should disable first input's delete button if there is only one field", async () => {
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
            gender: "N"
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

   const deleteButton = screen.getByTestId("deleteFieldButton_1")
   expect(deleteButton).toBeDisabled()

  });
  it("Should enable first input's delete button if there is more than one field", async () => {
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
            gender: "N"
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

   const addFieldButton = screen.getByTestId('addFieldButton')
   await userEvent.click(addFieldButton)

   const deleteButton = screen.getByTestId("deleteFieldButton_1")
   expect(deleteButton).not.toBeDisabled()

  });

});
