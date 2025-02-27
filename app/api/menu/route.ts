import { createClient } from "@/lib/supabase/client";
import { NextRequest, NextResponse } from "next/server";


export async function GET(req: NextRequest) {
    try {
        const supabase = createClient()
        const { searchParams } = new URL(req.url)

        const branchId = searchParams.get("branchId")

        const { data, error } = await supabase
            .from("menu")
            .select("*")
            .eq("branchid", branchId)

        if (error) return NextResponse.json({ message: error.message, status: 400 })

        return NextResponse.json({ data })
    } catch (e) {
        return NextResponse.json({ error: "Failed getting items of branch", details: e instanceof Error ? e.message : String(e) }, { status: 500 })
    }
}