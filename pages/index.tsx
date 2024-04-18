import Head from 'next/head'
import Image from 'next/image'
import styles from '../styles/Home.module.css'
import { useEffect, useRef, useState } from 'react'
import { TimeSlot, TimeSlotType } from '../helpers/types/types'
import { Bounce, ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { uuid } from 'uuidv4'

export default function Home() {
  const supabase = createClientComponentClient();
  const [date, setDate] = useState(formatDate(new Date(Date.now())))
  const [timeSlots, setTimeSlots] = useState([])
  const [sortedTimeSlots, setSortedTimeSlots] = useState([])
  const [selectedTimeSlot, setSelectedTimeSlot] = useState(null)
  const [naam, setNaam] = useState("");
  const [email, setEmail] = useState("");
  const [naamError, setNaamError] = useState(false);
  const [emailError, setEmailError] = useState(false);
  const [confirmEmailError, setConfirmEmailError] = useState(false)
  const [confirmEmail, setConfirmEmail] = useState("")
  const [success, setSuccess] = useState(false);
  const [reserving, setReserving] = useState(false);
  const [reservedId, setReservedId] = useState("")
  const popupRef = useRef(null);
  interface RequestBody {
    date: string;
    email: string;
    name: string;
    type: TimeSlotType;
  } 

  useEffect(() => {
    if(!selectedTimeSlot){ 
      setReservedId("");
      return; 
    }
    reserveSlot(selectedTimeSlot);
  }, [selectedTimeSlot])

  useEffect(() => {
    const sorted = timeSlots.sort((a, b) => a.start_time.localeCompare(b.start_time));
    setSortedTimeSlots(sorted)
  }, [timeSlots])

  useEffect(() => {
    fetchTimeSlots();
  }, [date])

  useEffect(() => {
    setNaamError(false);
    setEmailError(false);
    setConfirmEmailError(false)
  }, [selectedTimeSlot])

  useEffect(() => {
    setNaam("");
    setEmail("");
    setConfirmEmail("")
  }, [success])

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (popupRef.current && !popupRef.current.contains(event.target)) {
        removeReservation();
        setSelectedTimeSlot(null); 
      }
    };
  
    if (selectedTimeSlot) {
      document.addEventListener("mousedown", handleClickOutside);
    }
  
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [selectedTimeSlot]);

  function handleDateChange(value) {
    setDate(value)
  }

  function formatDate(date : Date) : string{
    const formattedDate = date.toISOString().slice(0, 10);
    return formattedDate
  }

  async function fetchTimeSlots(){
    const res = await fetch(`/api/timeslots/available/${date}`)
    const data = await res.json();
    setTimeSlots(data?.timeslots);
  }

  function handleTimeSlotSelection(value){
    setSelectedTimeSlot(value)
    reserveSlot(value);
  }

  function reformatDate(date: string) : string{
    const parts = date.split('-')
    return parts.reverse().join('-')
  }

  async function handleSubmit(){
    let anyErrors = false;
    let matching = true;
    if(!email.includes('@') || !email){
      setEmailError(true);
      anyErrors = true;
    }
    if(!confirmEmail){
      setConfirmEmailError(true)
      anyErrors = true;
    }
    if(confirmEmail != email) {
      setConfirmEmailError(true);
      setEmailError(true)
      matching = false;
    }
    if(!naam){
      setNaamError(true)
      anyErrors = true;
    }
    if(anyErrors){
      toast.error('Controleer of de velden correct zijn ingevuld!', {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "light",
        transition: Bounce,
      });
      return;
    }
    if(!matching){
      toast.error('Email adressen komen niet overeen!', {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "light",
        transition: Bounce,
      });
      return;
    }
    setEmailError(false);
    setNaamError(false);
    setConfirmEmailError(false);
    const requestBody : RequestBody = {
      date: date,
      email: email,
      name: naam,
      type: selectedTimeSlot.type
    }
    await removeReservation();
    const res = await fetch(`/api/timeslots/claim/${selectedTimeSlot.id}`, 
    {
      method : "POST", 
      body: JSON.stringify(requestBody),
      headers: {
        'Content-Type': 'application/json'
      }
    })
    if(res.ok){
      toast.success('Tijdslot succesvol aangevraagd!', {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "light",
        transition: Bounce,
      });
      const data = await res.json();
      await fetch(`/api/email/new`, 
        {
          method: "POST",
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            type: 'reservation_confirmation',
            reservation: {  
              id: data.data.id,
              email: email,
              name: naam,
              date: date,
              key: data.data.key
            }
          })
        }
      )
      setSuccess(true)
      await fetchTimeSlots();
      return;
    }else{
      toast.error('Fout bij het aanvragen van de tijdslot, controleer de beschikbaarheid!', {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "light",
        transition: Bounce,
      });
      return;
    }
  }

  async function reserveSlot(timeslot){
    if(reserving) return;
    setReserving(true);
    const id = uuid();
    setReservedId(id);
    const {data, error} = await supabase.from('reservation').insert({
      id: id,
      timeslot_template: timeslot.type == 'timeslot_template' ? timeslot.id : null,
      timeslot_override: timeslot.type == 'timeslot_override' ? timeslot.id : null,
      status: 'Reserved',
      date: timeslot.date
    })
    console.log(data);
    
    if(error){
      alert(error)
    }
    setReserving(false);
  }

  async function removeReservation(){
    if(!reservedId) return;
    const {error} = await supabase.from('reservation').delete().eq('id', reservedId).eq('status', 'Reserved')
    if(error){
      alert(error)
    }
  }
  


  return (
    <div className='h-screen flex w-full justify-center'>
      <div className='flex w-10/12 mt-24'>
        <ToastContainer/>
        <div className={`w-full flex flex-col gap-4 ${selectedTimeSlot ? 'blur-sm pointer-events-none': ''}`}>
          <p className='font-bold text-2xl'>Datum:</p>
          <div>
            <input value={date} onChange={(e) => {handleDateChange(e.target.value)}} type='date' className='clickable border-2 border-black py-1 px-5'/>
          </div>
          <p className='font-bold text-2xl'>Tijdslots:</p>
          {sortedTimeSlots.length > 0 ? <div className='flex flex-col items-start gap-2 max-h-[1440px] flex-wrap'>
            {sortedTimeSlots.map((timeslot, index) => {
              return (<button onClick={() => {handleTimeSlotSelection(timeslot);}} key={index} className='text-black px-5 py-1 border-2 border-black hover:bg-slate-200'>{timeslot.start_time + " - " + timeslot.end_time + " | " + timeslot.remaining_capacity + `${timeslot.remaining_capacity == 1 ? ' Plek vrij' : ' Plekken vrij'}`}</button>)
            })}
          </div> 
          : 
          <div className=''>
            <p>Geen tijdslots beschikbaar op deze dag!</p>
          </div>}
        </div>
        {selectedTimeSlot && 
          <div ref={popupRef} className='z-50 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 border-2 border-black bg-white w-1/2 h-fit flex flex-col gap-10 py-3'>
            <div className='flex flex-row justify-between mx-5'>
              <h2 className='text-2xl'>{"Tijdslot: " + reformatDate(selectedTimeSlot.date) + " (" + selectedTimeSlot.start_time + " - " + selectedTimeSlot.end_time + ")"}</h2>
              <button onClick={() => {removeReservation(); setSelectedTimeSlot(null); setSuccess(false);}} className='text-3xl font-semibold select-none hover:text-red-600'>X</button>
            </div>
            {!success && <div className='flex flex-col gap-4 w-1/2 ml-5'>
              <div>
                <p>Volledige Naam:</p>
                <input value={naam} onChange={(e) => {setNaam(e.target.value); setNaamError(false)}} placeholder='Jan Janssen' type='text' className={`border-2 ${naamError ? 'border-red-600' : 'border-black'} w-full px-3 py-1 appearance-none`}/>
              </div>
              <div>
                <p>Email:</p>
                <input value={email} onChange={(e) => {setEmail(e.target.value); setEmailError(false)}} placeholder='janjanssen@gmail.com' type='text' className={`border-2 ${emailError ? 'border-red-600' : 'border-black'} w-full px-3 py-1 appearance-none`}/>
              </div>
              <div>
                <p>Bevestig Email:</p>
                <input value={confirmEmail} onChange={(e) => {setConfirmEmail(e.target.value); setConfirmEmailError(false)}} placeholder='janjanssen@gmail.com' type='text' className={`border-2 ${confirmEmailError ? 'border-red-600' : 'border-black'} w-full px-3 py-1 appearance-none`}/>
              </div>
              <div>
                <button className='clickable border-2 border-black hover:bg-slate-200 px-5 py-1 mb-2' onClick={handleSubmit}>Bevestig</button>
              </div>
            </div>}
            {success && <div className='flex items-center justify-center ml-5'>
              <p className='text-2xl text-center mb-10'>Afspraak bevestigd!</p>
            </div>}
          </div>
        }
      </div>
    </div>
  )
}
