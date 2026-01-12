import React from "react";
import Form from "react-bootstrap/Form";
import { MdLibraryAdd } from "react-icons/md";

export default function GroceryList() {
  return (
    <div className="list">
      <ul>
        <li>
          <Form.Check type="checkbox" label="item" id="" />
        </li>
        <li>
          <Form.Check type="checkbox" label="item" id="" />
        </li>
        <li>
          <Form.Check type="checkbox" label="item" id="" />
        </li>
        <li>
          <Form.Check type="checkbox" label="item" id="" />
        </li>
      </ul>
      <div className="add-to-list">
        <Form.Control type="text" placeholder="Normal text" />
        <div className="add-button">
          <MdLibraryAdd />
        </div>
      </div>
    </div>
  );
}
