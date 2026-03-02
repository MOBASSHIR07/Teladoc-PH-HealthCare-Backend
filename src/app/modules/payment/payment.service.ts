import Stripe from "stripe";
import { prisma } from "../../lib/prisma";

import { PaymentStatus } from "../../../generated/prisma/enums";


const handleStripeWebHookEvent = async (event: Stripe.Event) => {
    const existingPayment = await prisma.payment.findFirst({
        where: {
           stripeEventId: event.id,
        },
    });
    if (existingPayment) {
        return { message: `Payment with id ${event.id} already processed.` };
    }

    switch (event.type) {
        case 'checkout.session.completed': {
            const session = event.data.object
            const appointmentId = session.metadata?.appointmentId
            const paymentId = session.metadata?.paymentId
            if (!appointmentId || !paymentId) {
                return { message: `Session with id ${event.id} is missing metadata.` };
            }
            const appointment = await prisma.appointment.findFirst({
                where: {
                    id: appointmentId,
                },
            });
            if (!appointment) {
                return { message: `Appointment with id ${appointmentId} does not exist.` };
            }

            await prisma.$transaction(async (tx) => {
                await tx.appointment.update({
                    where: {
                        id: appointmentId,
                    },
                    data: {
                        paymentStatus: session.payment_status === "paid" ? PaymentStatus.PAID : PaymentStatus.UNPAID,
                    },
                });
                await tx.payment.update({
                    where: {
                        id: paymentId,
                    },
                    data: {
                        stripeEventId: event.id,
                        status: session.payment_status === "paid" ? PaymentStatus.PAID : PaymentStatus.UNPAID,
                        paymentGatewayData: session as any

                    }
                })


            })
            break;
        }
        case 'checkout.session.expired': {
            const session = event.data.object
            console.log(`Checkout session ${session.id} expired`);

            break;
        }
        case 'payment_intent.payment_failed': {
            const session = event.data.object
              console.log(`Checkout session ${session.id} expired`);
            break;

        }
        default:
            console.log(`Unhandled event type ${event.type}`);


    }
    return { message: `Event ${event.id} processed successfully.` };
}

export const PaymentService = {
    handleStripeWebHookEvent,
}