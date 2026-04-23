import CreateCategory from "./CreateCategory";
import { render } from "@testing-library/react";
import { AuthProvider } from "../../context/AuthContext";
import { store } from "../../redux/store";
import { Provider } from "react-redux";
import { BrowserRouter } from "react-router";
import { ToastProvider } from "../../context/ToastContext";
import { ConfirmProvider } from "../../context/ConfirmContext";

const agenda = {
  categories: [
    {
      agenda: "346dg6-25fh4-257f-15y7s-3467e245g5a5",
      color: { text: "#d49687ff", background: "#ffcabde6" },
      id: "5dbba9d5-ac99-4b40-a36c-739dd47a16f1",
      name: "Category 1",
    },
  ],
  id: "346dg6-25fh4-257f-15y7s-3467e245g5a5",
  items: [
    {
      agenda: "e7da88b9-2829-4942-8c57-fd8e5f3637f1",
      caregivers: [],
      category: "5dbba9d5-ac99-4b40-a36c-739dd47a16f1",
      created_at: "2026-01-28T16:02:25.291543Z",
      created_by: "2049678382o50-3253425-356623023523",
      description: "This is an event",
      end_date: "2026-02-08T00:00:00Z",
      id: "3525764dg-s33567-dsf35-35fwgf-345awrg43563",
      private: false,
      recipients: [],
      reminder: {},
      start_date: "2026-01-28T00:00:00Z",
      title: "Event 1",
    },
  ],
  space: "24367882-45f43-3th6-24f4r-3467g34g6h2",
};

describe("CreateCategory", () => {
    delete window.location;
    window.location = {
      reload: vi.fn(),
      href: "http://dummy.com?page=1&name=testing",
    };
  test("Should render without crash", async () => {
    render(
      <Provider store={store}>
        <AuthProvider>
          <ToastProvider>
            <ConfirmProvider>
              <BrowserRouter>
                <CreateCategory agenda={agenda} />
              </BrowserRouter>
            </ConfirmProvider>
          </ToastProvider>
        </AuthProvider>
      </Provider>,
    );

  });
});
