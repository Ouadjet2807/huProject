import React, { useState, useEffect, useContext } from "react";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import Form from "react-bootstrap/Form"
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
        role: 3,
        space: "",
        sender: "",
        token: "",
        created_at: moment().format(),
        expires_at: moment().add(1, "days").format(),
        accepted: false,
    })

    const roles = [
        {"administrateur": 1},
        {"editeur": 2},
        {"lecteur": 3},
    ]

    const handleChange = (e) => {window.location.pathname.includes("invite")
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
      if(!user) return
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
    <Modal show={show} onHide={handleClose} id="inviteUserModal">
      <Modal.Header closeButton>
        <Modal.Title>Inviter une personne</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p>Saisissez l'adresse email de la personne que vous souhaitez inviter ainsi que son niveau d'accès</p>
       <form action="">
        <Form.Control type="email" size="sm" name="email" id="" aria-describedby="basic-addon" onChange={(e) => handleChange(e)} placeholder="Email"/>
        <Form.Select name="access_level" id="" onChange={(e) => handleChange(e)}>
            <option disabled>Choisissez un rôle</option>
            {roles.map(item => {
                return <option value={Object.values(item)[0]}>{Object.keys(item)[0]}</option>
            })}
        </Form.Select> 
       </form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="aqua" onClick={handleSubmit}>
          Envoyer une invitation
        </Button>
        <Button variant="outline-secondary" onClick={handleClose}>
          Annuler
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
