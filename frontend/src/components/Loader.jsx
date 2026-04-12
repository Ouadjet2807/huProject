import React from "react";
import Spinner from 'react-bootstrap/Spinner';

export default function Loader({overlay}) {
  return (
    <div data-testid="loader" className={overlay ? "loader-container overlay" : "loader-container"}>
      <div className="loader">
        <Spinner animation="grow" size="sm"/>
        <Spinner animation="grow" size="sm"/>
        <Spinner animation="grow" size="sm"/>
      </div>
    </div>
  );
}
