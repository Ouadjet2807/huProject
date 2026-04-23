import { Provider } from "react-redux";
import AcceptInvite from "./AcceptInvite";
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
                { children }
              </BrowserRouter>
            </ConfirmProvider>
          </ToastProvider>
        </AuthProvider>
      </Provider>
)

describe("AcceptInvite", () => {
  delete window.location;
  window.location = {
    reload: vi.fn(),
    href: "http://dummy.com?page=1&name=testing",
  };
  it("Should render without crash", async () => {
    render (
       <AcceptInvite />, {wrapper: ProviderWrapper}
    );

    expect(screen.getByTestId("registerComponent")).toBeInTheDocument()
  });
});
