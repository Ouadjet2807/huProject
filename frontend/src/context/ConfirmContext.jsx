import React, { createContext, useContext, useState, useEffect } from "react";

export const ConfirmContext = createContext();


export const ConfirmProvider = ({ children }) => {
    const [showConfirm, setShowConfirm] = useState(false)
    const [action, setAction] = useState()
    const [returnValue, setReturnValue] = useState()
    const [closeParent, setCloseParent] = useState()
    const [text, setText] = useState('')

    const value = {showConfirm, setShowConfirm, action, setAction, text, setText, setReturnValue, returnValue}

    useEffect(() => {
    if(!showConfirm) {
      setText('')
      setAction()
    }
  }, [showConfirm])


    return <ConfirmContext.Provider value={value}>{children}</ConfirmContext.Provider>;
}
