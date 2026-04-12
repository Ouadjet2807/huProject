import Account from "./Account";
import { Provider } from "react-redux";
import { render, screen } from "@testing-library/react";
import { AuthProvider } from "../context/AuthContext";
import { ToastProvider } from "../context/ToastContext";
import { ConfirmProvider } from "../context/ConfirmContext";
import { store } from "../redux/store";
import { BrowserRouter } from "react-router";
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

describe("Account", () => {
  delete window.location;
  window.location = {
    reload: jest.fn(),
    href: "http://dummy.com?page=1&name=testing",
  };
  it("Should render without crash", async () => {
    render(<Account />, { wrapper: ProviderWrapper });
  });
  it("Should render profile tab when user click on list item", async () => {
    render(<Account />, { wrapper: ProviderWrapper });

    const profileTab = screen.getByTestId('profileTab')

    await userEvent.click(profileTab)

    expect(screen.getByTestId("profileComponent")).toBeInTheDocument()
  });
  it("Should render space tab when user click on list item", async () => {
    render(<Account />, { wrapper: ProviderWrapper });

    const spaceTab = screen.getByTestId('spaceTab')

    await userEvent.click(spaceTab)

    expect(screen.getByTestId("spaceComponent")).toBeInTheDocument()
  });
});
