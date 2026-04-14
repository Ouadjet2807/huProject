import Register from "./Register";
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

describe("Register", () => {
  delete window.location;
  window.location = {
    reload: jest.fn(),
    href: "http://dummy.com?page=1&name=testing",
  };
  it("Should render without crash", async () => {
    render(<Register loading={false} message={{status: "", message: ""}}/>, { wrapper: ProviderWrapper });

    const heading = screen.getByRole('heading', {level: 2})
    const inputs = screen.getAllByPlaceholderText(/mot de passe/i);
    const button = screen.getByRole('button')

    expect(heading).toBeInTheDocument()
    expect(heading).toHaveTextContent(/inscri/i)
    expect(button).toBeInTheDocument()
    expect(button).toHaveTextContent(/inscription/i)

     inputs.forEach(input => {
      expect(input.type).toBe("password");
    })
  });
  it("Should show password when user click on show password icon", async () => {
    render(<Register loading={false} message={{status: "", message: ""}}/>, { wrapper: ProviderWrapper });

    const showPassword = screen.getAllByTestId("showPassword")

    await userEvent.click(showPassword[0])

    await userEvent.click(showPassword[1])

    const inputs = screen.getAllByPlaceholderText(/mot de passe/i);

    expect(inputs[0].type).toBe('text')
    expect(inputs[1].type).toBe('text')

    });
  it("Should enable button when loading is false", async () => {
    render(<Register loading={false} message={{status: "", message: ""}}/>, { wrapper: ProviderWrapper });

    const registerButon = screen.getByTestId("registerButton")

    expect(registerButon).not.toBeDisabled()
    });
  it("Should disable button when loading is true", async () => {
    render(<Register loading={true} message={{status: "", message: ""}}/>, { wrapper: ProviderWrapper });

    const registerButon = screen.getByTestId("registerButton")

    expect(registerButon).toBeDisabled()
    });
      it("Should not display loader when loading is false", async () => {
        render(<Register loading={false} message={{status: "", message: ""}} />, { wrapper: ProviderWrapper });
    
        const loader = screen.queryByTestId("loader");
    
        expect(loader).not.toBeInTheDocument()
      });
      it("Should display loader when loading is true", async () => {
        render(<Register loading={true} message={{status: "", message: ""}} />, { wrapper: ProviderWrapper });
    
        const loader = screen.getByTestId("loader");
    
        expect(loader).toBeInTheDocument()
      });
});
