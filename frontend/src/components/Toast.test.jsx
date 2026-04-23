import Toast from "./Toast";
import { Provider } from "react-redux";
import { render, screen } from "@testing-library/react";
import { AuthProvider } from "../context/AuthContext";
import { ToastProvider } from "../context/ToastContext";
import { ConfirmProvider } from "../context/ConfirmContext";
import { store } from "../redux/store";
import { BrowserRouter } from "react-router";

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

describe("Toast", () => {
  delete window.location;
  window.location = {
    reload: vi.fn(),
    href: "http://dummy.com?page=1&name=testing",
  };
  it("Should render without crash", async () => {
    render (<Toast message="toast message"/>
    ,{wrapper: ProviderWrapper}
    );

    const message = screen.getByTestId("toastMessage")
    expect(message).toBeInTheDocument()
    expect(message).toHaveTextContent("toast message")
  });
  it("Should render 'Succès' as heading when color is 'success'", async () => {
    render (<Toast message="toast message" color="success"/>
    ,{wrapper: ProviderWrapper}
    );

    const status = screen.getByTestId("toastStatus")
    expect(status).toBeInTheDocument()
    expect(status).toHaveTextContent(/succès/i)
  });
  it("Should render 'Erreur' as heading when color is 'danger'", async () => {
    render (<Toast message="toast message" color="danger"/>
    ,{wrapper: ProviderWrapper}
    );

    const status = screen.getByTestId("toastStatus")
    expect(status).toBeInTheDocument()
    expect(status).toHaveTextContent(/erreur/i)
  });
});
