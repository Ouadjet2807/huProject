import React, { useState, useEffect, useContext } from "react";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import axios from "axios";
import { IoIosSearch } from "react-icons/io";
import { AuthContext } from "../../context/AuthContext";
import {v4 as uuidv4} from "uuid"
import moment from "moment";
import "moment/locale/fr";
import api from "../../api/api";

export default function InviteUserModal({ show, setShow }) {

    moment.locale("fr");
    const { user, space } = useContext(AuthContext)

    const [formData, setFormData] = useState({
        email: "",
        role: 4,
        space: "",
        sender: "",
        token: "",
        created_at: moment().format(),
        expires_at: moment().add(1, "days").format(),
        accepted: false,
    })

    const roles = [
        {"administrateur": 2},
        {"editeur": 3},
        {"lecteur": 4},
    ]

    const handleChange = (e) => {
        if(!e.target .value) return

        let value = e.target.type === "email" ? e.target.value : parseInt(e.target.value)

        setFormData(prev => (
            {
                ...prev,
                [e.target.name]: value,
            }
        ))
    }

    const handleSubmit = async () => {

        console.log(formData);
        

        try {
            let post = await api.post("http://127.0.0.1:8000/api/invitations/", formData)
            console.log('Success', post);
            
        }
        catch (error) {
            console.log(error);
            
        }
        
    }

    const handleClose = () => {
        setShow(false);
    };

    useEffect(() => {

        console.log(space);
        
        setFormData(prev => ({
        ...prev,
        sender: user.id,
        space: space.id,
        token: uuidv4(),
    }))
    }, [space, user])

  console.log(formData);

  return (
    <Modal show={show} onHide={handleClose} id="searchTreatmentModal">
      <Modal.Header closeButton>
        <Modal.Title>Inviter une personne</Modal.Title>
      </Modal.Header>
      <Modal.Body>
       <form action="">
        <input type="email" name="email" id="" onChange={(e) => handleChange(e)}/>
        <select name="access_level" id="" onChange={(e) => handleChange(e)}>
            {roles.map(item => {
                return <option value={Object.values(item)[0]}>{Object.keys(item)[0]}</option>
            })}
        </select> 
       </form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleSubmit}>
          Envoyer
        </Button>
        <Button variant="secondary" onClick={handleClose}>
          Annuler
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
