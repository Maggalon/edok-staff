"use client"

import { Modal } from "@/components/modal"
import { TWAContext } from "@/context/twa-context"
import { getSession } from "@/lib/session"
import { MenuItem } from "@/lib/types"
import { useContext, useEffect, useState } from "react"
import { toast, ToastContainer } from "react-toastify"

interface Branch {
  id: string;
  address: string;
  coordinates: string;
  ratingsum: number;
  votesnumber: number;
  companyid: string;
}

export default function Home() {
  const [openSelectBranchModal, setOpenSelectBranchModal] = useState<boolean>(false)
  const [openSelectItemModal, setOpenSelectItemModal] = useState<boolean>(false)
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false)
  const [branches, setBranches] = useState<Branch[]>()
  const [selectedBranch, setSelectedBranch] = useState<Branch>()
  const [items, setItems] = useState<MenuItem[]>()
  const [selectedItem, setSelectedItem] = useState<MenuItem>()
  const [quantity, setQuantity] = useState<number>()
  const [price, setPrice] = useState<number>()
  const [collectDay, setCollectDay] = useState<"today" | "tomorrow">("today")

  const [fromHours, setFromHours] = useState<string>("00")
  const [fromMinutes, setFromMinutes] = useState<string>("00")
  const [toHours, setToHours] = useState<string>("00")
  const [toMinutes, setToMinutes] = useState<string>("00")

  const context = useContext(TWAContext)
  const webApp = context?.webApp
  const userInfo = context?.userInfo
  
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

  const handleSelectBranch = async () => {   
    setOpenSelectBranchModal(true) 
    await getBranches()
    setSelectedItem(undefined)
  }

  const handleSelectItem = async () => {
    setOpenSelectItemModal(true)
    await getBranchItems()
  }

  const getBranches = async () => {
    if (branches) return
    const response = await fetch(`/api/branch?companyId=${userInfo?.company.id}`)
    const data = await response.json()
    console.log(data);
    setBranches(data.data)
  }

  const getBranchItems = async () => {
    if (items && items.length !== 0 && items[0].branchid === selectedBranch!.id) return
    const response = await fetch(`/api/menu?branchId=${selectedBranch!.id}`)
    const data = await response.json()
    console.log(data);
    setItems(data.fetchedItems)
  }

  const addItem = async () => {
    if (!quantity) {
      toast.error("Введите количество продукта", {position: "top-center"})
      return
    }
    if (!price) {
      toast.error("Введите новую стоимость продукта", {position: "top-center"})
      return
    }
    if (!fromHours || !toHours) {
      toast.error("Введите временной промежуток", {position: "top-center"})
      return
    }
    if (Number(fromHours) * 60 + Number(fromMinutes) >= Number(toHours) * 60 + Number(toMinutes)) {
      toast.error("Временной промежуток введен неверно", {position: "top-center"})
      return
    }

    let tsRange;
    if (collectDay === 'today') {
      const fromBound = `${new Date().toISOString().split("T")[0]}T${fromHours}:${fromMinutes}:00Z`
      const toBound = `${new Date().toISOString().split("T")[0]}T${toHours}:${toMinutes}:00Z`
      tsRange = `[${fromBound}, ${toBound}]`
      console.log(tsRange);
      
    } else {
      const today = new Date()
      const tomorrow = new Date()
      tomorrow.setDate(today.getDate() + 1)
      const fromBound = `${tomorrow.toISOString().split("T")[0]}T${fromHours}:${fromMinutes}:00Z`
      const toBound = `${tomorrow.toISOString().split("T")[0]}T${toHours}:${toMinutes}:00Z`
      tsRange = `[${fromBound}, ${toBound}]`
      console.log(tsRange);
    }
    
    const response = await fetch("/api/item", {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify({
        quantity: quantity,
        price: price,
        collectDay: collectDay === "today" ? "Сегодня" : "Завтра",
        collectTimeRange: tsRange,
        menuId: selectedItem!.id
      })
    })

    console.log(await response.json())
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
    <div className="flex flex-col gap-10 h-screen items-center mb-48">
      {userInfo ?
        <div className='fixed left-2 bg-white font-bold p-3 text-2xl flex gap-3 w-screen shadow-sm items-center justify-start'>
            <div className="w-12 h-12 rounded-full bg-transparent flex items-center justify-center flex-shrink-0">
                <img src={userInfo.company.logo} alt={userInfo.company.name} className="w-full object-cover" />
            </div>
            {userInfo.company.name}
        </div> :
        <div className='fixed left-2 bg-white font-bold p-3 text-2xl flex gap-3 w-screen shadow-sm items-center justify-start'>
            <div className="w-12 h-12 rounded-full bg-gray-300 animate-pulse"></div>
            <div className="h-12 w-48 rounded-xl bg-gray-300 animate-pulse"></div>
        </div>
      }
      <div className="w-full h-full my-24 flex flex-col gap-5 items-center justify-center">
        <div onClick={handleSelectBranch} className="w-5/6 bg-white rounded-lg flex items-center justify-center p-2 border shadow-md">
          <span className="text-primary-600 font-semibold">{selectedBranch ? selectedBranch.address.split(", ").slice(0, 3).join(", ") : "Выбрать филиал"}</span>
        </div>
        {selectedBranch &&
          <div onClick={handleSelectItem} className="w-5/6 bg-white rounded-lg flex items-center justify-center p-2 border shadow-md">
            <span className="text-primary-600 font-semibold">{selectedItem ? selectedItem.name : "Выбрать позицию"}</span>
          </div>
        }
        {selectedItem &&
          <div className="flex flex-col w-5/6 gap-5">
            <div className="w-full flex flex-col items-start gap-2">
                <span className="font-semibold text-primary-600">Количество</span>
                <input
                    type="number"
                    placeholder="Количество позиций"
                    className="w-full px-2 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    value={quantity}
                    onChange={e => setQuantity(Number(e.target.value))}
                />
            </div>
            <div className="w-full flex flex-col items-start gap-2">
                <span className="font-semibold text-primary-600">Цена</span>
                <input
                    type="number"
                    placeholder="Новая цена"
                    className="w-full px-2 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    value={price}
                    onChange={e => setPrice(Number(e.target.value))}
                />
            </div>
            <div className="w-full flex flex-col items-start gap-5">
                <span className="font-semibold text-primary-600">Когда забирать</span>
                <div className='flex flex-col gap-4 w-full'>
                    <div className='flex gap-2 items-center'>
                        <div onClick={() => setCollectDay("today")} className={`w-5 h-5 ring-2 ring-primary-600 border-4 border-white rounded-full ${collectDay == "today" && "bg-primary-600"}`}></div>
                        <span className='text-base'>Сегодня</span>
                    </div>
                    <div className='flex gap-2 items-center'>
                        <div onClick={() => setCollectDay("tomorrow")} className={`w-5 h-5 ring-2 ring-primary-600 border-4 border-white rounded-full ${collectDay == "tomorrow" && "bg-primary-600"}`}></div>
                        <span className='text-base'>Завтра</span>
                    </div>
                </div>
            </div>
            <div className="w-full flex flex-col items-start gap-5">
                <span className="font-semibold text-primary-600">Во сколько забирать</span>
                <div className='flex flex-col gap-4 w-full'>
                    <div className='flex gap-1 items-center'>
                        <span className="font-semibold mr-1">От</span>
                        <input
                            type="number"
                            placeholder="00"
                            className="w-10 px-2 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                            value={fromHours !== "00" ? fromHours : ""}
                            onChange={e => {if (Number(e.target.value) >= 0 && Number(e.target.value) < 24) {setFromHours(e.target.value)}}}
                        />
                        <span className="font-bold">:</span>
                        <input
                            type="number"
                            placeholder="00"
                            className="w-10 px-2 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                            value={fromMinutes !== "00" ? fromMinutes : ""}
                            onChange={e => {if (Number(e.target.value) >= 0 && Number(e.target.value) < 60) {setFromMinutes(e.target.value)}}}
                        />
                    </div>
                    <div className='flex gap-1 items-center'>
                        <span className="font-semibold mr-1">До</span>
                        <input
                            type="number"
                            placeholder="00"
                            className="w-10 px-2 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                            value={toHours !== "00" ? toHours : ""}
                            onChange={e => {if (Number(e.target.value) >= 0 && Number(e.target.value) < 24) {setToHours(e.target.value)}}}
                        />
                        <span className="font-bold">:</span>
                        <input
                            type="number"
                            placeholder="00"
                            className="w-10 px-2 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                            value={toMinutes !== "00" ? toMinutes : ""}
                            onChange={e => {if (Number(e.target.value) >= 0 && Number(e.target.value) < 60) {setToMinutes(e.target.value)}}}
                        />
                    </div>
                </div>
            </div>
            <button onClick={addItem} className="w-full bg-primary-600 rounded-lg text-white p-2 hover:bg-primary-700">Добавить</button>
          </div>
        }
      </div>
      <Modal isOpen={openSelectBranchModal} onClose={() => setOpenSelectBranchModal(false)}>
        <div className="w-full">
          {branches && branches.map(branch => {
              return (
                <div key={branch.id} onClick={() => setSelectedBranch(branch)} className={`mb-5 last:m-0 flex items-center justify-start w-full gap-2 shadow-md border font-semibold rounded-lg p-2 ${selectedBranch === branch && "bg-primary-200"}`}>
                  {branch.address.split(", ").slice(0, 3).join(", ")}
                </div>
              )
            })
          }
          {!branches &&
            <div className="w-full">
              <div className="w-full mb-5 bg-gray-300 h-12 animate-pulse rounded-xl"></div>
              <div className="w-full mb-5 bg-gray-300 h-12 animate-pulse rounded-xl"></div>
            </div>
          }
          <button onClick={() => setOpenSelectBranchModal(false)} className="w-full bg-primary-600 rounded-lg text-white p-1 hover:bg-primary-700">Выбрать</button>
        </div>
      </Modal>
      <Modal isOpen={openSelectItemModal} onClose={() => setOpenSelectItemModal(false)}>
        <div className="w-full">
          <div className='flex flex-col items-center gap-3 border-2 rounded-lg h-96 overflow-auto p-3 mt-5'>
              {items && items.map(item => {
                return (
                  <div key={item.id} onClick={() => setSelectedItem(item)} className={`flex items-center justify-start w-full gap-2 shadow-md border rounded-lg p-2 ${selectedItem === item && "bg-primary-200"}`}>
                    <div className="w-20 h-20 flex items-center justify-center">
                      <img src={item.image} 
                            alt={item.name}
                            className="w-20 h-20 rounded-lg object-cover" />
                    </div>
                    <div className="flex-1 flex flex-col items-start gap-1">
                      <div className="text-sm font-semibold">{item.name}</div>
                      <div className="text-xs bg-primary-400 rounded-full p-1">{item.type}</div>
                    </div>
                  </div>
                )
              })

              }  
              {!items &&
                <div className="w-full flex flex-col gap-3">
                  <div className={`flex items-center justify-start w-full gap-2 shadow-md border rounded-lg p-2`}>
                    <div className="w-20 h-20 rounded-lg bg-gray-300 animate-pulse"></div>
                    <div className="flex-1 flex flex-col items-start gap-3">
                      <div className="w-full h-4 rounded-full bg-gray-300 animate-pulse"></div>
                      <div className="w-3/4 h-6 rounded-full bg-gray-300 animate-pulse"></div>
                    </div>
                  </div>
                  <div className={`flex items-center justify-start w-full gap-2 shadow-md border rounded-lg p-2`}>
                    <div className="w-20 h-20 rounded-lg bg-gray-300 animate-pulse"></div>
                    <div className="flex-1 flex flex-col items-start gap-3">
                      <div className="w-full h-4 rounded-full bg-gray-300 animate-pulse"></div>
                      <div className="w-3/4 h-6 rounded-full bg-gray-300 animate-pulse"></div>
                    </div>
                  </div>
                </div>
              }
          </div>
          <button onClick={() => setOpenSelectItemModal(false)} className="w-full bg-primary-600 rounded-lg text-white p-1 hover:bg-primary-700 mt-5">Выбрать</button>
        </div>
      </Modal>
      <ToastContainer className="text-xl font-semibold" />
    </div>
  );
}
