import React, { useContext } from 'react'
import { AuthContext } from '../context/AuthContext'

export default function () {

    const { user } = useContext(AuthContext)

    
  return (
    <div id="account">
        <h1>Hello {user && user.first_name}</h1>

    </div>
  )
}
