import React, { useState, useEffect, useContext } from 'react'
import Loader from './Loader'
import { FaUserMd } from "react-icons/fa";
import Button from 'react-bootstrap/esm/Button';
import api from '../api/api';
import CreateSpecialist from './modals/CreateSpecialist';
import { AuthContext } from '../context/AuthContext';
import { LuPhone } from "react-icons/lu";
import { HiOutlineLocationMarker } from "react-icons/hi";

export default function Specialists() {

  const [specialists, setSpecialists] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAddSpecialist, setShowAddSpecialist] = useState(false)

  const { space } = useContext(AuthContext)

  const formatSpecialist = (data) => {

    let formatted_data = data

    data.forEach((item, index) => {
      if(typeof item.contact == 'string') {
        let parsed_contact = JSON.parse(item.contact)
        let splitted_address = parsed_contact.address.split(",")

        let phone_number_str = `0${parsed_contact.phone_number[0]}`
        let phone_number = phone_number_str.match(/.{1,2}/g)

        let new_contact = {
          address: {
            number: splitted_address[0].slice(0,2),
            street: splitted_address[0].slice(2),
            city: splitted_address[1]
          },
          phone_number: phone_number.join(" ")
        }

      formatted_data[index].contact = new_contact

      }
    })

    return formatted_data
  }

  const getSpecialists = async () => {
    try {
      const res = await api.get("http://127.0.0.1:8000/api/healthcare_professionals/")

      const formatted_data = formatSpecialist(res.data)
      setSpecialists(formatted_data)
      setLoading(false)
    } catch (error) {
      console.log(error);
      
    }
  }



  useEffect(() => {
    getSpecialists()
  }, [])
  
  console.log(specialists);
  

  return (
    <div id="recipientSpecialists">
      <CreateSpecialist show={showAddSpecialist} setShow={setShowAddSpecialist} space={space}/>
      <h3>Spécialistes de la santé</h3>
      {!loading ?

        <div className="specialists-container">
          {specialists.length > 0 ?

            specialists.map(item => {
             return (<div className="specialist">
              <div className="icon">
                <FaUserMd />
              </div>
                <div className="info">
                <h5>{item.name}</h5>
                <small>{item.specialty}</small>
                <span><HiOutlineLocationMarker /> {item.contact.address && item.contact.address.city}</span>
                <span><LuPhone/> {item.contact.phone_number}</span>
                </div>
              </div>)
            })
            :
            <small style={{textAlign: 'center', width: '100%', display: 'flex'}}><FaUserMd /> Aucun spécialiste</small>
          }
        </div>

        :
        <div style={{width: "100%"}}>
        <Loader />
        </div>
    }
     <Button
        variant="aqua"
        className="add-treatment-btn"
        onClick={() => setShowAddSpecialist(true)}
      >
        <FaUserMd /> Ajouter un specialiste
      </Button>
    </div>
  )
}
