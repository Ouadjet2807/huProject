import React, { createContext, useContext, useState, useEffect } from "react";

export const ToastContext = createContext();


export const ToastProvider = ({ children }) => {
    const [showToast, setShowToast] = useState(false)
    const [toastMessage, setToastMessage] = useState('')
    const [color, setColor] = useState('')

    const value = {showToast, setShowToast, toastMessage, setToastMessage, color, setColor}

    useEffect(() => {
    if(!showToast) {
      setToastMessage('')
    }
  }, [showToast])
  

    return <ToastContext.Provider value={value}>{children}</ToastContext.Provider>;
}
