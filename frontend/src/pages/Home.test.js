import Home from "./Home";
import { Provider } from "react-redux";
import { render, screen } from "@testing-library/react";
import { AuthProvider } from "../context/AuthContext";
import { ToastProvider } from "../context/ToastContext";
import { ConfirmProvider } from "../context/ConfirmContext";
import { store } from "../redux/store";
import { BrowserRouter } from "react-router";
import { act } from "react";

const mockWinAssign = jest.fn();

const oldWindowLocation = window.location;

beforeAll(() => {
  delete window.location;
  window.location = Object.defineProperties(
    {},
    {
      ...Object.getOwnPropertyDescriptors(oldWindowLocation),
      assign: {
        configurable: true,
        value: mockWinAssign,
      },
    },
  );
});

afterAll(() => {
  // restore location
  window.location = oldWindowLocation;
});

describe("Home", () => {

  const users = [
    {
      id: "34263dg4-3536w-23665-2455-2426578ewtg34",
      first_name: "John",
      is_admin: true,
    },
    {
      id: "214683278-5678r3-21426sf4-1253-125dsfn32",
      first_name: "Jane",
      is_admin: false,
    },
  ];

  const caregivers = [
    {
      id: 1,
      first_name: "John",
      last_name: "Doe",
      user: "34263dg4-3536w-23665-2455-2426578ewtg34",
      access_level: 1,
    },
    {
      id: 2,
      first_name: "Jane",
      last_name: "Doe",
      user: "214683278-5678r3-21426sf4-1253-125dsfn32",
      access_level: 3,
    },
  ];

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

  it("Should render Hi [user], welcome", async () => {
    await act(async () => {
      render(<Home user={users[0]} loading={false} />, {
        wrapper: ProviderWrapper,
      });
    });

    const heading = screen.getByRole("heading", { level: 1 });
    expect(heading).toBeInTheDocument();
    expect(heading).toHaveTextContent(/Hi John, welcome/i);
  });

  it("Should render caregivers list (current user excluded) when caregivers array is provided", async () => {
    await act(async () => {
      render(<Home user={users[0]} loading={false} caregivers={caregivers} />, {
        wrapper: ProviderWrapper,
      });
    });
    caregivers.forEach((caregiver) => {
      const div = screen.queryByTestId(
        caregiver.first_name + "_" + caregiver.last_name,
      );
      if (caregiver.user == users[0].id) {
        expect(div).not.toBeInTheDocument();
      } else {
        expect(div).toBeInTheDocument();
      }
    });
  });
  it("Should render an admin tag next to user firstname and lastname if user is admin", async () => {
    await act(async () => {
      render(<Home user={users[1]} loading={false} caregivers={caregivers} />, {
        wrapper: ProviderWrapper,
      });
    });
    caregivers
      .filter((c) => c.user !== users[1])
      .forEach((caregiver) => {
        if (caregiver.access_level == 1) {
          console.log("is_admin");
          const adminTag = screen.queryByTestId("adminTag");
          expect(adminTag).toBeInTheDocument();
          expect(adminTag).toHaveTextContent(/admin/i);
        }
      });
  });
  it("Should not render admin tag next to user firstname and lastname if user is not admin", async () => {
    await act(async () => {
      render(<Home user={users[0]} loading={false} caregivers={caregivers} />, {
        wrapper: ProviderWrapper,
      });
    });
    caregivers
      .filter((c) => c.user !== users[0])
      .forEach((caregiver) => {
        if (caregiver.access_level !== 1) {
          console.log("is_admin");
          const adminTag = screen.queryByTestId("adminTag");
          expect(adminTag).not.toBeInTheDocument();
        }
      });
  });
  it("Should render 'aucun aidant' when caregivers array is empty", async () => {
    await act(async () => {
      render(<Home user={users[0]} loading={false} caregivers={[]} />, {
        wrapper: ProviderWrapper,
      });
    });
    const text = screen.getByTestId("noCaregivers");
    expect(text).toBeInTheDocument();
    expect(text).toHaveTextContent(/aucun aidant/i);
  });
  it("Should render recipients list when recipients array is provided", async () => {
    const recipients = [
      {
        id: 1,
        first_name: "John",
        last_name: "Doe",
      },
      {
        id: 2,
        first_name: "Jane",
        last_name: "Doe",
      },
    ];
    await act(async () => {
      render(<Home user={users[0]} loading={false} recipients={recipients} />, {
        wrapper: ProviderWrapper,
      });
    });
    recipients.forEach((recipient) => {
      const div = screen.getByTestId(
        recipient.first_name + "_" + recipient.last_name,
      );
      expect(div).toBeInTheDocument();
    });
  });
  it("Should render 'aucun aidé' when recipients array is empty", async () => {
    await act(async () => {
      render(<Home user={users[0]} loading={false} recipients={[]} />, {
        wrapper: ProviderWrapper,
      });
    });
    const text = screen.getByTestId("noRecipients");
    expect(text).toBeInTheDocument();
    expect(text).toHaveTextContent(/aucun aidé/i);
  });
  it("Should render invite button if user is admin", async () => {
    await act(async () => {
      render(<Home user={users[0]} loading={false} />, {
        wrapper: ProviderWrapper,
      });
    });
    const button = screen.getByTestId("inviteUser");
    expect(button).toBeInTheDocument();
  });
  it("Should not render invite button if user is not admin", async () => {
    await act(async () => {
      render(<Home user={users[1]} loading={false} />, {
        wrapper: ProviderWrapper,
      });
    });
    const button = screen.queryByTestId("inviteUser");
    expect(button).not.toBeInTheDocument();
  });
});
