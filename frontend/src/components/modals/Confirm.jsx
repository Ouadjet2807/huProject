import React, { useEffect, useState } from "react";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import api from "../../api/api";
import Form from "react-bootstrap/Form"
import FloatingLabel from "react-bootstrap/FloatingLabel";

export default function Confirm({ show, setShow, action, text }) {

    console.log(action);
    

  const handleClose = () => {
    setShow(false);
  };


  return (
    <Modal show={show} onHide={handleClose} className="confirm-modal">
      <Modal.Header closeButton>
        <Modal.Title>{text}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p>Cette action est irréversible</p>
      </Modal.Body>
      <Modal.Footer>
           <Button variant="outline-danger" onClick={action}>Ok</Button>
          <Button variant="outline-secondary" onClick={() => setShow(false)}>Annuler</Button>
      </Modal.Footer>
    </Modal>
  );
}
