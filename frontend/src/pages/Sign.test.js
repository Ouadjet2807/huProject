import { Provider } from "react-redux";
import { render, screen } from "@testing-library/react";
import { AuthProvider } from "../context/AuthContext";
import { ToastProvider } from "../context/ToastContext";
import { ConfirmProvider } from "../context/ConfirmContext";
import { store } from "../redux/store";
import { BrowserRouter } from "react-router";
import userEvent from "@testing-library/user-event";
import Profile from "../components/account/Profile";
import Space from "../components/account/Space";
import Sign from "./Sign";

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

describe("Sign", () => {
  delete window.location;
  window.location = {
    reload: jest.fn(),
    href: "http://dummy.com?page=1&name=testing",
  };
  it("Should render without crash", async () => {
    render(<Sign />, { wrapper: ProviderWrapper });
  });
  it("Should display register component when user click on register tab", async () => {
    render(<Sign />, {wrapper: ProviderWrapper})

    const registerTab = screen.getByTestId("registerTab")

    await userEvent.click(registerTab)

    expect(screen.getByTestId('registerComponent')).toBeInTheDocument()

  })
  it("Should display login component when user click on login tab", async () => {
    render(<Sign />, {wrapper: ProviderWrapper})

    const loginTab = screen.getByTestId("loginTab")

    await userEvent.click(loginTab)

    expect(screen.getByTestId('loginComponent')).toBeInTheDocument()
  })
})