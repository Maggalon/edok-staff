"use client"

import { Scanner } from "@yudiel/react-qr-scanner";

export default function Scan() {
    return (
        <div className="h-screen w-screen flex justify-center items-center">
            <div className="w-5/6">
                <Scanner onScan={(result) => console.log(result)} />
            </div>
        </div>
    )
}