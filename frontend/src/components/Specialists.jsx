import React, { useState, useEffect, useContext } from 'react'
import Loader from './Loader'
import { FaUserMd } from "react-icons/fa";
import Button from 'react-bootstrap/esm/Button';
import api from '../api/api';
import CreateSpecialist from './modals/CreateSpecialist';
import { AuthContext } from '../context/AuthContext';

export default function Specialists() {

  const [specialists, setSpecialists] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAddSpecialist, setShowAddSpecialist] = useState(false)

  const { space } = useContext(AuthContext)

  const getSpecialists = async () => {
    try {
      const res = await api.get("http://127.0.0.1:8000/api/healthcare_professional/")
      setSpecialists(res.data)
      setLoading(false)
    } catch (error) {
      console.log(error);
      
    }
  }

  useEffect(() => {
    getSpecialists()
  }, [])

  return (
    <div id="recipientSpecialists">
      <CreateSpecialist show={showAddSpecialist} setShow={setShowAddSpecialist} space={space}/>
      <h3>Spécialistes de la santé</h3>
      {!loading ?
      
        <div className="specialists-container">
          {specialists.length > 0 ?
          
            specialists.map(item => {
              <div className="specialist">
                {item}
              </div>
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
        <FaUserMd /> Ajouter un specialists
      </Button>
    </div>
  )
}
