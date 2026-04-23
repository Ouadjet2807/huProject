import TodoList from "./TodoList";
import { render, screen } from "@testing-library/react";
import { AuthProvider } from "../../context/AuthContext";
import { store } from "../../redux/store";
import { Provider } from "react-redux";
import { BrowserRouter } from "react-router";
import { ToastProvider } from "../../context/ToastContext";
import { ConfirmProvider } from "../../context/ConfirmContext";
import { act } from "react";
import { setValues } from "../../redux/spaceSlice";
import userEvent from "@testing-library/user-event";

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

const todos = {
  id: 1,
  items: [
    {
      completed: false,
      completed_by: null,
      created_at: new Date().toLocaleDateString(),
      created_by: 1,
      frequency: "daily",
      id: 1,
      title: "Daily todo",
      todo_list: 1,
      updated_at: new Date().toLocaleDateString(),
    },
    {
      completed: false,
      completed_by: null,
      created_at: new Date().toLocaleDateString(),
      created_by: 1,
      frequency: "weekly",
      id: 2,
      title: "Weekly todo",
      todo_list: 1,
      updated_at: new Date().toLocaleDateString(),
    },
    {
      completed: true,
      completed_by: null,
      created_at: new Date().toLocaleDateString(),
      created_by: 1,
      frequency: "monthly",
      id: 3,
      title: "Monthly todo",
      todo_list: 1,
      updated_at: new Date().toLocaleDateString(),
    },
    {
      completed: false,
      completed_by: null,
      created_at: new Date().toLocaleDateString(),
      created_by: 1,
      frequency: "punctual",
      id: 4,
      title: "Punctual todo",
      todo_list: 1,
      updated_at: new Date().toLocaleDateString(),
    },
  ],
  space: 1,
};

