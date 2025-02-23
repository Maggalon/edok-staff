"use client"

import { TWAContext } from "@/context/twa-context"
import { getSession } from "@/lib/session"
import { useContext, useEffect, useState } from "react"

export default function Home() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const context = useContext(TWAContext)
  const webApp = context?.webApp
  
  const checkAuth = async () => {
    const response = await fetch('/api/session')
    if (response.ok) {
        setIsAuthenticated(true)
        const session = await getSession()
        console.log(JSON.stringify(session, null, 2))
        // const webApp = await waitForWebApp() as Telegram["WebApp"];
        // webApp.ready();
        // setUserName(webApp!.initDataUnsafe.user?.first_name)
    }
  }

  const authenticateUser = async () => {

    // setUserName(webApp!.initDataUnsafe.user?.first_name)

    const initData = webApp!.initData;
    
    if (!initData) {
        console.error('No init data available');
        return;
    }
    
    if (initData) {
        try {
            const response = await fetch('/api/auth', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ initData })
            })

            if (response.ok) {
                setIsAuthenticated(true)
                // router.refresh()
            } else {
                console.error('Authentication failed');
                setIsAuthenticated(false)
            }
        } catch (e) {
            console.error('Error during authentication: ', e);
            setIsAuthenticated(false)
        }
    }
  }

  useEffect(() => {
    checkAuth()
  }, [])

  if (!isAuthenticated) {
    return (
        <div className='h-screen mb-10 flex flex-col gap-4 justify-center items-center'>
            <button onClick={authenticateUser} className='bg-primary-600 mt-5 text-white rounded-full w-48 py-3 text-xl'>Авторизоваться</button>
        </div>
    )
  }

  return (
    <div>Test</div>
  );
}
