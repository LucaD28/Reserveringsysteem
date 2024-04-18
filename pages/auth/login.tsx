import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useUser } from '@supabase/auth-helpers-react'
import { useRouter } from 'next/router';
import React, { useState, useEffect } from 'react'
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function Login() {
    const supabase = createClientComponentClient()
    const router = useRouter()
    const user = useUser()

    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")

    async function login() {
        let { data } = await supabase.auth.signInWithPassword({
            email,
            password,
        })
        
        if(!data) router.reload();
        if(!data.user && !data.session){
            toast.error('Fout bij het inloggen!', {
                position: "top-right",
                autoClose: 3000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: "light",
            });
            return;
        }
        window.location.href = "/admin"
    }


    useEffect(() => {
        if(user){
            window.location.href = "/admin"
        }
    }, [user])


    return (
        <div className='h-screen w-screen flex items-center justify-center'>
            <ToastContainer/>
            <div className='flex flex-col gap-6'>
                <input value={email} className='border-2 border-black p-1' placeholder='email' onChange={(e) => setEmail(e.target.value)} type='email' />
                <input value={password} className='border-2 border-black p-1' placeholder='password' onChange={(e) => setPassword(e.target.value)} type='password' />

                <button onClick={login} className={'bg-black font-bold text-white px-3 py-1 ' + ((email && password) ? "opacity-100" : "opacity-60")}>SIGN IN</button>
            </div>
        </div>
    )
}