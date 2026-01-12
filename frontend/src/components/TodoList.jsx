import React, { useEffect, useRef, useState } from "react";
import api from "../api/api";
import Button from "react-bootstrap/esm/Button";
import { LuTrash2 } from "react-icons/lu";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { FaRegSquare } from "react-icons/fa";
import { TbSquareCheckFilled } from "react-icons/tb";
import ButtonGroup from 'react-bootstrap/ButtonGroup';
import Dropdown from 'react-bootstrap/Dropdown';
import DropdownButton from 'react-bootstrap/DropdownButton';
import Form from 'react-bootstrap/Form';
import InputGroup from 'react-bootstrap/InputGroup';
import moment from "moment";
import { locale } from "moment";
gsap.registerPlugin(useGSAP);

export default function TodoList({ user, space }) {

  moment.locale("fr")

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
    console.log();

    try {
      let response = await api.post("http://127.0.0.1:8000/api/todo_lists/", newTask);
      console.log("success");

      newTask.id = response.data.id
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
    todo.updated_at = moment(new Date).format();

    
    let filter = filteredTodoList.toSpliced(index, 1, todo);

    setFilteredTodoList(filter);


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

      response.data.forEach(d => {
        console.log(d.created_by.last_name);
        
      })

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
    const filterCategories = () => {
      if (activeCategory !== "all") {
        let filter = todoList.filter((item) => item.frequency === activeCategory);
        setFilteredTodoList(filter);
      } else {
        setFilteredTodoList(todoList);
      }
    }
    filterCategories()
  }, [activeCategory, todoList]);

  useEffect(() => {
    const resetTodo = () => {

      const frequencies = {
        daily: 'days',
        weekly: 'weeks',
        monthly: 'months',
      }

      todoList.forEach((todo, index) => {
        console.log(index);
        const updated_date = moment(todo.updated_at)
        if(!todo.completed) return

        const frequency = frequencies[todo.frequency]

        if(moment().diff(updated_date, frequency) >= 1) {
          updateTodo(index, todo)
        }
      })
    }

    resetTodo()
  }, [todoList])

  console.log(newTask);
  console.log(todoList);


  return (
    <div id="todoList">
      <ButtonGroup className="todo-category">
        {todoCategory.map((category) => {
          return (
            <Button
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
        {filteredTodoList.length > 0 &&
          filteredTodoList.map((todo, index) => {
            return (
              <div className={`todo-item ${todo.completed ? "completed" : ""}`}>
                <div className="field">
                {todo.completed ? <TbSquareCheckFilled /> : <FaRegSquare />}
                <input
                  type="checkbox"
                  name=""
                  id=""
                  checked={todo.completed}
                  onClick={() => updateTodo(index, todo)}
                  />
                  </div>
                {todo.title}
                <div className="delete" onClick={() => deleteTodo(index, todo)}>
                  <LuTrash2 />
                </div>
              </div>
            );
          })}
      </div>
        <form
          id="addTaskForm"
          action=""
          onKeyDown={(e) => e.key === "Enter" && handleSubmit(e)}
        >
            <InputGroup className="mb-3">
        <Form.Control aria-label="Text input with dropdown button" type="text"
            name="title"
            id=""
            value={newTask.title}
            placeholder="Nouvelle tâche"
            onChange={(e) => handleChange(e)}/>

        <DropdownButton
          variant="outline-secondary"
          title={Object.keys(newTask).includes("frequency") ? todoCategory.find(cat => cat.value == newTask.frequency).name : "Fréquence"}
          id="input-group-dropdown-2"
          align="end"
        >
             {todoCategory
              .filter((item) => item.value !== "all")
              .map((category) => {
                return <Dropdown.Item onClick={() => setNewTask(prev => ({...prev, frequency: category.value}))}>{category.name}</Dropdown.Item>;
              })}
        </DropdownButton>
      </InputGroup>
          <Button variant="aqua" onClick={(e) => handleSubmit(e)}>Ajouter une tâche</Button>
        </form>
    </div>
  );
}
