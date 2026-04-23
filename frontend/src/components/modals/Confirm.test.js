import Confirm from "./Confirm";
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
              <BrowserRouter>
                {children}
              </BrowserRouter>
            </ConfirmProvider>
          </ToastProvider>
        </AuthProvider>
      </Provider>
)

describe("CreateRecipient", () => {
    delete window.location;
    window.location = {
      reload: jest.fn(),
      href: "http://dummy.com?page=1&name=testing",
    };
  it("Should render without crash", async () => {
    render (
      <Confirm text="Title" show={true}/>, {wrapper: ProviderWrapper}
    );

    const title = screen.getByTestId("title")
    const message = screen.getByTestId("message")
    const confirmButton = screen.getByTestId("confirmButton")
    const cancelButton = screen.getByTestId("cancelButton")

    expect(title).toBeInTheDocument()
    expect(message).toBeInTheDocument()
    expect(confirmButton).toBeInTheDocument()
    expect(cancelButton).toBeInTheDocument()
    
    expect(title).toHaveTextContent('Title')
    expect(message).toHaveTextContent("Cette action est irréversible")
    expect(confirmButton).toHaveTextContent(/supprimer/i)
    expect(cancelButton).toHaveTextContent(/annuler/i)
  });
});
