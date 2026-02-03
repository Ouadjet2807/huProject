import React, { useState, useEffect, useContext } from 'react'
import Loader from './Loader'
import { FaUserMd } from "react-icons/fa";
import Button from 'react-bootstrap/esm/Button';
import api from '../api/api';
import CreateSpecialist from './modals/CreateSpecialist';
import { AuthContext } from '../context/AuthContext';
import { LuPhone } from "react-icons/lu";
import { HiOutlineLocationMarker } from "react-icons/hi";

export default function Specialists({recipient}) {

  const [specialists, setSpecialists] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAddSpecialist, setShowAddSpecialist] = useState(false)
  const [selectedSpecialist, setSelectedSpecialist] = useState()

  const { space } = useContext(AuthContext)

  const selectSpecialist = (specialist) => {
    console.log(specialist);
    let json_specialist = JSON.stringify(specialist)
    setSelectedSpecialist(JSON.parse(json_specialist))
    setShowAddSpecialist(true)
  }

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

  useEffect(() => {
    const getSpecialist = async () => {
      try {
        const res = await api.get('http://127.0.0.1:8000/api/healthcare_professionals/')
        console.log(res.data);
        
      } catch (error) {
        console.log(error);
        
      }
    }

    getSpecialist()
  }, [])

  useEffect(() => {
    if(Object.keys(recipient).includes('healthcare_professionals')) {
      const formatted_data = formatSpecialist(recipient.healthcare_professionals)
      setSpecialists(formatted_data)
      setLoading(false)
    }
  }, [recipient])

  console.log(specialists);


  return (
    <div id="recipientSpecialists">
      <CreateSpecialist show={showAddSpecialist} setShow={setShowAddSpecialist} space={space} recipient={recipient} preloadedData={selectedSpecialist} setSelectedSpecialist={setSelectedSpecialist} />
      <h3>Spécialistes de la santé</h3>
      {!loading ?

        <div className="specialists-container" style={{alignItems: specialists.length <= 0 ? 'center' : 'start'}}>
          {specialists.length > 0 ?

            specialists.map(item => {
             return (<div className="specialist" onClick={() => selectSpecialist(item)}>
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
            <small style={{textAlign: 'center', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gridColumn: '2'}}><FaUserMd /> Aucun spécialiste</small>
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
