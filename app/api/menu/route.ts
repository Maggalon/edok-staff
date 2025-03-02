import { createClient } from "@/lib/supabase/client";
import { NextRequest, NextResponse } from "next/server";
import { MenuItem } from "@/lib/types";

export async function GET(req: NextRequest) {
    try {
        const supabase = createClient()
        const { searchParams } = new URL(req.url)

        const branchId = searchParams.get("branchId")

        const { data: fetchedItems, error: fetchedItemsError } = await supabase
            .from("menu")
            .select("*")
            .eq("branchid", branchId) as { data: MenuItem[], error: any }

        if (fetchedItemsError) return NextResponse.json({ message: fetchedItemsError.message, status: 400 })

        const { data: companyId, error: companyIdError } = await supabase
            .from("branch")
            .select("companyid")
            .eq("id", branchId)
            .single()
        if (companyIdError) return NextResponse.json({ message: companyIdError.message, status: 400 })
        console.log(companyId);
        
        for (let item of fetchedItems) {
            const imageUrl = await supabase
                .storage
                .from("menu")
                .createSignedUrl(`${companyId.companyid}/${item.image}`, 600)
            item.image = imageUrl.data!.signedUrl
        }

        return NextResponse.json({ fetchedItems })
    } catch (e) {
        return NextResponse.json({ error: "Failed getting items of branch", details: e instanceof Error ? e.message : String(e) }, { status: 500 })
    }
}