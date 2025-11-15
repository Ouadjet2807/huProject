import React, { use, useEffect, useState } from 'react'
import Button from 'react-bootstrap/esm/Button'
import SearchTreatmentsModal from './modals/SearchTreatmentsModal'
import MedicationDetailsModal from './modals/MedicationDetailsModal'


export default function RecipientTreatments({formData, space}) {

  const [addTreatment, setAddTreatment] = useState()
  const [showAddTreatment, setShowAddTreatement] = useState(false)
  const [showMedicationDetails, setShowMedicationDetails] = useState(false)
  const [selectedMedication, setSelectedMedication] = useState({})

  console.log(selectedMedication);

  useEffect(() => {
    if(Object.keys(selectedMedication).length > 0) {
        setShowAddTreatement(false)
        setShowMedicationDetails(true)
    }
  }, [selectedMedication])

  useEffect(() => {
    if(showMedicationDetails) {
        setShowAddTreatement(false)
    }

  }, [showMedicationDetails])
  

  return (
    <div id="recipientTreatments">

        <SearchTreatmentsModal setShow={setShowAddTreatement} show={showAddTreatment} setSelectedMedication={setSelectedMedication}/>
        <MedicationDetailsModal setShow={setShowMedicationDetails} showAddTreatmentModal={setShowAddTreatement} show={showMedicationDetails} medication={selectedMedication}/>
      <h3>Traitements médicaux</h3>
      <div className="treatments-list">
        {formData.treatments.length > 0 ?
        formData.treatments.map(item => {
            return <div className="treatment"></div>
        })

        :
        <>
        <p>Aucun traitement enregistré</p>
        <Button onClick={() => setShowAddTreatement(true)}>Ajouter un traitement</Button>
        </>

        }
      </div>
    </div>
  )
}
