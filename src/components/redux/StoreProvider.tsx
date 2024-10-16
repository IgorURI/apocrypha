"use client"

import { Loader2Icon } from "lucide-react"
import { useEffect, useRef, useState } from "react"
import { Provider } from "react-redux"
import { type POSTApiUserStateInput, type GETApiUserStateOutput } from "~/app/api/user/state/route"
import { type BookCartState } from "~/lib/redux/book-cart/bookCartSlice"
import { makeStore, type AppStore } from "~/lib/redux/store"

function LogoLightSvg({ size }: { size: number }) {
    return (
        <svg
            width={`${size}px`}
            height={`${size}px`}
            viewBox="0 0 512 512"
            xmlns="http://www.w3.org/2000/svg"
            fill="#000000"
            stroke="#000000"
        >
            <g
                id="SVGRepo_bgCarrier"
                strokeWidth="0"
            />

            <g
                id="SVGRepo_tracerCarrier"
                strokeLinecap="round"
                strokeLinejoin="round"
            />

            <g id="SVGRepo_iconCarrier">
                <path
                    fill="#000000"
                    d="M150.25 19.97c-114.48-.574-139.972 184.95 20.563 212.124-29.5.534-55.382 8.11-91.75 25.97C-19.2 306.313.665 462.966 100.874 446c34.48-5.838 51.21-50.325.875-65.375 16.515 29.61-27.968 47.1-41.906 1.938-11.262-36.49 21.145-74.914 52.468-85 30.5-9.82 55.244-10.86 82.47-5.844-36.585 34.247-56.547 80.465-42.376 123.624 44.522 135.595 192.146 82.52 162.844-6.72-10.346-31.506-41.408-46.505-68-10.155 35.164-8.854 50.45 38.75 18.188 49.342-26.355 8.655-60.212-13.527-66.032-41.343-7.82-37.39 19.77-77.195 54.78-95.25 22.176 35.37 38.812 48.68 83.22 72.186 85.843 45.436 212.957-36.54 143.906-110.53-22.626-24.244-54.574-30.02-67.5 13.124 30.188-20.09 60.748 26.8 33.875 47.563-21.95 16.96-61.503 19.135-86.437 5.5-30.797-16.842-53.79-37.798-70.188-66.532 57.07 13.69 119.584-1.065 143-45.342 45.72-86.45-7.046-152.467-59.125-153.375-20.378-.356-40.654 9.237-54.875 31.5-17.85 27.946-9.815 61.533 35.157 59.124-29.11-21.628-1.9-63.623 26.717-45.343 23.378 14.932 22.494 51.88 9.75 77.28-15.165 30.23-60.573 50.738-95.062 24.657-3.008-5.71-5.563-11.683-7.78-17.843 8.99-6.49 14.874-17.028 14.874-28.875 0-17.772-13.252-32.64-30.345-35.218-9.763-47.134-23.34-92.648-84.844-112.594-13.64-4.424-26.437-6.472-38.28-6.53zm117.844 137.405c9.463 0 16.937 7.474 16.937 16.938 0 9.463-7.473 16.937-16.936 16.937-9.463 0-16.906-7.474-16.906-16.938 0-9.463 7.443-16.937 16.906-16.937zm-65.406 10.5c9.463 0 16.937 7.474 16.937 16.938 0 9.463-7.474 16.937-16.938 16.937-9.463 0-16.937-7.474-16.937-16.938 0-9.463 7.474-16.937 16.938-16.937z"
                />
            </g>
        </svg>
    )
}

export default function StoreProvider({ children }: { children: React.ReactNode }) {
    const storeRef = useRef<AppStore>()

    const [bookFavs, setBookFavs] = useState<BookCartState[]>([])
    const [bookCart, setBookCart] = useState<BookCartState[]>([])
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        if (!storeRef.current) {
            fetch("/api/user/state")
                .then((res) =>
                    res.json().then((json: GETApiUserStateOutput) => {
                        setIsLoading(false)
                        if (json.success) {
                            setBookCart(json.data?.bookCart ?? [])
                            setBookFavs(json.data?.bookFavs ?? [])
                        }
                    }),
                )
                .catch((error) => console.error(error))
        }
    }, [])

    if (isLoading) {
        return (
            <div className="flex flex-col flex-grow min-h-screen items-center justify-center gap-5">
                <LogoLightSvg size={350}></LogoLightSvg>
                <Loader2Icon
                    size={96}
                    className="animate-spin"
                ></Loader2Icon>
            </div>
        )
    }

    if (!storeRef.current) {
        // Create the store instance the first time this renders

        storeRef.current = makeStore({
            bookFavs: {
                value: bookFavs,
            },
            bookCart: {
                value: bookCart,
            },
        })

        storeRef.current.subscribe(() => {
            const state = storeRef.current?.getState()

            const apiInput: POSTApiUserStateInput = {
                data: {
                    bookCart: state?.bookCart.value ?? [],
                    bookFavs: state?.bookFavs.value ?? [],
                },
            }

            fetch("/api/user/state", {
                method: "POST",
                body: JSON.stringify(apiInput.data),
            }).catch((error) => console.error(error))
        })
    }

    return <Provider store={storeRef.current}>{children}</Provider>
}
