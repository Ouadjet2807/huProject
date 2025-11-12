import React, { useContext, useState, useEffect, use } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import { AuthContext, AuthProvider } from '../context/AuthContext'


export default function Login() {

  const [isLoading, SetIsLoading] = useState(false)

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  })

  const [formValidation, setFormValidation] = useState({
    status: "",
    message: ""
  })

  const navigate = useNavigate()

  const { login } = useContext(AuthContext)

  const handleChange = (e) => {
    setFormData(prev => ({
        ...prev,
        [e.target.name]: e.target.value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if(isLoading) {
        return;
    }
    

    SetIsLoading(true)

    try {
        login(formData.email, formData.password)

        setFormValidation({
            status: "success",
            message: "Login successfully !"
        })

        navigate("/home") 
    }
    catch(error) {
        console.log("Error", error.response.data);
        if(error.response && error.response.data) {
            Object.keys(error.response.data).forEach(field => {
                const errorMessages = error.response.data[field]
                if(errorMessages && errorMessages.length > 0) {
                    setFormValidation({
                        status: 'error',
                        message: errorMessages[0]
                    })
                } else {
                    setFormValidation({
                        status: 'error',
                        message: 'An unknown error has occured, please try again later'
                    })
                }
            })
        }
          
    }
    finally {
        SetIsLoading(false)
    }
  }

  

  return (
    <div id='login'>
        <h2>Login</h2>
        {formValidation.message != "" &&
            <div className={`validation ${formValidation.status}`}>
                {formValidation.message}
            </div>
        }
        <form>
        <input type="email" name="email" id="" value={formData.email} placeholder='Email' onChange={(e) => handleChange(e)}/>
        <input type="password" name="password" id="" value={formData.password} placeholder='Password' onChange={(e) => handleChange(e)}/>
        <input type="submit" value="Login" disabled={isLoading} onClick={(e) => handleSubmit(e)}/>
        </form>
    </div>
  )
}