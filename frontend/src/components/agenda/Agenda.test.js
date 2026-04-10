import Agenda from "./Agenda";
import { render, screen } from "@testing-library/react";
import { AuthProvider } from "../../context/AuthContext";
import { store } from "../../redux/store";
import { Provider } from "react-redux";
import { BrowserRouter } from "react-router";
import { ToastProvider } from "../../context/ToastContext";
import { ConfirmProvider } from "../../context/ConfirmContext";

// test("Check if user can edit", () => {
//   const result = canEdit(3);
//   expect(result).toBe(false);
// });

describe("Agenda", () => {
    delete window.location;
    window.location = {
      reload: jest.fn(),
      href: "http://dummy.com?page=1&name=testing",
    };
  test("Should render without crash", async () => {
    render(
      <Provider store={store}>
        <AuthProvider>
          <ToastProvider>
            <ConfirmProvider>
              <BrowserRouter>
                <Agenda />
              </BrowserRouter>
            </ConfirmProvider>
          </ToastProvider>
        </AuthProvider>
      </Provider>,
    );

    const date_options = {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    };
    const date = screen.getByTestId("date");
    expect(date.textContent).toBe(
      new Date().toLocaleDateString("fr-Fr", date_options),
    );
  });
});
