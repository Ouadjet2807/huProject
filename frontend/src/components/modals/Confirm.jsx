import React, { useEffect, useState, useContext } from "react";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import api from "../../api/api";
import Form from "react-bootstrap/Form";
import FloatingLabel from "react-bootstrap/FloatingLabel";
import { ToastContext } from "../../context/ToastContext";

export default function Confirm({ show, setShow, action, text, setReturnValue }) {
  const { setShowToast, setMessage, setColor } = useContext(ToastContext);

  const handleActionError = () => {
    console.log('error');
    setMessage("Une erreur s'est produite veuillez-réessayer")
    setColor("danger");
    setShowToast(true);
    setReturnValue(false)
  };

  const handleActionSuccess = () => {
    console.log('success');     
    setMessage("")
    setColor("success");
    setShowToast(true);
    setReturnValue(true)
    handleClose();
  };

  const handleClose = () => {
    setShow(false);
  };

  const process = () => {

    try {
      action()
      handleActionSuccess()
    } catch (error) {
      console.log(error);
      handleActionError()
    }

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
        <Button variant="outline-danger" onClick={process}>
          Oui, supprimer
        </Button>
        <Button variant="outline-secondary" onClick={() => setShow(false)}>
          Annuler
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
