import "server-only"

import { cancelTicket, getProductInfo } from "~/server/shipping-api"
import { stripe } from "~/server/stripe-api"
import { type Prisma, type $Enums } from "prisma/prisma-client"
import { db } from "./db"

type SessionInfo = {
    paymentId: string | undefined
    paymentStatus: "paid" | "unpaid" | "no_payment_required"
    status: "expired" | "complete" | "open" | undefined
}

type RefundInfo = {
    needsRefund: boolean
    refundStatus: string
}

type OrderNewStatusInfo = {
    status: $Enums.OrderStatus
    cancelReason?: $Enums.OrderCancelReason
    cancelMessage?: string
    stripeStatus?: string
    stripePaymentId?: string
    ticketStatus?: string
    ticketUpdatedAt?: Date
    tracking?: string
    ticketPrice?: number
    printUrl?: string
    needsRefund?: boolean
}

const checkNeedsRefund = (session?: SessionInfo) => session?.paymentId !== undefined && session?.paymentStatus === "paid"

export const updateOrderStatus = async (order: Prisma.OrderGetPayload<Prisma.OrderDefaultArgs>) => {
    const [ticketInfo, sessionFromStripe] = await Promise.all([getProductInfo(order.ticketId), stripe.checkout.sessions.retrieve(order.sessionId)])

    const session: SessionInfo = {
        paymentId: sessionFromStripe.payment_intent?.toString(),
        paymentStatus: sessionFromStripe.payment_status,
        status: sessionFromStripe.status ?? undefined,
    }

    let orderNewStatus: OrderNewStatusInfo | undefined

    if (ticketInfo.status === "canceled") {
        //código para simular entrega no ambiente de sandbox do Super Frete
        if (order.status === "IN_TRANSIT") {
            orderNewStatus = {
                status: "DELIVERED",
                ticketPrice: ticketInfo.price,
                ticketStatus: ticketInfo.status,
                ticketUpdatedAt: new Date(ticketInfo.updatedAt),
                tracking: ticketInfo.tracking,
                stripePaymentId: session?.paymentId,
                stripeStatus: session?.status,
                needsRefund: false,
            }
        } else {
            orderNewStatus = {
                status: "CANCELED",
                cancelReason: "SHIPPING_SERVICE",
                cancelMessage: `Ticket ${order.ticketId} is canceled.`,
                ticketPrice: ticketInfo.price,
                ticketStatus: ticketInfo.status,
                ticketUpdatedAt: new Date(ticketInfo.updatedAt),
                tracking: ticketInfo.tracking,
                stripePaymentId: session?.paymentId,
                stripeStatus: session?.status,
                needsRefund: checkNeedsRefund(session),
            }
        }
    } else if (session.status === "expired") {
        if (ticketInfo.status !== "canceled") {
            cancelTicket(order.ticketId).catch((error) => console.error("CANCEL_TICKET_ERROR", error))
        }

        orderNewStatus = {
            status: "CANCELED",
            cancelReason: "STRIPE",
            cancelMessage: `Stripe session ${order.ticketId} expired.`,
            ticketPrice: ticketInfo.price,
            ticketStatus: "canceled",
            ticketUpdatedAt: new Date(ticketInfo.updatedAt),
            tracking: ticketInfo.tracking,
            stripePaymentId: session.paymentId,
            stripeStatus: session.status,
            needsRefund: checkNeedsRefund(session),
        }
    } else if (ticketInfo.status === "released") {
        orderNewStatus = {
            status: "IN_TRANSIT",
            stripeStatus: session.status,
            stripePaymentId: session.paymentId,
            ticketPrice: ticketInfo.price,
            ticketStatus: ticketInfo.status,
            ticketUpdatedAt: new Date(ticketInfo.updatedAt),
            tracking: ticketInfo.tracking,
            needsRefund: false,
        }
    }

    if (!orderNewStatus) {
        orderNewStatus = {
            status: order.status,
            stripeStatus: session.status,
            stripePaymentId: session.paymentId,
            ticketPrice: ticketInfo.price,
            ticketStatus: ticketInfo.status,
            ticketUpdatedAt: new Date(ticketInfo.updatedAt),
            tracking: ticketInfo.tracking,
            needsRefund: order.status === "CANCELED" ? checkNeedsRefund(session) : false,
        }
    }

    let refundInfo: RefundInfo | undefined

    if (orderNewStatus.needsRefund) {
        const refund = await stripe.refunds
            .list({
                payment_intent: session.paymentId,
            })
            .then((res) => res.data[0])

        const refundOk = new Map<string, boolean>([
            ["pending", true],
            ["succeeded", true],
            ["requires_action", false],
            ["failed", false],
            ["canceled", false],
        ])

        const hasRefund = refund && refundOk.get(refund?.status ?? "")
        refundInfo = {
            needsRefund: !hasRefund,
            refundStatus: refund?.status ?? "stripe_has_none",
        }
    }

    await db.order.update({
        where: {
            id: order.id,
        },
        data: {
            status: orderNewStatus.status ?? "PREPARING",
            cancelReason: orderNewStatus.cancelReason,
            cancelMessage: orderNewStatus.cancelMessage,
            stripeStatus: orderNewStatus.stripeStatus,
            stripePaymentId: orderNewStatus.stripePaymentId,
            ticketPrice: orderNewStatus.ticketPrice,
            ticketStatus: orderNewStatus.ticketStatus,
            ticketUpdatedAt: orderNewStatus.ticketUpdatedAt,
            tracking: orderNewStatus.tracking,
            printUrl: orderNewStatus.printUrl,
            needsRefund: refundInfo?.needsRefund ?? false,
            refundStatus: refundInfo?.refundStatus,
        },
    })
}

export const updateAllOrders = async () => {
    const orders = await db.order
        .findMany({
            where: {
                AND: [
                    {
                        status: {
                            not: "DELIVERED",
                        },
                    },
                    {
                        NOT: {
                            status: "CANCELED",
                            refundStatus: "succeeded",
                        },
                    },
                ],
            },
        })
        .catch((error) => {
            console.error("ORDER_STATUS_FIND_MANY_ERROR", error)
            return []
        })

    const result = { updateOrders: orders.length }

    if (orders.length === 0) {
        return result
    }

    await Promise.all(orders.map((order) => updateOrderStatus(order).catch((error) => console.error("ORDER_STATUS_UPDATE_ERROR", error))))

    return result
}
