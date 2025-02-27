"use client"

import { Modal } from "@/components/modal";
import { TWAContext } from "@/context/twa-context";
import { Plus, Trash, UsersRound } from "lucide-react";
import { useRouter } from "next/navigation";
import { useContext, useEffect, useState } from "react";

export default function Staff() {

    const router = useRouter()

    const context = useContext(TWAContext)
    const userInfo = context?.userInfo

    const [staff, setStaff] = useState<{ role: "admin" | "user"; telegram_id: number; }[]>()
    const [openNewItemModal, setOpenNewItemModal] = useState<boolean>(false)
    const [openDeleteModal, setOpenDeleteModal] = useState<boolean>(false)
    const [telegramIdToDelete, setTelegramIdToDelete] = useState<string>()
    const [telegramId, setTelegramId] = useState<string>()
    const [role, setRole] = useState<"admin" | "user">("user")
    
    const getStaff = async () => {
        const response = await fetch(`/api/staff?companyId=${userInfo?.company.id}`)
        const data = await response.json()
        console.log(data);
        setStaff(data.data)
    }

    const addEmployee = async () => {
        if (telegramId) {
            const response = await fetch("/api/user", {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({
                    telegramId: Number(telegramId),
                    role,
                    companyId: userInfo?.company.id
                })
            })
            const data = await response.json()
            console.log(data);
            await getStaff()
            setOpenNewItemModal(false)
        }
    }

    const deleteEmployee = async () => {
        const response = await fetch(`/api/user?telegramId=${telegramIdToDelete}`, {method: "DELETE"})
        const data = await response.json()
        console.log(data);
        await getStaff()
        setOpenDeleteModal(false)
    }

    useEffect(() => {
        if (userInfo) getStaff()
    }, [userInfo])

    return (
        <div className="flex flex-col gap-10 h-screen">
            <div className='fixed left-2 bg-white font-bold p-3 text-2xl flex gap-3 w-screen shadow-sm items-center justify-start'>
                {/* <Smile size={48} className='text-primary-600 bg-primary-200 rounded-full p-2' /> */}
                <div className="w-12 h-12 rounded-full bg-transparent flex items-center justify-center flex-shrink-0">
                    <img src={userInfo?.company.logo} alt={userInfo?.company.name} className="w-full object-cover" />
                </div>
                {userInfo?.company.name}
            </div>
            {userInfo?.role === "admin" ? 
                <div className="w-full h-full flex flex-col items-center justify-center">
                    <table className="w-5/6 text-sm text-left rtl:text-right text-gray-500">
                        <thead className="text-xs text-gray-700 uppercase bg-primary-100">
                            <tr>
                                <th scope="col" className="px-6 py-3 rounded-tl-lg">
                                    ID
                                </th>
                                <th scope="col" className="px-6 py-3">
                                    Роль
                                </th>
                                <th scope="col" className="px-6 py-3 rounded-tr-lg">
                                    Действие
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {staff && staff.map(item => {
                                return (
                                    <tr key={item.telegram_id} className="odd:bg-white even:bg-primary-50 border-b border-primary-200">
                                        <th scope="row" className="pl-2 py-4 font-semibold text-primary-600 whitespace-nowrap">
                                            {item.telegram_id}
                                        </th>
                                        <td className="pl-4 py-4">
                                            {item.role === "admin" ? "Админ" : "Сотрудник"}
                                        </td>
                                        <td className="pl-6 py-4">
                                            {item.telegram_id === userInfo.telegram_id ? "(Вы)" : (
                                                item.role === 'admin' ? "--" : <Trash onClick={() => {setOpenDeleteModal(true); setTelegramIdToDelete(item.telegram_id.toString())}} className="text-red-600" />
                                            )}
                                        </td>
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>
                    <div onClick={() => setOpenNewItemModal(true)} className="w-5/6 bg-primary-100 rounded-b-lg flex items-center justify-center p-2 hover:bg-primary-200">
                        <Plus className="text-gray-700 w-6 h-6" />
                    </div>
                </div>
            :
                <div className="w-full gap-5 h-full flex flex-col items-center justify-center">
                    <div className="bg-primary-200 text-primary-600 rounded-full w-24 h-24 flex items-center justify-center">
                        <UsersRound size={64} />
                    </div>
                    <div className="text-xl text-center font-semibold">Управление персоналом доступно только админам</div>
                </div>
            }
            <Modal isOpen={openNewItemModal} onClose={() => setOpenNewItemModal(false)}>
                <div className="w-full flex flex-col gap-4">
                    <div className="w-full flex items-center gap-2">
                        <span className="font-semibold">ID</span>
                        <input
                            type="number"
                            placeholder="Телеграм-ID сотрудника"
                            className="w-full px-2 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                            value={telegramId}
                            onChange={e => setTelegramId(e.target.value)}
                        />
                    </div>
                    <div className="w-full flex items-start gap-5">
                        <span className="font-semibold">Роль</span>
                        <div className='flex flex-col gap-4 w-full'>
                            <div className='flex gap-2 items-center'>
                                <div onClick={() => setRole("admin")} className={`w-5 h-5 ring-2 ring-primary-600 border-4 border-white rounded-full ${role == "admin" && "bg-primary-600"}`}></div>
                                <span className='text-base'>Админ</span>
                            </div>
                            <div className='flex gap-2 items-center'>
                                <div onClick={() => setRole("user")} className={`w-5 h-5 ring-2 ring-primary-600 border-4 border-white rounded-full ${role == "user" && "bg-primary-600"}`}></div>
                                <span className='text-base'>Сотрудник</span>
                            </div>
                        </div>
                    </div>
                    <button onClick={addEmployee} className="w-full bg-primary-600 rounded-lg text-white p-1 hover:bg-primary-700">Добавить</button>
                </div>
            </Modal>
            <Modal isOpen={openDeleteModal} onClose={() => setOpenDeleteModal(false)}>
                <div className="w-full flex flex-col items-center">
                    <span className="text-xl my-4">Вы уверены?</span>
                    <div className="w-full h-0.5 bg-primary-200"></div>
                    <div className="flex w-full font-semibold">
                        <span onClick={deleteEmployee} className="w-1/2 text-center py-4 hover:bg-primary-200">Да, удалить</span>
                        <span onClick={() => setOpenDeleteModal(false)} className="w-1/2 text-center py-4 hover:bg-primary-200">Отмена</span>
                    </div>
                </div>
            </Modal>
        </div>
    )
}