import React from "react";
import Toast from "react-bootstrap/Toast";
import ToastContainer from "react-bootstrap/ToastContainer";
import { BsFillPatchCheckFill } from "react-icons/bs";
import { BsPatchPlusFill } from "react-icons/bs";
export default function Toaster({ setShow, show, delay, message, color }) {


    console.log(message);
    
  return (
    <ToastContainer className="p-3" position="top-end" style={{ zIndex: 1 }}>
      <Toast
        onClose={() => setShow(false)}
        show={show}
        delay={delay}
        autohide
        style={{borderLeftColor: color === 'success' ? "#5DCC6F" : color === "danger" ? "#F85940" : "#e9ecf2dd"}}
        className={color === 'light' ? 'text-dark' : 'text-light'}
      >
        <Toast.Header>
          <div className="toast-header-content">

          <div className={`icon ${color}`}>
            {
                color === "success" 
                
                ?
                
                <BsFillPatchCheckFill />
                
                : color === "danger" &&
                
                <BsPatchPlusFill />
            }
          </div>
          <div className="info">
            <strong>{color === "success" ?
                "Succès"
                : color === "danger" &&
                "Erreur"
            }</strong>
          <p>{message}</p>
          </div>
        </div>
          {/* <small>11 mins ago</small> */}
        </Toast.Header>
      
      </Toast>
    </ToastContainer>
  );
}
