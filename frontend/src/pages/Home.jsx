import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import CreateRecipient from "../components/CreateRecipient";
import { SlUserFemale } from "react-icons/sl";
import { SlUser } from "react-icons/sl";
import { AiOutlineLoading } from "react-icons/ai";
import Agenda from "../components/Agenda";
import TodoList from "../components/TodoList";

export default function Home({setRefreshRecipients, space}) {

  const [addRecipient, setAddRecipient] = useState(false);

  const navigate = useNavigate();

  const { user, logout, loading } = useContext(AuthContext);

  console.log(loading);


  useEffect(() => {
    const checkUserLoggedIn = () => {
      if (!loading && !user) navigate("/login");
    };
   
    checkUserLoggedIn();
  }, [loading, user, navigate]);



  console.log(Object.keys(space).includes("recipients"));

  return (
    <div id="home">
      
      {!loading ? (
        <>
          <div className="left-tab">
          <h1>Hi {user && user.first_name}, welcome</h1>

            {/* <div className="recipients box">
            <h3>Your recipients</h3>
              {Object.keys(space).includes("recipients") &&
                space.recipients.map((item) => {
                  return (
                    <div className="recipient" onClick={() => navigate(`/recipient/${item.id}`)}>
                      <h4>
                        <div className="icon">
                          {item.gender === "F" ? <SlUserFemale /> : <SlUser />}
                        </div>
                        {item.first_name} {item.last_name}
                      </h4>
                    </div>
                  );
                })}

            <button onClick={() => setAddRecipient(true)}>
              Add a recipient
            </button>
            </div> */}
            <TodoList user={user} space={space}/>
          </div>

          {addRecipient && (
            <CreateRecipient
              space={space}
              setRefreshRecipients={setRefreshRecipients}
            />
          )}
          <div className="box">
           
          </div>

        </>
      ) : (
        <div>Loading</div>
      )}
    </div>
  );
}
