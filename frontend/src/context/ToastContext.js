import React, { createContext, useContext, useState, useEffect } from "react";

export const ToastContext = createContext();


export const ToastProvider = ({ children }) => {
    const [showToast, setShowToast] = useState(false)
    const [message, setMessage] = useState('')
    const [color, setColor] = useState('')

    const value = {showToast, setShowToast, message, setMessage, color, setColor}

    return <ToastContext.Provider value={value}>{children}</ToastContext.Provider>;
}
