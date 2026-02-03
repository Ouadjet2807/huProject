import React, { createContext, useContext, useState, useEffect } from "react";

export const ConfirmContext = createContext();


export const ConfirmProvider = ({ children }) => {
    const [showConfirm, setShowConfirm] = useState(false)
    const [action, setAction] = useState()
    const [text, setText] = useState('')

    const value = {showConfirm, setShowConfirm, action, setAction, text, setText}

    useEffect(() => {
    if(!showConfirm) {
      setText('')
      setAction()
    }
  }, [showConfirm])


    return <ConfirmContext.Provider value={value}>{children}</ConfirmContext.Provider>;
}
