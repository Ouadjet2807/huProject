import React, { useEffect, useState } from "react";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import api from "../../api/api";
export default function CreateCategory({ show, setShow, agenda }) {
  let colors = [
    {background: "#ffcabde6", text:"#d49687ff"},
    {background: "#ffdb87d7", text: "#bd9947ff"},
    {background: "#fff395cf", text: "#a49837ff"},
    {background: "#8eff6fae", text: "#4a9136ff"},
    {background: "#92f0f9b7", text: "#2d787cff"},
    {background: "#7eb6fbc7", text: "#3e6391ff"},
    {background: "#c6bdffc5", text: "#564d94ff"},
    {background: "#f3bdffc8", text: "#874397ff"},
    {background: "#ffbdd2da", text: "#8a455bff"},
    {background: "#ffd3a3d7", text: "#a0774bff"},
  ];

  const [newCategory, setNewCategory] = useState({
    name: "",
    color: colors[0],
  });

  const handleClose = () => {
    setShow(false);
  };

  const handleSubmit = async () => {
    try {
      await api.post(
        "http://127.0.0.1:8000/api/agenda_item_categories/",
        newCategory
      );
      setNewCategory({
        name: "",
        color: colors[0],
      });
      handleClose();
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    if (!agenda) return;

    setNewCategory((prev) => ({
      ...prev,
      agenda_id: agenda.id,
      agenda: agenda,
    }));
  }, [agenda]);

  return (
    <Modal show={show} onHide={handleClose} className="create-category-modal">
      <Modal.Header closeButton>
        <Modal.Title>Créer une catégorie</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <form action="" className="add-event">
          <label htmlFor="category">Nom</label>
          <input
            type="text"
            name="category"
            id=""
            placeholder="Ex : médical, administratif..."
            onChange={(e) =>
              setNewCategory((prev) => ({ ...prev, name: e.target.value.trim() }))
            }
          />
          <label>Couleur</label>
          <div className="colors">
            {colors.map((color) => {
              return (
                <div
                  className={`color ${
                    newCategory.color.background === color.background ? "selected" : ""
                  }`}
                  onClick={() =>
                    setNewCategory((prev) => ({ ...prev, color: color }))
                  }
                >
                  <div className="center" style={{ background: color.background, border: `1px solid ${color.text}` }}></div>
                </div>
              );
            })}
          </div>
        </form>
      </Modal.Body>
      <Modal.Footer>
        <Button onClick={handleSubmit}>Créer</Button>
        <Button variant="secondary" onClick={handleClose}>
          Annuler
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
