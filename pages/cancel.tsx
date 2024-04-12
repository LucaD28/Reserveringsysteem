import React from 'react'
import Head from 'next/head'
import Image from 'next/image'
import styles from '../styles/Home.module.css'
import { useEffect, useRef, useState } from 'react'
import { TimeSlot, TimeSlotType } from '../helpers/types/types'
import { Bounce, ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useRouter } from 'next/router'
export default function Cancel() {
    const router = useRouter();
    const {id, key, name, email, date} = router.query
    const [enabled, setEnabled] = useState(true);

    async function handleCancellation(){
        if(!enabled) return;
        setEnabled(false);
        const res = await fetch(`/api/timeslots/cancel/${id}`, {
            method: "DELETE",
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                "key": key
            })
        })
        if(res.ok){
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
            await fetch(`/api/email/new`, 
            {
              method: "POST",
              headers: {
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                type: 'cancel_confirmation',
                reservation: {  
                  id: id,
                  email: email,
                  name: decodeURIComponent(name.toString()),
                  date: date,
                }
              })
            }
          )
            setTimeout(() => {
                window.location.href = "/"
            }, 5000);
            return;
        }else{
            toast.error('Fout bij het annuleren van uw reservering!', {
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
            setEnabled(true);
            return;
        }
    }
    return (
        <div className='h-screen flex w-full justify-center'>
          <div className='flex w-10/12 mt-24'>
            <ToastContainer/>
            <div className='flex items-center justify-center w-full h-full'>
            <button onClick={handleCancellation} className='border-2 border-black hover:bg-slate-200 clickable px-5 py-1'>Bevestig Annuleren</button>
            </div>
          </div>
        </div>
    )
    
}
