import { createClient } from "@/lib/supabase/client"
import { NextRequest, NextResponse } from "next/server"


export async function POST(req: NextRequest) {
    try {
        const supabase = createClient()

        const body = await req.json()

        const { error } = await supabase
            .from("item")
            .insert({
                quantity: body.quantity,
                newprice: body.price,
                collectday: body.collectDay,
                collecttimerange: body.collectTimeRange,
                menuid: body.menuId
            })
        if (error) return NextResponse.json({ error: error.message, status: 400 })

        return NextResponse.json({ success: true })
    } catch (e) {
        return NextResponse.json({ error: "Failed getting branches", details: e instanceof Error ? e.message : String(e) }, { status: 500 })
    }
}