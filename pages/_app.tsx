import { useEffect, useState } from 'react';
import '../styles/globals.css'
import { createClientComponentClient, createPagesBrowserClient } from '@supabase/auth-helpers-nextjs';
import { SessionContextProvider} from '@supabase/auth-helpers-react'
import { useRouter } from 'next/router';


function MyApp({ Component, pageProps }) {

  const [supabaseClient] = useState(() => createPagesBrowserClient())
  const supabase = createClientComponentClient()
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  useEffect(() => {
    const fetchUserData = async () => {
      const currentUser = await supabaseClient.auth.getUser()

      setUser(currentUser.data.user)
      setLoading(false);
    };

    fetchUserData();
  }, []);

  useEffect(() => {
    if (loading) return;
    if (window.location.href.includes("/auth/")) return;

    if (user == null && router.asPath == '/admin') {
      window.location.href = "/auth/login";
    }
  }, [user, loading])

  return (
  <SessionContextProvider
    supabaseClient={supabaseClient}
    initialSession={pageProps.initialSession}
  >
    <Component {...pageProps} />
  </SessionContextProvider>
  )
}

export default MyApp
