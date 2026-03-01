import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../api/api";
import Loader from "./Loader";

export default function TreatmentPage() {
  const { id } = useParams();

const [treatmentData, setTreatmentData] = useState({})
  console.log(id);

  useEffect(() => {
      
      const getTreatmentData = async () => {
          if (!id) return;
          try {
            let response = await api.get(`http://127.0.0.1:8000/api/treatments/${id}`)
            console.log(response);
            setTreatmentData(response.data)
            
        }
        catch (error) {
            console.log(error);
            
        }
    }   

    getTreatmentData()
  }, [id]);

  console.log(treatmentData);
  

  return (
    <div>
      {Object.keys(treatmentData).length > 1 ?
        <div className="treatment-info">

        </div>
         : 

         <Loader />
      }
    </div>
  );
}
