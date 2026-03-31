import TreatmentPage from "./TreatmentPage";
import { render } from "@testing-library/react";
import { AuthProvider } from "../../context/AuthContext";
import { store } from "../../redux/store";
import { Provider } from "react-redux";
import { BrowserRouter } from "react-router";
import { ToastProvider } from "../../context/ToastContext";
import { ConfirmProvider } from "../../context/ConfirmContext";
import { act } from "react";

describe("TreatmentPage", () => {
  test("Should render without crash", async () => {
    delete window.location;
    window.location = {
      reload: jest.fn(),
      href: "http://dummy.com?page=1&name=testing",
    };

    await act(async () => {
      render(
        <Provider store={store}>
          <AuthProvider>
            <ToastProvider>
              <ConfirmProvider>
                <BrowserRouter>
                  <TreatmentPage/>
                </BrowserRouter>
              </ConfirmProvider>
            </ToastProvider>
          </AuthProvider>
        </Provider>,
      );
    });
  });
});
