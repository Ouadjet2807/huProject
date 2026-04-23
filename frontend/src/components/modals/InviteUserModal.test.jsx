import InviteUserModal from "./InviteUserModal";
import { render, screen } from "@testing-library/react";
import { AuthProvider } from "../../context/AuthContext";
import { store } from "../../redux/store";
import { Provider } from "react-redux";
import { BrowserRouter } from "react-router";
import { ToastProvider } from "../../context/ToastContext";
import { ConfirmProvider } from "../../context/ConfirmContext";

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
describe("CreateRecipient", () => {
    delete window.location;
    window.location = {
      reload: vi.fn(),
      href: "http://dummy.com?page=1&name=testing",
    };
  it("Should render without crash", async () => {
     render(
         <InviteUserModal show={true}/>,
          {
            wrapper: ProviderWrapper,
          },
        );

    const title = screen.getByTestId("title")
    const emailInput = screen.getByPlaceholderText(/email/i)
    const accessLevelInput = screen.getByTestId("accessLevelInput")

    expect(title).toBeInTheDocument()
    expect(emailInput).toBeInTheDocument()
    expect(accessLevelInput).toBeInTheDocument()
    expect(accessLevelInput.value).toBe("1")
  });
});
