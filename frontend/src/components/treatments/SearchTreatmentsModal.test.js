import SearchTreatmentsModal from "./SearchTreatmentsModal";
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
          <BrowserRouter>{children}</BrowserRouter>
        </ConfirmProvider>
      </ToastProvider>
    </AuthProvider>
  </Provider>
);
describe("SearchTreatmentsModal", () => {
  delete window.location;
  window.location = {
    reload: jest.fn(),
    href: "http://dummy.com?page=1&name=testing",
  };
  it("Should render without crash", async () => {

  
    render(<SearchTreatmentsModal show={true}/>, {
      wrapper: ProviderWrapper,
    });

    const heading = screen.getByTestId("heading");
    expect(heading).toBeInTheDocument();
    expect(heading).toHaveTextContent(/ajouter un traitement/i)
  });
});
