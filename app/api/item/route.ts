import { createClient } from "@/lib/supabase/client"
import { NextRequest, NextResponse } from "next/server"

interface Reservation {
    quantity: number;
    item: {
        newprice: number;
        menu: {
            id: string;
            name: string;
            image: string;
        }
    }
}

interface CompanyData {
    branch: {
        company: {
            id: string;
        }
    }
}

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

export async function GET(req: NextRequest) {
    try {
        const supabase = createClient()
        const { searchParams } = new URL(req.url)

        const reservationId = searchParams.get("reservationId")

        const { data: reservation, error: reservationError } = await supabase
            .from("reservations")
            .select(`
                quantity,
                item (
                    newprice,
                    menu (
                        id,
                        name,
                        image
                    )
                )
            `)
            .eq("id", reservationId)
            .single() as { data: Reservation, error: any }
        if (reservationError) return NextResponse.json({ message: reservationError.message, status: 400 })

        const { data: companyData, error: companyError } = await supabase
            .from("menu")
            .select(`
                branch (
                    company (
                        id
                    )
                )
            `)
            .eq('id', reservation.item.menu.id)
            .single() as { data: CompanyData, error: any }
        if (companyError) return NextResponse.json({ message: companyError.message, status: 400 })

        console.log(companyData);

        const imageUrl = await supabase
            .storage
            .from("menu")
            .createSignedUrl(`${companyData.branch.company.id}/${reservation.item.menu.image}`, 600)
        reservation.item.menu.image = imageUrl.data!.signedUrl 

        console.log(reservation);
        
        
        return NextResponse.json({ reservation })
    } catch (e) {
        return NextResponse.json({ error: "Failed getting items of branch", details: e instanceof Error ? e.message : String(e) }, { status: 500 })
    }
}