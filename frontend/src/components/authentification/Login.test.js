import Login from "./Login";
import { render, screen } from "@testing-library/react";
import { AuthProvider } from "../../context/AuthContext";
import { store } from "../../redux/store";
import { Provider } from "react-redux";
import { BrowserRouter } from "react-router";
import { ToastProvider } from "../../context/ToastContext";
import { ConfirmProvider } from "../../context/ConfirmContext";
import userEvent from "@testing-library/user-event";

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

describe("Login", () => {
  delete window.location;
  window.location = {
    reload: jest.fn(),
    href: "http://dummy.com?page=1&name=testing",
  };
  it("Should render without crash", async () => {
    render(<Login loading={false} message={{status: "", message: ""}}/>, { wrapper: ProviderWrapper });

    const inputs = screen.getAllByPlaceholderText(/mot de passe/i);

    inputs.forEach((input) => {
      expect(input.type).toBe("password");
    });
  });
  it("Should show password when user click on show password icon", async () => {
    render(<Login loading={false} message={{status: "", message: ""}}/>, { wrapper: ProviderWrapper });

    const showPassword = screen.getByTestId("showPassword");

    await userEvent.click(showPassword);

    const input = screen.getByPlaceholderText(/mot de passe/i);

    expect(input.type).toBe("text");
  });
  it("Should enable button when loading is false", () => {
    render(<Login loading={false} message={{status: "", message: ""}} />, { wrapper: ProviderWrapper });

    const loginButton = screen.getByTestId("loginButton");

    expect(loginButton).not.toBeDisabled()
  })
  it("Should disable button when loading is true", async () => {
    render(<Login loading={true} message={{status: "", message: ""}} />, { wrapper: ProviderWrapper });

    const loginButton = screen.getByTestId("loginButton");

    expect(loginButton).toBeDisabled()
  });
  it("Should not display loader when loading is false", async () => {
    render(<Login loading={false} message={{status: "", message: ""}} />, { wrapper: ProviderWrapper });

    const loader = screen.queryByTestId("loader");

    expect(loader).not.toBeInTheDocument()
  });
  it("Should display loader when loading is true", async () => {
    render(<Login loading={true} message={{status: "", message: ""}} />, { wrapper: ProviderWrapper });

    const loader = screen.getByTestId("loader");

    expect(loader).toBeInTheDocument()
  });
});
