"use client"

import { Modal } from "@/components/modal";
import QrReader from "@/components/qr-reader";
import { TWAContext } from "@/context/twa-context";
import { redirect } from "next/navigation";
import { useContext, useEffect, useState } from "react";
import { BeatLoader, ClipLoader } from "react-spinners";

interface ItemInfo {
    quantity: number;
    item: {
        newprice: number;
        menu: {
            id: string;
            image: string;
            name: string;
        }
    }
}

export default function Scan() {

    const context = useContext(TWAContext)
    const userInfo = context?.userInfo
    const isAuthenticated = context?.isAuthenticated

    const [scannedResult, setScannedResult] = useState<string>()
    const [openItemModal, setOpenItemModal] = useState<boolean>(false)
    const [reservationId, setReservationId] = useState<string>()
    const [itemInfo, setItemInfo] = useState<ItemInfo>()
    const [confirmLoader, setConfirmLoader] = useState<boolean>(false)
    
    useEffect(() => {
        if (scannedResult) {
            setReservationId(scannedResult.split("//")[1])
        }
    }, [scannedResult])

    useEffect(() => {
        if (reservationId) {
            getItemInfo()
        }
    }, [reservationId])

    const getItemInfo = async () => {
        setOpenItemModal(true)
        const response = await fetch(`/api/item?reservationId=${reservationId}`)
        const data = await response.json();
        setItemInfo(data.reservation)
    }

    const handleConfirm = async () => {
        setConfirmLoader(true)
        const response = await fetch('/api/confirm', {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                telegramId: userInfo?.telegram_id,
                menuId: itemInfo!.item.menu.id,
                price: itemInfo!.quantity * itemInfo!.item.newprice,
                reservationId: reservationId
            })
        })
        const data = await response.json()
        console.log(data);
        setConfirmLoader(false)
        setOpenItemModal(false)
    }

    if (!isAuthenticated) {
        redirect('/')
    }

    return (
        <div className="h-screen w-screen flex justify-center items-center">
            <QrReader setScannedResult={setScannedResult} scannedResult={scannedResult} />
            <Modal isOpen={openItemModal} onClose={() => setOpenItemModal(false)}>
                <div>
                    {!itemInfo &&
                        <div className="w-full h-50 flex justify-center items-center">
                            <ClipLoader size={64} color="#7c3aed" />
                        </div>
                    }
                    {itemInfo && 
                        <div>
                            <div className="flex gap-2 h-full">
                                <div className="w-1/2 h-40 flex items-start justify-center">
                                    <img src={itemInfo.item.menu.image} 
                                        alt={itemInfo.item.menu.name}
                                        className="w-full h-40 rounded-lg object-cover" />
                                </div>
                                <div className="flex w-1/2 h-40 flex-col justify-between gap-1">
                                    <div className="flex flex-col gap-1">
                                        <span className="font-semibold">{itemInfo.item.menu.name}</span>
                                        <div className="text-sm">К выдаче: <span className="font-semibold text-primary-600">{itemInfo.quantity} шт.</span></div>
                                        <div className="text-sm">К оплате: <span className="font-semibold text-primary-600">{itemInfo.quantity * itemInfo.item.newprice} руб.</span></div>
                                    </div>
                                </div>
                            </div>
                            <button onClick={handleConfirm} className="bg-primary-600 flex justify-center items-center w-full mt-5 p-1 rounded-lg text-white active:bg-primary-800">{confirmLoader ? <BeatLoader className="m-0.5" color="#ffffff" /> : "Подтвердить оплату"}</button>
                        </div>
                    }
                </div>
            </Modal>
        </div>
    )
}