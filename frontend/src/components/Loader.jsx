import React from "react";
import Spinner from 'react-bootstrap/Spinner';

export default function Loader() {
  return (
    <div className="loader-container">
      <div className="loader">
        <Spinner animation="grow" size="sm"/>
        <Spinner animation="grow" size="sm"/>
        <Spinner animation="grow" size="sm"/>
      </div>
    </div>
  );
}
