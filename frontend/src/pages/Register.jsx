import React, { useContext, useEffect, useState} from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import { v4 as uuidv4 }from 'uuid'
import { AuthContext } from '../context/AuthContext'

export default function Register() {

  const [isLoading, SetIsLoading] = useState(false)

  const [formData, setFormData] = useState({
    email: "",
    username: "",
    last_name: "",
    first_name: "",
    password: "",
    confirm_password: "",
  })

  const [formValidation, setFormValidation] = useState({
    status: "",
    message: ""
  })

  const navigate = useNavigate()

  const { register } = useContext(AuthContext)

  const handleChange = (e) => {
    setFormData(prev => ({
        ...prev,
        [e.target.name]: e.target.value,
        
    }))

        console.log(formData)
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if(isLoading) {
        return;
    }
    
    SetIsLoading(true)

    try {
        
        register(formData)
        setFormValidation({
            status: "success",
            message: "Registered successfully !"
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


  useEffect(() => {
    if(formData.first_name.length > 0 && formData.last_name.length > 0) {

        const username = formData.first_name[0].toLowerCase() + formData.last_name.toLowerCase() + uuidv4().slice(0,4)
        
        setFormData(prev => ({
            ...prev,
            username: username
        }))
    }
    
  }, [formData.first_name, formData.last_name])
  


  return (
    <div id='register'>
        <h2>Register</h2>
        {formValidation.message != "" &&
            <div className={`validation ${formValidation.status}`}>
                {formValidation.message}
            </div>
        }
        <form>
            <input type="email" name="email" id="" value={formData.email} placeholder='Email' onChange={(e) => handleChange(e)}/>
            <input type="text" name="first_name" id="" value={formData.first_name} placeholder='First name' onChange={(e) => handleChange(e)}/>
            <input type="text" name="last_name" id="" value={formData.last_name} placeholder='Last name' onChange={(e) => handleChange(e)}/>
            <input type="password" name="password" id="" value={formData.password} placeholder='Password' onChange={(e) => handleChange(e)}/>
            <input type="password" name="confirm_password" id="" value={formData.confirm_password} placeholder='Confirm password' onChange={(e) => handleChange(e)}/>
            <input type="submit" value="Register" disabled={isLoading} onClick={(e) => handleSubmit(e)}/>
        </form>
    </div>
  )
}
