
import { useEffect, useRef, useState } from 'react'

import { Bounce, ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useUser } from '@supabase/auth-helpers-react';
export default function Admin() {
  const [date, setDate] = useState(formatDate(new Date(Date.now())))
  const [timeSlots, setTimeSlots] = useState([])
  const [sortedTimeSlots, setSortedTimeSlots] = useState([])
  const [selectedTimeSlot, setSelectedTimeSlot] = useState(null)
  const [capacity, setCapacity] = useState(0);
  const [length, setLength] = useState(0);
  const [capacityerror, setCapacityError] = useState(false);
  const [lengthError, setLengthError] = useState(false);
  const [originalLength, setOriginalLength] = useState(0);
  const [success, setSuccess] = useState(false);
  const [settings, setSettings] = useState(false);
  const [adjustCapacity, setAdjustCapacity] = useState(false);
  const supabase = createClientComponentClient();
  const popupRef = useRef(null);
  const settingsPopupRef = useRef(null);

  interface RequestBody {
    date: string,
    adjusted_capacity: number,
    refresh_token? : string,
  } 

  useEffect(() => {
    const calculateRemainingCapacity = (timeslot) => {
      const totalReservations = timeslot.reservations ? timeslot.reservations.length : 0;
      return timeslot.capacity - totalReservations;
    };

    const sortedAndCalculatedSlots = timeSlots.map(timeslot => ({
      ...timeslot,
      remaining_capacity: calculateRemainingCapacity(timeslot)
    })).sort((a, b) => a.start_time.localeCompare(b.start_time));

    setSortedTimeSlots(sortedAndCalculatedSlots);
  }, [timeSlots]);

  useEffect(() => {
    fetchTimeSlots();
    fetchSettings();
  }, [date])

  useEffect(() => {    
    setCapacityError(false);
    setSuccess(false)
    setCapacity(selectedTimeSlot?.capacity)
    setAdjustCapacity(false);
  }, [selectedTimeSlot])

  useEffect(() => {
    setSuccess(false)
  }, [settings])

  useEffect(() => {
    setCapacity(null);
  }, [success])

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (popupRef.current && !popupRef.current.contains(event.target)) {
        setSelectedTimeSlot(null); 
        return;
      }
      if (settingsPopupRef.current && !settingsPopupRef.current.contains(event.target)) {
        setSettings(false); 
        return;
      }
    };
  
    if (selectedTimeSlot) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    if (settings) {
        document.addEventListener("mousedown", handleClickOutside);
    }
  
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [selectedTimeSlot, settings]);

  function handleDateChange(value) {
    setDate(value)
  }

  function formatDate(date : Date) : string{
    const formattedDate = date.toISOString().slice(0, 10);
    return formattedDate
  }

  async function fetchTimeSlots(){
    const session = await supabase.auth.getSession();
    if(!session){
        window.location.href = '/auth/login'
    }
    const token = session.data.session?.access_token;
    const refresh = session.data.session?.refresh_token;

    const res = await fetch(`/api/timeslots/admin/overview/${date}`, {
    method: "POST",
    headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
        'refresh_token': refresh
    })})
    const data = await res.json();
    setTimeSlots(data?.timeslots);
  }

  async function cancelReservation(reservering){
    const session = await supabase.auth.getSession();
    if(!session){
        window.location.href = '/auth/login'
    }
    const token = session.data.session?.access_token;
    const refresh = session.data.session?.refresh_token;
    const res = await fetch(`/api/timeslots/admin/cancel/${reservering.id}`, 
    {
      method : "DELETE", 
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        'refresh_token': refresh
      })
    })
    if(res.ok){
        await fetch(`/api/email/new`, 
          {
            method: "POST",
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              type: 'cancel_confirmation_admin',
              reservation: {  
                id: reservering.id,
                email: reservering.email,
                name: reservering.name,
                date: reservering.date,
              }
            })
          }
        )
        toast.success('Reservering succesvol geannuleerd!', {
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
        setSelectedTimeSlot(old => {
            const updatedReservations = old.reservations.filter(reservation => reservation.id !== reservering.id);
            return { ...old, reservations: updatedReservations };
        });
          
        await fetchTimeSlots();
        return;
      }else{
        toast.error('Fout bij het annuleren van de reservering, probeer het opnieuw!', {
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

  async function fetchSettings(){
    const {data: settingData} = await supabase.from('settings').select('*').eq('setting_name', 'timeslot_duration')

    if(settingData){
        setLength(parseInt(settingData[0].setting_value));
        setOriginalLength(parseInt(settingData[0].setting_value));
    }
  }

  function handleTimeSlotSelection(value){
    setSelectedTimeSlot(value)
  }

  function reformatDate(date: string) : string{
    const parts = date.split('-')
    return parts.reverse().join('-')
  }
  async function handleSettingsChange() {
    const session = await supabase.auth.getSession();
    if(!session){
        window.location.href = '/auth/login'
    }
    const token = session.data.session?.access_token;
    const refresh = session.data.session?.refresh_token;

    let anyErrors = false;
    if(typeof length !== 'number' || length < 1){
      setLengthError(true);
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
    if(originalLength == length){
        toast.warn('Nieuwe tijdslot lengte is gelijk aan de oude!', {
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
    setLengthError(false);
    const res = await fetch(`/api/timeslots/admin/edit/duration`, 
    {
      method : "PUT", 
      body: JSON.stringify({"duration": length, "refresh_token": refresh}),
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    })
    if(res.ok){
      toast.success('Instellingen succesvol aangepast!', {
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
      setSuccess(true)
      setOriginalLength(length);
      await fetchTimeSlots();
      return;
    }else{
      toast.error('Fout bij het aanpassen van de instellingen, probeer het opnieuw!', {
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
  async function handleSubmit(repeat : boolean){
    const session = await supabase.auth.getSession();
    if(!session){
        window.location.href = '/auth/login'
    }
    const token = session.data.session?.access_token;
    const refresh = session.data.session?.refresh_token;
    

    let anyErrors = false;
    if(typeof capacity !== 'number' || capacity < 0){
      setCapacityError(true);
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
    setCapacityError(false);
    const requestBody : RequestBody = {
      date: date,
      adjusted_capacity: capacity,
      refresh_token: refresh
    }
    if(repeat == false){
        const res = await fetch(`/api/timeslots/admin/override/${selectedTimeSlot.template_id}`, 
        {
          method : "POST", 
          body: JSON.stringify(requestBody),
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        })
        if(res.ok){
          toast.success('Tijdslot succesvol aangepast!', {
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
          setSuccess(true)
          await fetchTimeSlots();
          return;
        }else{
          toast.error('Fout bij het aanpassen van de tijdslot, probeer het opnieuw!', {
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
    }else{
       
        
        const res = await fetch(`/api/timeslots/admin/template/${selectedTimeSlot.template_id}`, 
        {
          method : "PUT", 
          body: JSON.stringify({
            default_capacity: capacity,
            refresh_token: refresh
          }),
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        })
        const res2 = await fetch(`/api/timeslots/admin/override/${selectedTimeSlot.template_id}`, 
        {
          method : "POST", 
          body: JSON.stringify(requestBody),
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        })
        if(res.ok && res2.ok){
          toast.success('Tijdslot succesvol aangepast!', {
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
          setSuccess(true)
          await fetchTimeSlots();
          return;
        }else{
          toast.error('Fout bij het aanpassen van de tijdslot, probeer het opnieuw!', {
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

  }
  


  return (
    <div className='h-screen flex w-full justify-center'>
      <div className='flex w-10/12 mt-24'>
        <ToastContainer/>
        <div className={`w-full flex flex-col gap-4 ${selectedTimeSlot || settings ? 'blur-sm pointer-events-none': ''}`}>
          <p className='font-bold text-2xl'>Datum:</p>
          <div>
            <input value={date} onChange={(e) => {handleDateChange(e.target.value)}} type='date' className='clickable border-2 border-black py-1 px-5'/>
          </div>
          <div onClick={() => {setSettings(true)}} className='self-end clickable hover:bg-slate-200 flex flex-row gap-4 items-center border-2 border-black w-fit px-5 py-1'>
            <p className='text-xl font-semibold'>Instellingen</p>
            <svg className='h-fit w-5' width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
              <g clip-path="url(#clip0_182_610)">
              <path d="M15.4969 5.20625C15.5969 5.47813 15.5125 5.78125 15.2969 5.975L13.9437 7.20625C13.9781 7.46563 13.9969 7.73125 13.9969 8C13.9969 8.26875 13.9781 8.53438 13.9437 8.79375L15.2969 10.025C15.5125 10.2188 15.5969 10.5219 15.4969 10.7937C15.3594 11.1656 15.1937 11.5219 15.0031 11.8656L14.8562 12.1187C14.65 12.4625 14.4187 12.7875 14.1656 13.0938C13.9812 13.3188 13.675 13.3937 13.4 13.3062L11.6594 12.7531C11.2406 13.075 10.7781 13.3438 10.2844 13.5469L9.89375 15.3313C9.83125 15.6156 9.6125 15.8406 9.325 15.8875C8.89375 15.9594 8.45 15.9969 7.99687 15.9969C7.54375 15.9969 7.1 15.9594 6.66875 15.8875C6.38125 15.8406 6.1625 15.6156 6.1 15.3313L5.70937 13.5469C5.21562 13.3438 4.75312 13.075 4.33437 12.7531L2.59687 13.3094C2.32187 13.3969 2.01562 13.3188 1.83125 13.0969C1.57812 12.7906 1.34687 12.4656 1.14062 12.1219L0.993746 11.8687C0.803121 11.525 0.637496 11.1687 0.499996 10.7969C0.399996 10.525 0.484371 10.2219 0.699996 10.0281L2.05312 8.79688C2.01875 8.53438 2 8.26875 2 8C2 7.73125 2.01875 7.46563 2.05312 7.20625L0.699996 5.975C0.484371 5.78125 0.399996 5.47813 0.499996 5.20625C0.637496 4.83438 0.803121 4.47813 0.993746 4.13438L1.14062 3.88125C1.34687 3.5375 1.57812 3.2125 1.83125 2.90625C2.01562 2.68125 2.32187 2.60625 2.59687 2.69375L4.3375 3.24688C4.75625 2.925 5.21875 2.65625 5.7125 2.45312L6.10312 0.66875C6.16562 0.384375 6.38437 0.159375 6.67187 0.1125C7.10312 0.0375 7.54687 0 8 0C8.45312 0 8.89687 0.0375 9.32812 0.109375C9.61562 0.15625 9.83437 0.38125 9.89687 0.665625L10.2875 2.45C10.7812 2.65313 11.2437 2.92188 11.6625 3.24375L13.4031 2.69062C13.6781 2.60312 13.9844 2.68125 14.1687 2.90313C14.4219 3.20938 14.6531 3.53437 14.8594 3.87812L15.0062 4.13125C15.1969 4.475 15.3625 4.83125 15.5 5.20312L15.4969 5.20625ZM8 10.5C8.66304 10.5 9.29892 10.2366 9.76776 9.76777C10.2366 9.29893 10.5 8.66304 10.5 8C10.5 7.33696 10.2366 6.70107 9.76776 6.23223C9.29892 5.76339 8.66304 5.5 8 5.5C7.33695 5.5 6.70107 5.76339 6.23223 6.23223C5.76339 6.70107 5.5 7.33696 5.5 8C5.5 8.66304 5.76339 9.29893 6.23223 9.76777C6.70107 10.2366 7.33695 10.5 8 10.5Z" fill="#0E161D"/>
              </g>
              <defs>
              <clipPath id="clip0_182_610">
              <rect width="16" height="16" fill="white"/>
              </clipPath>
              </defs>
            </svg>
          </div>
          <p className='font-bold text-2xl'>Tijdslots:</p>
          {sortedTimeSlots.length > 0 ? <div className='flex flex-col items-start gap-2 max-h-[1440px] flex-wrap'>
            {sortedTimeSlots.map((timeslot, index) => {
              return (<button onClick={() => {handleTimeSlotSelection(timeslot)}} key={index} className='text-black px-5 py-1 border-2 border-black hover:bg-slate-200'>{timeslot.start_time + " - " + timeslot.end_time + " | " + timeslot.remaining_capacity + " / " + timeslot.capacity + ' Plekken vrij'}</button>)
            })}
          </div> 
          : 
          <div className=''>
            <p>Geen tijdslots beschikbaar op deze dag!</p>
          </div>}
        </div>
        {selectedTimeSlot&& 
          <div ref={popupRef} className='z-50 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 border-2 border-black bg-white w-1/2 h-fit flex flex-col gap-10 py-3'>
            <div className='flex flex-row justify-between mx-5'>
              <h2 className='text-2xl'>{"Tijdslot: " + reformatDate(selectedTimeSlot.date) + " (" + selectedTimeSlot.start_time + " - " + selectedTimeSlot.end_time + ")"}</h2>
              <button onClick={() => {setSelectedTimeSlot(null); setSuccess(false); setAdjustCapacity(false);}} className='text-3xl font-semibold select-none'>X</button>
            </div>
            {!success && <div className='flex flex-col gap-4 w-1/2 ml-5'>
              <div>
                <p>Reserveringen:</p>
                {selectedTimeSlot.reservations?.length > 0 && <div className='flex flex-col gap-2'>
                    {selectedTimeSlot.reservations.map((reservering, index) => {
                        return(<div className='border-[1px] border-black flex flex-row justify-between items-center px-5' key={index}>
                            <p className='text-xl'>{reservering.name + " | " + reservering.email}</p>
                            <p onClick={() => {cancelReservation(reservering)}} className='text-red-600 text-xl font-bold clickable'>X</p>
                        </div>)
                    } )}
                </div>}
                {(!selectedTimeSlot.reservations || selectedTimeSlot.reservations?.length == 0) && <p className=''>Geen reserveringen gevonden!</p>}
              </div>
              {!adjustCapacity && <div>
                <button onClick={() => {setAdjustCapacity(true)}} className='border-2 border-black hover:bg-slate-200 clickable px-5 py-1'>Capaciteit Aanpassen</button>
                </div>}
              {adjustCapacity && <div>
                <p>Capaciteit:</p>
                <input value={capacity} onChange={(e) => {setCapacity(parseInt(e.target.value)); setCapacityError(false);}} placeholder='5' type='number' className={`border-2 ${capacityerror ? 'border-red-600' : 'border-black'} w-full px-3 py-1 appearance-none`}/>
              </div>}
              {adjustCapacity && <div className='flex flex-row gap-4'>
                <button className='clickable border-2 border-black hover:bg-slate-200 px-5 py-1 mb-2' onClick={() => {handleSubmit(false)}}>Eenmalig Aanpassen!</button>
                <button className='clickable border-2 border-black hover:bg-slate-200 px-5 py-1 mb-2' onClick={() => {handleSubmit(true)}}>Herhalend Aanpassen!</button>
              </div>}
            </div>}
            {success && <div className='flex items-center justify-center ml-5'>
              <p className='text-2xl text-center mb-10'>Tijdslot aangepast!</p>
            </div>}
          </div>
        }

        {settings && 
          <div ref={settingsPopupRef} className='z-50 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 border-2 border-black bg-white w-1/2 h-fit flex flex-col gap-10 py-3'>
            <div className='flex flex-row justify-between mx-5'>
              <h2 className='text-2xl'>{"Instellingen:"}</h2>
              <button onClick={() => {setSettings(false); setSuccess(false);}} className='text-3xl font-semibold select-none'>X</button>
            </div>
            {!success && <div className='flex flex-col gap-4 w-1/2 ml-5'>
              <div>
                <p>Tijdslot Lengte (minuten):</p>
                <input value={length} onChange={(e) => {setLength(parseInt(e.target.value)); setLengthError(false)}} placeholder='15' type='number' className={`border-2 ${lengthError ? 'border-red-600' : 'border-black'} w-full px-3 py-1 appearance-none`}/>
              </div>
              <div className='flex flex-row gap-4'>
                <button className='clickable border-2 border-black hover:bg-slate-200 px-5 py-1 mb-2' onClick={() => {handleSettingsChange()}}>Opslaan!</button>
              </div>
            </div>}
            {success && <div className='flex items-center justify-center ml-5'>
              <p className='text-2xl text-center mb-10'>Instellingen aangepast!</p>
            </div>}
          </div>
        }
      </div>
    </div>
  )
}
