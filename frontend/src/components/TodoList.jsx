import React, { useEffect, useRef, useState } from "react";
import api from "../api/api";
import Button from "react-bootstrap/esm/Button";
import { FaRegTrashAlt } from "react-icons/fa";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(useGSAP);

export default function TodoList({ user, space }) {
  const [todoList, setTodoList] = useState([]);
  const [filteredTodoList, setFilteredTodoList] = useState([]);
  const [activeCategory, setActiveCategory] = useState();
  const [newTask, setNewTask] = useState({});
  const [formVisible, setFormVisible] = useState(false);

  const todoCategory = [
    {
      name: "Toutes",
      value: "all",
    },
    {
      name: "Quotidienne",
      value: "daily",
    },
    {
      name: "Hebdomadaire",
      value: "weekly",
    },
    {
      name: "Mensuelle",
      value: "monthly",
    },
    {
      name: "Ponctuelle",
      value: "punctual",
    },
  ];

  const selectInputRef = useRef();
  const addTaskFormRef = useRef();

  const handleChange = (e) => {
    setNewTask((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log();

    try {
      await api.post("http://127.0.0.1:8000/api/todo_lists/", newTask);
      console.log("success");

      setTodoList((prev) => [...prev, newTask]);
      setFilteredTodoList((prev) => [...prev, newTask]);
      setNewTask({
        space: space && space.id,
        frequency: "punctual",
        completed: false,
        completed_by: null,
        title: "",
        description: "",
        created_by: user && user.id,
      });

      selectInputRef.current.selectedIndex = 0;
    } catch (error) {
      console.log(error);
    }
  };

  const updateTodo = async (index, todo) => {
    todo.completed = !todo.completed;
    todo.completed_by = user.id;
    todo.updated_at = new Date();

    let filter = filteredTodoList.toSpliced(index, 1, todo);

    setFilteredTodoList(filter);

    console.log(todo);
    console.log(filteredTodoList[index]);

    try {
      await api.put(`http://127.0.0.1:8000/api/todo_lists/${todo.id}/`, todo);
    } catch (error) {
      console.log(error);
    }
  };

  const deleteTodo = async (index, todo) => {
    let filter = filteredTodoList.toSpliced(index, 1);

    try {
      await api.delete(
        `http://127.0.0.1:8000/api/todo_lists/${todo.id}/`,
        todo
      );
      setFilteredTodoList(filter);
    } catch (error) {
      console.log(error);
    }
  };

  const fetchTodoList = async () => {
    try {
      const response = await api.get("http://127.0.0.1:8000/api/todo_lists");

      console.log("success", response.data);

      setTodoList(response.data);
      setFilteredTodoList(response.data);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchTodoList();
  }, []);

  useEffect(() => {
    setNewTask({
      space: space && space.id,
      frequency: "punctual",
      completed: false,
      completed_by: null,
      title: "",
      description: "",
      created_by: user && user.id,
    });
  }, [user, space]);

  useEffect(() => {
    if (activeCategory !== "all") {
      let filter = todoList.filter((item) => item.frequency === activeCategory);
      setFilteredTodoList(filter);
    } else {
      setFilteredTodoList(todoList);
    }
  }, [activeCategory, todoList]);

  useGSAP(() => {
    let elemId = addTaskFormRef.current.id;

    if (formVisible) {
      gsap.to(`#${elemId} select, #${elemId} button`, {
        height: "auto",
        width: "100%",
        position: "relative",
        scale: 1,
        display: "block",
        duration: 0.2,
      });
    } else {
      gsap.to(`#${elemId} select, #${elemId} button`, {
        scale: 0,
        width: "100%",
        display: "none",
        duration: 0.2,
      });
    }
  }, [formVisible]);

  return (
    <div id="todoList">
      <ul className="todo-category">
        {todoCategory.map((category) => {
          return (
            <li
              className={`${
                activeCategory === category.value ? "activeCategory" : ""
              } `}
              onClick={() => setActiveCategory(category.value)}
            >
              {category.name}
            </li>
          );
        })}
      </ul>
      <div className="todo-list-items">
        {filteredTodoList.length > 0 &&
          filteredTodoList.map((todo, index) => {
            return (
              <div className={`todo-item ${todo.completed ? "completed" : ""}`}>
                <input
                  type="checkbox"
                  name=""
                  id=""
                  checked={todo.completed}
                  onClick={() => updateTodo(index, todo)}
                />
                {todo.title}
                <div className="delete" onClick={() => deleteTodo(index, todo)}>
                  <FaRegTrashAlt />
                </div>
              </div>
            );
          })}
        <form
          id="addTaskForm"
          ref={addTaskFormRef}
          action=""
          onMouseEnter={() => setFormVisible(true)}
          onMouseLeave={() => setTimeout(() => {setFormVisible(false)}, 500)}
          onKeyDown={(e) => e.key === "Enter" && handleSubmit(e)}
        >
          <input
            type="text"
            name="title"
            id=""
            value={newTask.title}
            placeholder="Nouvelle tâche"
            onChange={(e) => handleChange(e)}
          />
          <select
            ref={selectInputRef}
            name="frequency"
            id=""
            onChange={(e) => handleChange(e)}
          >
            <option value="" selected disabled>
              Fréquence
            </option>
            {todoCategory
              .filter((item) => item.value !== "all")
              .map((category) => {
                return <option value={category.value}>{category.name}</option>;
              })}
          </select>
          <Button onClick={(e) => handleSubmit(e)}>Ajouter une tâche</Button>
        </form>
      </div>
    </div>
  );
}
