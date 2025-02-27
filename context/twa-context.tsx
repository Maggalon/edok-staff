"use client"

import { UserInfo } from '@/lib/types';
import { Telegram } from '@twa-dev/types';
import { createContext, useEffect, useState } from 'react';

declare global {
    interface Window {
      Telegram: Telegram;
    }
}

interface TWAContextProps {
    webApp: Telegram["WebApp"] | undefined;
    userInfo: UserInfo | undefined;
}

export const TWAContext = createContext<TWAContextProps | undefined>(undefined)

export const TWAProvider = ({ children }: Readonly<{children: React.ReactNode}>) => {

    const [webApp, setWebApp] = useState<Telegram["WebApp"]>()
    const [userInfo, setUserInfo] = useState<UserInfo>()
    
    const getWebApp = async () => {
        const webApp = await waitForWebApp() as Telegram["WebApp"]
        webApp.ready()
        setWebApp(webApp)
    }

    const getUserInfo = async () => {
        const response = await fetch(`/api/user?telegramId=${972737130}`)
        const data = await response.json()
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

    useEffect(() => {
        getWebApp()
    }, [])

    useEffect(() => {
        if (webApp) {
            getUserInfo()
        }
    }, [webApp])

    return (
        <TWAContext.Provider value={{ webApp, userInfo }}>
            {children}
        </TWAContext.Provider>
    )
}