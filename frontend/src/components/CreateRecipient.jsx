import React, {useContext, useEffect, useState} from 'react'
import axios from 'axios'
import { AuthContext } from '../context/AuthContext'
import api from '../api/api'

export default function CreateRecipient({space, setRefreshRecipients}) {

  const { user } = useContext(AuthContext)

  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    birth_date: "",
    gender: "",
    medical_info: "",
    space_id: space.id,
  })

  const handleChange = (e) => {

    setFormData(prev => ({
        ...prev,
        [e.target.name]: e.target.value,
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    try {
        const response = await api.post("http://127.0.0.1:8000/api/recipients/", formData)
        console.log("Success!", response.data)
        setRefreshRecipients(true)
    }
    catch (error) {
        console.log(error);
        
    }
  }



  console.log(formData);
  

  return (
    <div>
      <form action="" method="post">
        <input type="text" name="first_name" id="" placeholder="Prénom" value={formData.first_name} onChange={(e) => handleChange(e)}/>
        <input type="text" name="last_name" id="" placeholder="Nom" value={formData.last_name} onChange={(e) => handleChange(e)}/>
        <label htmlFor="birth_date">Date de naissance</label>
        <input type="date" name="birth_date" id="" value={formData.birth_date}  onChange={(e) => handleChange(e)}/>
        <select name="gender" id=""  onChange={(e) => handleChange(e)}>
            <option value="" selected>Gender</option>
            <option value="F">F</option>
            <option value="M">M</option>
            <option value="N">N</option>
        </select>
        <button type="submit" onClick={(e) => handleSubmit(e)}>Ajouter</button>
      </form>
    </div>
  )
}
 