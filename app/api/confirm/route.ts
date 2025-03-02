import { createClient } from "@/lib/supabase/client"
import { NextRequest, NextResponse } from "next/server"


export async function POST(req: NextRequest) {
    try {
        const supabase = createClient()

        const body = await req.json()

        const { error: historyInsertError } = await supabase
            .from("history")
            .insert({
                user_id: body.telegramId,
                menu_id: body.menuId,
                price: body.price,
            })
        if (historyInsertError) return NextResponse.json({ error: historyInsertError.message, status: 400 })

        const { error: deleteReservationError } = await supabase
            .from("reservations")
            .delete()
            .eq("id", body.reservationId)
        if (deleteReservationError) return NextResponse.json({ error: deleteReservationError.message, status: 400 })

        return NextResponse.json({ success: true })
    } catch (e) {
        return NextResponse.json({ error: "Failed to confirm order", details: e instanceof Error ? e.message : String(e) }, { status: 500 })
    }
}