"use client"

import { getSession } from '@/lib/session';
import { UserInfo } from '@/lib/types';
import { Telegram } from '@twa-dev/types';
import { createContext, useEffect, useState } from 'react';
import { ToastContainer, toast } from 'react-toastify';

declare global {
    interface Window {
      Telegram: Telegram;
    }
}

interface TWAContextProps {
    webApp: Telegram["WebApp"] | undefined;
    userInfo: UserInfo | undefined;
    isAuthenticated: boolean;
    setIsAuthenticated: (isAuthenticated: boolean) => void;
}

export const TWAContext = createContext<TWAContextProps | undefined>(undefined)

export const TWAProvider = ({ children }: Readonly<{children: React.ReactNode}>) => {

    const [webApp, setWebApp] = useState<Telegram["WebApp"]>()
    const [userInfo, setUserInfo] = useState<UserInfo>()
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false)
    
    const getWebApp = async () => {
        const webApp = await waitForWebApp() as Telegram["WebApp"]
        webApp.ready()
        setWebApp(webApp)
    }

    const getUserInfo = async () => {
        const response = await fetch(`/api/user?telegramId=${972737130}`)
        const data = await response.json()
        if (data.status == 400) {
            toast.error("Нет доступа", {position: "top-center"})
            return
        }
        setUserInfo(data.data)
        console.log(data);
    }

    const waitForWebApp = () => {
        return new Promise((resolve) => {
            if (window.Telegram?.WebApp) {
                resolve(window.Telegram.WebApp);
            } else {
                const interval = setInterval(() => {
                    if (window.Telegram?.WebApp) {
                        clearInterval(interval);
                        resolve(window.Telegram.WebApp);
                    }
                }, 100);
            }
        });
    };

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

    useEffect(() => {
        getWebApp()
    }, [])

    useEffect(() => {
        if (webApp) {
            getUserInfo()
        }
    }, [webApp])

    useEffect(() => {
        if (webApp && userInfo) {
            checkAuth()
        }
    }, [userInfo])

    return (
        <TWAContext.Provider value={{ webApp, userInfo, isAuthenticated, setIsAuthenticated }}>
            {children}
            <ToastContainer className="text-xl font-semibold" />
        </TWAContext.Provider>
    )
}