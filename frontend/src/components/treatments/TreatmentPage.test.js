import TreatmentPage from "./TreatmentPage";
import { render, screen } from "@testing-library/react";
import { AuthProvider } from "../../context/AuthContext";
import { store } from "../../redux/store";
import { Provider } from "react-redux";
import { BrowserRouter } from "react-router";
import { ToastProvider } from "../../context/ToastContext";
import { ConfirmProvider } from "../../context/ConfirmContext";
import { act } from "react";

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
describe("TreatmentPage", () => {
  delete window.location;
  window.location = {
    reload: jest.fn(),
    href: "http://dummy.com?page=1&name=testing",
  };
  it("Should render without crash", async () => {

    await act(async () => {
      render (<TreatmentPage />
          ,{wrapper: ProviderWrapper}
          );

        });
        // const heading = screen.getByRole("heading", {level: 3})
        // expect(heading).toBeInTheDocument()
  });
});
