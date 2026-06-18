import React, { useEffect, useRef, useState } from "react";
import api from "../../api/api";
import Button from "react-bootstrap/Button";
import { LuTrash2 } from "react-icons/lu";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import ButtonGroup from "react-bootstrap/ButtonGroup";
import Dropdown from "react-bootstrap/Dropdown";
import DropdownButton from "react-bootstrap/DropdownButton";
import { LuCheckCheck } from "react-icons/lu";
import Form from "react-bootstrap/Form";
import InputGroup from "react-bootstrap/InputGroup";
import moment from "moment";
import { MdLibraryAdd } from "react-icons/md";
import { useSelector } from "react-redux";

gsap.registerPlugin(useGSAP);

export default function TodoList({ user }) {
  moment.locale("fr");

  const space = useSelector((state) => state.space);
  const todoCategory = [
    {
      name: "Toutes",
      value: "all",
    },
    {
      name: "Quotidiennes",
      value: "daily",
    },
    {
      name: "Hebdomadaires",
      value: "weekly",
    },
    {
      name: "Mensuelles",
      value: "monthly",
    },
    {
      name: "Ponctuelles",
      value: "punctual",
    },
  ];

  const [todoList, setTodoList] = useState([]);
  const [filteredTodoList, setFilteredTodoList] = useState([]);
  const [activeCategory, setActiveCategory] = useState(todoCategory[0].value);
  const [newTask, setNewTask] = useState({});

  const selectInputRef = useRef();

  const handleChange = (e) => {
    setNewTask((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (process.env.NODE_ENV !== "test") {
        let response = await api.post(
          "https://www.curadash.fr/api/todo_list_items/",
          newTask,
        );
        newTask.id = response.data.id;
        setTodoList((prev) => [...prev, newTask]);
        setNewTask({
          todo_list: Object.keys(space).length > 0 && space.todos.id,
          frequency: "punctual",
          completed: false,
          completed_by: user.id,
          title: "",
          description: "",
          created_by: user && user.id,
        });
      }

      selectInputRef.current.selectedIndex = 0;
    } catch (error) {
      console.log(error);
    }
  };

  const updateTodo = async (todo) => {
    todo.completed = !todo.completed;
    todo.completed_by = user;
    todo.completed_by_id = user.id;
    todo.updated_at = moment(new Date()).format();

    let initial_index = todoList.indexOf(todo);

    let filter = todoList.toSpliced(initial_index, 1, todo);

    setTodoList(filter);

    try {
      if (process.env.NODE_ENV !== "test") {
        await api.put(
          `https://www.curadash.fr/api/todo_list_items/${todo.id}/`,
          todo,
        );
      }
    } catch (error) {
      console.log(error);
    }
  };

  const deleteTodo = async (todo) => {
    let initial_index = todoList.indexOf(todo);
    let filter = todoList.toSpliced(initial_index, 1);

    try {
      if (process.env.NODE_ENV !== "test") {
        await api.delete(
          `https://www.curadash.fr/api/todo_list_items/${todo.id}/`,
          todo,
        );
      }
      setTodoList(filter);
    } catch (error) {
      console.log(error);
    }
  };

  const renderTodoType = (frequency) => {
    if (activeCategory !== "all") return;

    let category = todoCategory.find((elem) =>
      Object.values(elem).find((value) => value == frequency),
    ).name;

    return category.substring(0, category.length - 1);
  };

  const renderName = (target_id) => {
    if(!target_id) return
    console.log(target_id);
    
    let findTarget = space.caregivers.find(e => Object.values(e).find((value) => value == target_id))
    console.log(findTarget);

    if(!findTarget) return

    return [findTarget.first_name, findTarget.last_name]
  }

  useEffect(() => {
    if (!user || !Object.keys(space).length > 0 || !space.todos.items) return;

    let json_todos = JSON.stringify(space.todos.items);

    setTodoList(JSON.parse(json_todos));

    if (process.env.NODE_ENV === "test") return;
    setNewTask({
      todo_list: space.todos.id,
      frequency: "punctual",
      completed: false,
      completed_by: null,
      completed_by_id: null,
      title: "",
      description: "",
      created_by: user.id,
    });
  }, [user, space]);

  useEffect(() => {
    const filterCategories = () => {
      if (activeCategory !== "all") {
        let filter = todoList.filter(
          (item) => item.frequency === activeCategory,
        );
        setFilteredTodoList(filter);
      } else {
        setFilteredTodoList(todoList);
      }
    };
    filterCategories();
  }, [activeCategory, todoList]);

  return (
    <div id="todoList">
      <ButtonGroup className="todo-category">
        {todoCategory.length > 0 &&
          todoCategory.map((category, index) => {
            return (
              <Button
                data-testid={`${category.value}TodoButton`}
                key={`category_${index + 1}`}
                className={`${
                  activeCategory === category.value ? "activeCategory" : ""
                } `}
                onClick={() => setActiveCategory(category.value)}
              >
                {category.name}
              </Button>
            );
          })}
      </ButtonGroup>


        <div className="todo-list-items">
        <div className="todo-header">
            <div><LuCheckCheck /></div>
            <div>Intitulé</div>
            <div>Fréquence</div>
            <div>Crée par</div>
            <div>Dernière mise à jour</div>
        </div>
          {filteredTodoList &&
            filteredTodoList.length > 0 &&
            filteredTodoList.map((todo, index) => {
              return (
                <div
                  data-testid={`${todo.frequency}Todo_${index}`}
                  key={`todo_${todo.id}`}
                  className={`todo-item ${todo.completed ? "completed" : ""}`}
                >
                  <div>
                    <Form.Check
                      data-testid="todoItemInput"
                      type="checkbox"
                      id=""
                      checked={todo.completed}
                      onChange={() => updateTodo(todo)}
                    />
                  </div>
                  <div className="label">
                    <Form.Check.Label data-testid="todoItemLabel">
                      {todo.title}
                    </Form.Check.Label>
                  </div>
                  <td className="todo_frequency">
                    <small>{renderTodoType(todo.frequency)}</small>
                  </td>
                  {(renderName(todo.created_by) && renderName(todo.created_by).length > 0) &&
                  <div className="todo_created_by">
                    <span className="initials" title={renderName(todo.created_by)[0] + " " + renderName(todo.created_by)[1]}>
                     {renderName(todo.created_by)[0][0] + renderName(todo.created_by)[1][0]}
                    </span>
                  </div>
                  }
                  {(renderName(todo.completed_by) && renderName(todo.completed_by).length > 0) &&
                  <div className="todo_updated_by">
                    <span className="initals" title={renderName(todo.completed_by)[0] + " " + renderName(todo.completed_by)[1]}>
                      {renderName(todo.completed_by)[0][0] + renderName(todo.completed_by)[1][0]}
                    </span>
                  </div>
                  }

                  {todo.created_by == user.id && (
                    <div
                      data-testid="deleteTodoButton"
                      className="delete"
                      onClick={() => deleteTodo(todo)}
                    >
                      <LuTrash2 />
                    </div>
                  )}
                </div>
              );
            })}
        </div>


      {user && user.can_edit && (
        <form
          id="addTaskForm"
          action=""
          onKeyDown={(e) => e.key === "Enter" && handleSubmit(e)}
        >
          <InputGroup>
            <Form.Control
              aria-label="Text input with dropdown button"
              type="text"
              name="title"
              id=""
              value={newTask.title}
              placeholder="Nouvelle tâche"
              onChange={(e) => handleChange(e)}
            />

            <DropdownButton
              variant="outline-secondary"
              title={
                Object.keys(newTask).includes("frequency")
                  ? todoCategory.find((cat) => cat.value === newTask.frequency)
                      .name
                  : "Fréquence"
              }
              id="input-group-dropdown-2"
              align="end"
            >
              {todoCategory.length > 0 &&
                todoCategory
                  .filter((item) => item.value !== "all")
                  .map((category, index) => {
                    return (
                      <Dropdown.Item
                        key={`category_${index + 1}`}
                        onClick={() =>
                          setNewTask((prev) => ({
                            ...prev,
                            frequency: category.value,
                          }))
                        }
                      >
                        {category.name}
                      </Dropdown.Item>
                    );
                  })}
            </DropdownButton>
          </InputGroup>
          <div className="add-button" onClick={(e) => handleSubmit(e)}>
            <MdLibraryAdd />
          </div>
        </form>
      )}
    </div>
  );
}