describe("TodoList", () => {
  delete window.location;
  window.location = {
    reload: vi.fn(),
    href: "http://dummy.com?page=1&name=testing",
  };
  it("Should render without crash", async () => {
    await act(async () => {
      render(
        <TodoList user={{ id: 1, first_name: "John", last_name: "Doe" }} />,
        {
          wrapper: ProviderWrapper,
        },
      );
    });
  });
  it("Should check/uncheck todo when user click on checkbox", async () => {
    await act(async () => {
      render(
        <TodoList user={{ id: 1, first_name: "John", last_name: "Doe" }} />,
        {
          wrapper: ProviderWrapper,
        },
      );
    });

    store.dispatch(
      setValues({
        agenda: {},
        caregivers: [],
        created_at: "",
        created_by: {},
        description: "",
        id: "",
        name: "",
        recipients: [],
        todos: todos,
        updated_at: "",
      }),
    );

    const todoItems = await screen.findAllByTestId("todoItemInput");
    const labels = await screen.findAllByTestId("todoItemLabel");

    todoItems.forEach((item, i) => {
      expect(item).toBeInTheDocument();
      expect(labels[i]).toBeInTheDocument();
      expect(labels[i]).toHaveTextContent(todos.items[i].title);
      if (todos.items[i].completed) {
        expect(item).toBeChecked();
      } else {
        expect(item).not.toBeChecked();
      }
    });

    const clicks = todoItems.map((item) => userEvent.click(item));

    await Promise.all(clicks);

    todoItems.forEach((item, i) => {
      expect(item).toBeInTheDocument();
      if (todos.items[i].completed) {
        expect(item).not.toBeChecked();
      } else {
        expect(item).toBeChecked();
      }
    });
  });
  it("Should display all todo items", async () => {
    await act(async () => {
      render(
        <TodoList user={{ id: 1, first_name: "John", last_name: "Doe" }} />,
        {
          wrapper: ProviderWrapper,
        },
      );
    });

    const dailyTodos = screen.queryByTestId(/dailyTodo_/i);
    const weeklyTodos = screen.queryByTestId(/weeklyTodo_/i);
    const monthlyTodos = screen.queryByTestId(/monthlyTodo_/i);
    const punctualTodos = screen.queryByTestId(/punctualTodo_/i);

    expect(dailyTodos).toBeInTheDocument();
    expect(weeklyTodos).toBeInTheDocument();
    expect(monthlyTodos).toBeInTheDocument();
    expect(punctualTodos).toBeInTheDocument();
  });
  it("Should display only daily todo items when user click on daily todos button", async () => {
    store.dispatch(
      setValues({
        agenda: {},
        caregivers: [],
        created_at: "",
        created_by: {},
        description: "",
        id: "",
        name: "",
        recipients: [],
        todos: todos,
        updated_at: "",
      }),
    );

    await act(async () => {
      render(
        <TodoList user={{ id: 1, first_name: "John", last_name: "Doe" }} />,
        {
          wrapper: ProviderWrapper,
        },
      );
    });

    const dailyTodoButton = screen.getByTestId("dailyTodoButton");

    await userEvent.click(dailyTodoButton);

    const dailyTodos = screen.queryByTestId(/dailyTodo_/i);
    const weeklyTodos = screen.queryByTestId(/weeklyTodo_/i);
    const monthlyTodos = screen.queryByTestId(/monthlyTodo_/i);
    const punctualTodos = screen.queryByTestId(/punctualTodo_/i);

    expect(dailyTodos).toBeInTheDocument();
    expect(weeklyTodos).not.toBeInTheDocument();
    expect(monthlyTodos).not.toBeInTheDocument();
    expect(punctualTodos).not.toBeInTheDocument();
  });
  it("Should display only weekly todo items when user click on weekly todos button", async () => {
    store.dispatch(
      setValues({
        agenda: {},
        caregivers: [],
        created_at: "",
        created_by: {},
        description: "",
        id: "",
        name: "",
        recipients: [],
        todos: todos,
        updated_at: "",
      }),
    );

    await act(async () => {
      render(
        <TodoList user={{ id: 1, first_name: "John", last_name: "Doe" }} />,
        {
          wrapper: ProviderWrapper,
        },
      );
    });

    const weeklyTodoButton = screen.getByTestId("weeklyTodoButton");

    await userEvent.click(weeklyTodoButton);

    const dailyTodos = screen.queryByTestId(/dailyTodo_/i);
    const weeklyTodos = screen.queryByTestId(/weeklyTodo_/i);
    const monthlyTodos = screen.queryByTestId(/monthlyTodo_/i);
    const punctualTodos = screen.queryByTestId(/punctualTodo_/i);

    expect(dailyTodos).not.toBeInTheDocument();
    expect(weeklyTodos).toBeInTheDocument();
    expect(monthlyTodos).not.toBeInTheDocument();
    expect(punctualTodos).not.toBeInTheDocument();
  });
  it("Should display only monthly todo items when user click on monthly todos button", async () => {
    store.dispatch(
      setValues({
        agenda: {},
        caregivers: [],
        created_at: "",
        created_by: {},
        description: "",
        id: "",
        name: "",
        recipients: [],
        todos: todos,
        updated_at: "",
      }),
    );

    await act(async () => {
      render(
        <TodoList user={{ id: 1, first_name: "John", last_name: "Doe" }} />,
        {
          wrapper: ProviderWrapper,
        },
      );
    });

    const monthlyTodoButton = screen.getByTestId("monthlyTodoButton");

    await userEvent.click(monthlyTodoButton);

    const dailyTodos = screen.queryByTestId(/dailyTodo_/i);
    const weeklyTodos = screen.queryByTestId(/weeklyTodo_/i);
    const monthlyTodos = screen.queryByTestId(/monthlyTodo_/i);
    const punctualTodos = screen.queryByTestId(/punctualTodo_/i);

    expect(dailyTodos).not.toBeInTheDocument();
    expect(weeklyTodos).not.toBeInTheDocument();
    expect(monthlyTodos).toBeInTheDocument();
    expect(punctualTodos).not.toBeInTheDocument();
  });
  it("Should display only punctual todo items when user click on punctual todos button", async () => {
    store.dispatch(
      setValues({
        agenda: {},
        caregivers: [],
        created_at: "",
        created_by: {},
        description: "",
        id: "",
        name: "",
        recipients: [],
        todos: todos,
        updated_at: "",
      }),
    );

    await act(async () => {
      render(
        <TodoList user={{ id: 1, first_name: "John", last_name: "Doe" }} />,
        {
          wrapper: ProviderWrapper,
        },
      );
    });

    const punctualTodoButton = screen.getByTestId("punctualTodoButton");

    await userEvent.click(punctualTodoButton);

    const dailyTodos = screen.queryByTestId(/dailyTodo_/i);
    const weeklyTodos = screen.queryByTestId(/weeklyTodo_/i);
    const monthlyTodos = screen.queryByTestId(/monthlyTodo_/i);
    const punctualTodos = screen.queryByTestId(/punctualTodo_/i);

    expect(dailyTodos).not.toBeInTheDocument();
    expect(weeklyTodos).not.toBeInTheDocument();
    expect(monthlyTodos).not.toBeInTheDocument();
    expect(punctualTodos).toBeInTheDocument();
  });
  it("Should display all todo items when user click on all todos button (given that another frequency was selected before)", async () => {
    store.dispatch(
      setValues({
        agenda: {},
        caregivers: [],
        created_at: "",
        created_by: {},
        description: "",
        id: "",
        name: "",
        recipients: [],
        todos: todos,
        updated_at: "",
      }),
    );

    await act(async () => {
      render(
        <TodoList user={{ id: 1, first_name: "John", last_name: "Doe" }} />,
        {
          wrapper: ProviderWrapper,
        },
      );
    });

    const dailyTodoButton = screen.getByTestId("dailyTodoButton");
    const allTodoButton = screen.getByTestId("allTodoButton");

    await userEvent.click(dailyTodoButton);

    let dailyTodos = screen.queryByTestId(/dailyTodo_/i);
    let weeklyTodos = screen.queryByTestId(/weeklyTodo_/i);
    let monthlyTodos = screen.queryByTestId(/monthlyTodo_/i);
    let punctualTodos = screen.queryByTestId(/punctualTodo_/i);

    expect(dailyTodos).toBeInTheDocument();
    expect(weeklyTodos).not.toBeInTheDocument();
    expect(monthlyTodos).not.toBeInTheDocument();
    expect(punctualTodos).not.toBeInTheDocument();

    await userEvent.click(allTodoButton);

    dailyTodos = screen.queryByTestId(/dailyTodo_/i);
    weeklyTodos = screen.queryByTestId(/weeklyTodo_/i);
    monthlyTodos = screen.queryByTestId(/monthlyTodo_/i);
    punctualTodos = screen.queryByTestId(/punctualTodo_/i);

    expect(dailyTodos).toBeInTheDocument();
    expect(weeklyTodos).toBeInTheDocument();
    expect(monthlyTodos).toBeInTheDocument();
    expect(punctualTodos).toBeInTheDocument();
  });
  it("Should deleted a todo when user click on the todo's delete icon", async () => {
    store.dispatch(
      setValues({
        agenda: {},
        caregivers: [],
        created_at: "",
        created_by: {},
        description: "",
        id: "",
        name: "",
        recipients: [],
        todos: todos,
        updated_at: "",
      }),
    );

    await act(async () => {
      render(
        <TodoList user={{ id: 1, first_name: "John", last_name: "Doe" }} />,
        {
          wrapper: ProviderWrapper,
        },
      );
    });

    const deleteTodoButton = screen.getAllByTestId("deleteTodoButton");

    let todosItems = screen.queryAllByTestId(/Todo_/i);

    todosItems.forEach(todo => {
      expect(todo).toBeInTheDocument()

    })

    const clicks = deleteTodoButton.map((button, i) => {
      expect(button).toBeInTheDocument()
      userEvent.click(button)
    })

    await Promise.all(clicks);

    todosItems = screen.queryAllByTestId(/Todo_/i);

    await new Promise((p) => setTimeout(p, 1000));

    todosItems.forEach(todo => {
      expect(todo).not.toBeInTheDocument()
    })

  });
});
