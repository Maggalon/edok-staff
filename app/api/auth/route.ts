import { encrypt } from "@/lib/session";
import { validateTelegramWebAppData } from "@/lib/telegram"
import { cookies } from "next/headers";
import { NextResponse } from "next/server"


export async function POST(request: Request) {
    const { initData } = await request.json()

    const validationResult = validateTelegramWebAppData(initData)

    if (validationResult.validatedData) {
        console.log("Validation result: ", validationResult);
        const user = { telegramId: validationResult.user.id }

        const expires = new Date(Date.now() + 60 * 60 * 1000)
        const session = await encrypt({ user, expires })

        ;(await cookies()).set("session", session, { expires, httpOnly: true })

        return NextResponse.json({ message: "Authentication successful" })
    } else {
        return NextResponse.json({ message: validationResult.message }, { status: 401 })
    }
}