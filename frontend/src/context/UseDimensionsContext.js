import React, { createContext, useContext, useState, useEffect } from "react";

export const UseDimensionsContext = createContext();

export const UseDimensionProvider = ({ children }) => {

    const [width, setWidth] = useState(window.innerWidth)
    const [height, setHeight] = useState(window.innerHeight)

    window.addEventListener("resize", () => {
        setWidth(window.innerWidth)
        setHeight(window.innerHeight)
    })

   let value = {
        height,
        width
    }

   return <UseDimensionsContext.Provider value={value}>{children}</UseDimensionsContext.Provider>;
}