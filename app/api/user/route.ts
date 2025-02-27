import { createClient } from "@/lib/supabase/client";
import { NextRequest, NextResponse } from "next/server";


export async function GET(req: NextRequest) {
    try {
        const supabase = createClient()
        const { searchParams } = new URL(req.url)

        const telegramId = searchParams.get("telegramId")

        const { data, error } = await supabase
            .from("company_users")
            .select(`
                telegram_id,
                role,
                company (
                    id,
                    name,
                    logo
                )
            `)
            .eq("telegram_id", telegramId)
            .single()
        if (error) return NextResponse.json({ message: error.message, status: 400 })

        return NextResponse.json({ data })
    } catch (e) {
        return NextResponse.json({ error: "Failed getting items of branch", details: e instanceof Error ? e.message : String(e) }, { status: 500 })
    }
}

export async function POST(req: NextRequest) {
    try {
        const supabase = createClient()

        const body = await req.json()

        const { error } = await supabase
            .from("company_users")
            .insert({
                telegram_id: body.telegramId,
                role: body.role,
                company_id: body.companyId
            })
        if (error) return NextResponse.json({ error: error.message, status: 400 })

        return NextResponse.json({ success: true })
    } catch (e) {
        return NextResponse.json({ error: "Failed getting branches", details: e instanceof Error ? e.message : String(e) }, { status: 500 })
    }
}

export async function DELETE(req: NextRequest) {
    try {
        const supabase = createClient()
        const { searchParams } = new URL(req.url)

        const telegramId = searchParams.get("telegramId")

        const { error } = await supabase
            .from("company_users")
            .delete()
            .eq("telegram_id", telegramId)
            .single()
        if (error) return NextResponse.json({ message: error.message, status: 400 })

        return NextResponse.json({ success: true })
    } catch (e) {
        return NextResponse.json({ error: "Failed getting items of branch", details: e instanceof Error ? e.message : String(e) }, { status: 500 })
    }
}