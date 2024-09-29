import { configureStore } from "@reduxjs/toolkit"
import { bookCartSlice } from "./book-cart/bookCartSlice"
import { mainApi } from "./apis/main-api/main"

export const makeStore = () => {
    return configureStore({
        reducer: {
            bookCart: bookCartSlice.reducer,
            [mainApi.reducerPath]: mainApi.reducer,
        },
        middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(mainApi.middleware),
    })
}

export type AppStore = ReturnType<typeof makeStore>
export type RootState = ReturnType<AppStore["getState"]>
export type AppDispatch = AppStore["dispatch"]
