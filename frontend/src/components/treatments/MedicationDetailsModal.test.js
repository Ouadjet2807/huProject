import MedicationDetailsModal from "./MedicationDetailsModal";
import { render } from "@testing-library/react";
import { AuthProvider } from "../../context/AuthContext";
import { store } from "../../redux/store";
import { Provider } from "react-redux";
import { BrowserRouter } from "react-router";
import { ToastProvider } from "../../context/ToastContext";
import { ConfirmProvider } from "../../context/ConfirmContext";
import { setValues } from "../../redux/spaceSlice";
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

const medication = {
  cis: 62049552,
composition: [],
conditions: ['prescription limitée à 12 semaines', 'liste I', 'prescription en toutes lettres sur ordonnance sécurisée'],
dateAMM: "23/01/2017",
elementPharmaceutique: "CODOLIPRANE 500 mg/30 mg, gélule",
etatComercialisation: "Commercialisée",
formePharmaceutique: "gélule",
generiques: null,
presentation: [],
statusAutorisation: "Autorisation active",
surveillanceRenforcee: "Non",
titulaire: "OPELLA HEALTHCARE FRANCE",
typeProcedure: "Procédure nationale",
voiesAdministration: ['orale']
}

describe("MedicationDetailsModal", () => {
  delete window.location;
  window.location = {
    reload: jest.fn(),
    href: "http://dummy.com?page=1&name=testing",
  };
  it("Should render without crash", async () => {

    await act(async () => {
      render(
         <MedicationDetailsModal
                    recipient={{}}
                    treatment={{}}
                    medication={{}}
                    treatmentsData={[]}
                  />
          , { wrapper: ProviderWrapper}
      );
    });
  });
});
