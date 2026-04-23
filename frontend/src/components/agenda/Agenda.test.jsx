import Agenda from "./Agenda";
import { render, screen, dom } from "@testing-library/react";
import { AuthProvider } from "../../context/AuthContext";
import { store } from "../../redux/store";
import { Provider } from "react-redux";
import { BrowserRouter } from "react-router";
import { ToastProvider } from "../../context/ToastContext";
import { ConfirmProvider } from "../../context/ConfirmContext";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import moment from "moment";
import "moment/locale/fr";

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

const start_date = moment().minutes(0).seconds(0).seconds(0).local().format();

const end_date = moment()
  .add(1, "hours")
  .minutes(0)
  .seconds(0)
  .seconds(0)
  .local()
  .format();

describe("Agenda", () => {
  delete window.location;
  window.location = {
    reload: vi.fn(),
    href: "http://dummy.com?page=1&name=testing",
  };
  it("Should render without crash", async () => {
    render(<Agenda loading={false} />, { wrapper: ProviderWrapper });
  });
  it("Should render today's date and 'aucun événement' if there's no event today", async () => {
    const agenda = {
      id: "12344-32536523-234535",
      items: [
        {
          id: 1,
          title: "event 1",
          description: "event description",
          private: false,
          caregivers: [],
          recipients: [],
          start_date: new Date("01/01/1999"),
          end_date: new Date("02/01/1999"),
        },
      ],
      categories: [
        {
          id: 1,
          name: "category 1",
          color: { text: "#fff", background: "#fff" },
        },
      ],
    };

    render(<Agenda loading={false} agenda={agenda} />, {
      wrapper: ProviderWrapper,
    });

    const date_options = {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    };

    const heading = screen.getByRole("heading", { level: 3 });
    const date = screen.getByTestId("date");
    const noEvents = screen.getByTestId("noEvents");
    expect(date).toBeInTheDocument();
    expect(date.textContent).toBe(
      new Date().toLocaleDateString("fr-Fr", date_options),
    );
    expect(heading).toBeInTheDocument();
    expect(heading).toHaveTextContent(/aujourd'hui/i);
    expect(noEvents).toBeInTheDocument();
    expect(noEvents).toHaveTextContent(/aucun événement/i);
  });
  it("Should render today's date and today's event list if there's event today", async () => {
    const agenda = {
      id: "12344-32536523-234535",
      items: [
        {
          id: 1,
          title: "event 1",
          description: "event description",
          private: false,
          caregivers: [],
          recipients: [],
          start_date: start_date,
          end_date: end_date,
        },
      ],
      categories: [
        {
          id: 1,
          name: "category 1",
          color: { text: "#fff", background: "#fff" },
        },
      ],
    };

    render(<Agenda loading={false} agenda={agenda} />, {
      wrapper: ProviderWrapper,
    });

    const date_options = {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    };

    const heading = screen.getByRole("heading", { level: 3 });
    const date = screen.getByTestId("date");
    const todaysEventItems = screen.getAllByTestId("todaysEventItem");
    const todaysEventTitle = screen.getAllByTestId("todaysEventTitle");
    const todaysEventTime = screen.getAllByTestId("todaysEventTime");
    expect(date).toBeInTheDocument();
    expect(date.textContent).toBe(
      new Date().toLocaleDateString("fr-Fr", date_options),
    );
    expect(heading).toBeInTheDocument();
    expect(heading).toHaveTextContent(/aujourd'hui/i);
    expect(todaysEventItems[0]).toBeInTheDocument();

    expect(todaysEventTitle[0]).toBeInTheDocument();
    expect(todaysEventTitle[0]).toHaveTextContent("event 1");
    expect(todaysEventTime[0]).toBeInTheDocument();
    expect(todaysEventTime[0]).toHaveTextContent(
      `${new Date(start_date).toTimeString().slice(0, 5)} - ${new Date(end_date).toTimeString().slice(0, 5)}`,
    );
  });
  it("Should render selected event when user click on event from calendar view", async () => {
    const agenda = {
      id: "12344-32536523-234535",
      items: [
        {
          id: 1,
          title: "event 1",
          description: "event description",
          private: false,
          caregivers: [],
          recipients: [],
          start_date: start_date,
          end_date: end_date,
        },
      ],
      categories: [
        {
          id: 1,
          name: "category 1",
          color: { text: "#fff", background: "#fff" },
        },
      ],
    };

    render(<Agenda agenda={agenda} loading={false} setLoading={""} />, {
      wrapper: ProviderWrapper,
    });

    const todaysEventItems = screen.getAllByTestId("todaysEventItem");
    await userEvent.click(todaysEventItems[0]);

    const selectedEventTitle = screen.getByRole("heading", { level: 3 });
    const selectedEventPrivate = screen.queryByTestId("selectedEventPrivate");
    const selectedEventDescription = screen.queryByTestId(
      "selectedEventDescription",
    );
    const selectedEventParticipants = screen.queryByTestId(
      "selectedEventParticipants",
    );
    expect(selectedEventTitle).toBeInTheDocument();
    expect(selectedEventTitle).toHaveTextContent("event 1");
    expect(selectedEventDescription).toBeInTheDocument();
    expect(selectedEventDescription).toHaveTextContent("event description");
    expect(selectedEventParticipants).toBeInTheDocument();
    expect(selectedEventParticipants).toHaveTextContent(/aucun participant/i);
    expect(selectedEventPrivate).not.toBeInTheDocument();
  });
  it("Should render selected event when user click on event from today's event view", async () => {
    const agenda = {
      id: "12344-32536523-234535",
      items: [
        {
          id: 1,
          title: "event 1",
          description: "event description",
          private: false,
          caregivers: [],
          recipients: [],
          start_date: start_date,
          end_date: end_date,
        },
      ],
      categories: [
        {
          id: 1,
          name: "category 1",
          color: { text: "#fff", background: "#fff" },
        },
      ],
    };

    render(<Agenda agenda={agenda} loading={false} setLoading={""} />, {
      wrapper: ProviderWrapper,
    });

    const events = await screen.findAllByTestId("rbcEvent");
    await userEvent.click(events[0]);

    const selectedEventTitle = screen.getByRole("heading", { level: 3 });
    const selectedEventPrivate = screen.queryByTestId("selectedEventPrivate");
    const selectedEventDescription = screen.queryByTestId(
      "selectedEventDescription",
    );
    const selectedEventParticipants = screen.queryByTestId(
      "selectedEventParticipants",
    );
    expect(selectedEventTitle).toBeInTheDocument();
    expect(selectedEventTitle).toHaveTextContent("event 1");
    expect(selectedEventDescription).toBeInTheDocument();
    expect(selectedEventDescription).toHaveTextContent("event description");
    expect(selectedEventParticipants).toBeInTheDocument();
    expect(selectedEventParticipants).toHaveTextContent(/aucun participant/i);
    expect(selectedEventPrivate).not.toBeInTheDocument();
  });
  it("Should render selected event's private tag when event is private", async () => {
    const agenda = {
      id: "12344-32536523-234535",
      items: [
        {
          id: 1,
          title: "event 1",
          description: "event description",
          private: true,
          caregivers: [],
          recipients: [],
          start_date: start_date,
          end_date: end_date,
        },
      ],
      categories: [
        {
          id: 1,
          name: "category 1",
          color: { text: "#fff", background: "#fff" },
        },
      ],
    };

    render(<Agenda agenda={agenda} loading={false} setLoading={""} />, {
      wrapper: ProviderWrapper,
    });

    const events = await screen.findAllByTestId("rbcEvent");
    await userEvent.click(events[0]);

    const selectedEventPrivate = screen.queryByTestId("selectedEventPrivate");
    expect(selectedEventPrivate).toBeInTheDocument();
    expect(selectedEventPrivate).toHaveTextContent(/privé/i);
  });
  it("Should render selected event's participants when caregivers and/or recipients array is provided", async () => {
    const agenda = {
      id: "12344-32536523-234535",
      items: [
        {
          id: 1,
          title: "event 1",
          description: "event description",
          private: false,
          caregivers: [{ id: 1, first_name: "John", last_name: "Doe" }],
          recipients: [{ id: 1, first_name: "Jane", last_name: "Doe" }],
          start_date: new Date().toLocaleDateString(),
          end_date: new Date().toLocaleDateString(),
        },
      ],
      categories: [
        {
          id: 1,
          name: "category 1",
          color: { text: "#fff", background: "#fff" },
        },
      ],
    };

    render(<Agenda agenda={agenda} loading={false} setLoading={""} />, {
      wrapper: ProviderWrapper,
    });

    const events = await screen.findAllByTestId("rbcEvent");
    await userEvent.click(events[0]);

    const selectedEventParticipantsItem = screen.getAllByTestId(
      "selectedEventParticipantsItem",
    );

    expect(selectedEventParticipantsItem[0]).toBeInTheDocument();
    expect(selectedEventParticipantsItem[0]).toHaveTextContent("John Doe");
    expect(selectedEventParticipantsItem[1]).toBeInTheDocument();
    expect(selectedEventParticipantsItem[1]).toHaveTextContent("Jane Doe");
  });
  it("Should reset content to today's date when user click on 'back' button", async () => {
    const agenda = {
      id: "12344-32536523-234535",
      items: [
        {
          id: 1,
          title: "event 1",
          description: "event description",
          private: false,
          caregivers: [{ id: 1, first_name: "John", last_name: "Doe" }],
          recipients: [{ id: 1, first_name: "Jane", last_name: "Doe" }],
          start_date: start_date,
          end_date: end_date,
        },
      ],
      categories: [
        {
          id: 1,
          name: "category 1",
          color: { text: "#fff", background: "#fff" },
        },
      ],
    };

    render(<Agenda agenda={agenda} loading={false} setLoading={""} />, {
      wrapper: ProviderWrapper,
    });

    const events = await screen.findAllByTestId("rbcEvent");
    await userEvent.click(events[0]);

    const backButton = screen.queryByTestId("backButton");
    expect(backButton).toBeInTheDocument();

    await userEvent.click(backButton);
    const date_options = {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    };

    const date = screen.getByTestId("date");
    const heading = screen.getByRole("heading", { level: 3 });

    expect(backButton).not.toBeInTheDocument();
    expect(date).toBeInTheDocument();
    expect(date.textContent).toBe(
      new Date().toLocaleDateString("fr-Fr", date_options),
    );
    expect(heading).toBeInTheDocument();
    expect(heading).toHaveTextContent(/aujourd'hui/i);
  });
});
