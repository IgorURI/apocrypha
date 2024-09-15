"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { deleteCurrency } from "~/server/queries"
import { dbQueryWithToast } from "~/lib/toasting"
import { Button } from "~/components/ui/button"

export default function DeleteCurrency({
    params: { id },
}: {
    params: { id: string }
}) {
    const [inputDisabled, setInputDisabled] = useState(false)
    const router = useRouter()

    const clickedYes = () => {
        setInputDisabled(true)

        return dbQueryWithToast({
            dbQuery: () => deleteCurrency(id),
            mutationName: "currency-delete",
            successMessage: "Moeda Apagada",
            waitingMessage: "Apagando moeda...",
        }).then(() => router.back())
    }

    return (
        <div className="flex flex-col items-center gap-3 justify-center h-screen p-5">
            <h1 className="text-4xl text-center font-extrabold mb-20">
                Tem certeza que quer apagar a Moeda?
            </h1>
            <Button
                disabled={inputDisabled}
                onClick={clickedYes}
                variant="destructive"
                className="text-4xl mb-10 p-7"
            >
                Sim
            </Button>
            <Button
                disabled={inputDisabled}
                onClick={() => router.back()}
                className="text-4xl p-7"
            >
                Não
            </Button>
        </div>
    )
}
