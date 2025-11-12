import React from "react";
import { IoClose } from "react-icons/io5";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";

export default function ModalComponent({ content, setShow, show  }) {
  console.log(content);

  const handleClose = () => {
    setShow(false)
  }

  return (
    <Modal show={show} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>{content.title}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {content.body.map((item) => {
            return <div>{item}</div>;
          })}
        </Modal.Body>
        <Modal.Footer>
          {content.footer.map((item) => {
            return (
              <Button variant="secondary" onClick={handleClose}>
                    {item}
              </Button>
            );
          })}
        </Modal.Footer>

    </Modal>
  );
}
