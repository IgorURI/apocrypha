"use client"

import Image from "next/image"
import { useRouter } from "next/navigation"
import { dbQueryWithToast } from "~/components/toast/toasting"
import { Button } from "~/components/ui/button"
import { mainApi } from "~/lib/redux/apis/main-api/main"
import { useAppSelector } from "~/lib/redux/hooks"

export default function CartPage() {
    const cartContent = useAppSelector((state) => state.bookCart.value)
    const router = useRouter()
    const [triggerCheckout] = mainApi.useCheckoutMutation()

    const handleCheckout = async () => {
        const products = cartContent.map((item) => ({
            stripeId: item.stripeId,
            quantity: item.amount,
        }))

        const stripeUrl = await dbQueryWithToast({
            dbQuery: () =>
                triggerCheckout({ data: { products } })
                    .then((result) => {
                        if (result.error) {
                            throw new Error(result.error as string)
                        }

                        if (!result.data.success) {
                            throw new Error(result.data.errorMessage)
                        }

                        return {
                            data: result.data.url,
                            success: true,
                            errorMessage: "",
                        }
                    })
                    .catch((error) => ({
                        data: undefined,
                        success: false,
                        errorMessage: (error as Error).message,
                    })),
            mutationName: "checkout",
            waitingMessage: "Finalizando compra...",
            successMessage: "Redirecionando para o Stripe...",
        })

        if (stripeUrl) {
            router.push(stripeUrl)
        }
    }

    return (
        <div>
            <div>
                {cartContent.map((item) => (
                    <div key={item.id}>
                        <Image
                            src={item.mainImg}
                            alt={item.title}
                            width={100}
                            height={100}
                        />
                        <p>{item.title}</p>
                        <p>{item.amount}</p>
                    </div>
                ))}
            </div>
            <div>
                <p>Total: {cartContent.reduce((acc, curr) => acc + curr.amount, 0)}</p>
                <Button onClick={handleCheckout}>Finalizar compra</Button>
            </div>
        </div>
    )
}
