import Stripe from "stripe";
import { PaymentStatus } from "../../../generated/prisma/enums";
import { prisma } from "../../lib/prisma";
import { sendEmail } from "../../utils/email";
import { generateInvoicePdf } from "./payment.utils";
import { uploadFileToCloudinary } from "../../../config/cloudinary.config";

const handlerStripeWebhookEvent = async (event: Stripe.Event) => {
    const existingPayment = await prisma.payment.findFirst({
        where: {
            stripeEventId: event.id
        }
    });

    if (existingPayment) {
        console.log(`Event ${event.id} already processed. Skipping`);
        return { message: `Event ${event.id} already processed. Skipping` };
    }

    switch (event.type) {
        case "checkout.session.completed": {
            const session = event.data.object as any;

            const appointmentId = session.metadata?.appointmentId;
            const paymentId = session.metadata?.paymentId;

            if (!appointmentId || !paymentId) {
                console.error("Missing metadata in webhook event");
                return { message: "Missing metadata" };
            }

            const appointment = await prisma.appointment.findUnique({
                where: { id: appointmentId },
                include: {
                    patient: true,
                    doctor: true,
                    schedule: true,
                    payment: true
                }
            });

            if (!appointment) {
                console.error(`Appointment ${appointmentId} not found.`);
                return { message: "Appointment not found" };
            }

            // Step 1 — generate PDF and upload outside transaction
            let pdfBuffer: Buffer | null = null;
            let invoiceUrl: string | null = null;

            if (session.payment_status === "paid") {
                try {
                    pdfBuffer = await generateInvoicePdf({
                        invoiceId: appointment.payment?.id || paymentId,
                        patientName: appointment.patient.name,
                        patientEmail: appointment.patient.email,
                        doctorName: appointment.doctor.name,
                        appointmentDate: appointment.schedule.startDateTime.toString(),
                        amount: appointment.payment?.amount || 0,
                        transactionId: appointment.payment?.transactionId || "",
                        paymentDate: new Date().toISOString()
                    });

                    // just fileName — not a path
                    const fileName = `invoice-${paymentId}-${Date.now()}.pdf`;
                    const cloudinaryResponse = await uploadFileToCloudinary(pdfBuffer, fileName);
                    invoiceUrl = cloudinaryResponse?.secure_url || null;

                    console.log(`Invoice PDF generated and uploaded for payment ${paymentId}`);
                } catch (pdfError) {
                    console.error("Error generating/uploading invoice PDF:", pdfError);
                }
            }

            // Step 2 — database operations in transaction
            const result = await prisma.$transaction(async (tx) => {
                const updatedAppointment = await tx.appointment.update({
                    where: { id: appointmentId },
                    data: {
                        paymentStatus: session.payment_status === "paid"
                            ? PaymentStatus.PAID
                            : PaymentStatus.UNPAID
                    }
                });

                const updatedPayment = await tx.payment.update({
                    where: { id: paymentId },
                    data: {
                        status: session.payment_status === "paid"
                            ? PaymentStatus.PAID
                            : PaymentStatus.UNPAID,
                        paymentGatewayData: session,
                        invoiceUrl: invoiceUrl,
                        stripeEventId: event.id
                    }
                });

                return { updatedAppointment, updatedPayment, invoiceUrl };
            });

            // Step 3 — send email outside transaction
            if (session.payment_status === "paid" && result.invoiceUrl && pdfBuffer) {
                try {
                    await sendEmail({
                        to: appointment.patient.email,
                        subject: `Payment Confirmation & Invoice - Appointment with ${appointment.doctor.name}`,
                        template: "invoice",
                        data: {
                            patientName: appointment.patient.name,
                            invoiceId: appointment.payment?.id || paymentId,
                            transactionId: appointment.payment?.transactionId || "",
                            paymentDate: new Date().toLocaleDateString(),
                            doctorName: appointment.doctor.name,
                            appointmentDate: new Date(appointment.schedule.startDateTime).toLocaleDateString(),
                            amount: appointment.payment?.amount || 0,
                            invoiceUrl: result.invoiceUrl
                        },
                        attachment: [
                            {
                                filename: `Invoice-${paymentId}.pdf`,
                                content: pdfBuffer,
                                contentType: "application/pdf"
                            }
                        ]
                    });

                    console.log(`Invoice email sent to ${appointment.patient.email}`);
                } catch (emailError) {
                    console.error("Error sending invoice email:", emailError);
                }
            }

            console.log(`Payment ${session.payment_status} for appointment ${appointmentId}`);
            break;
        }

        case "checkout.session.expired": {
            const session = event.data.object as any;
            const paymentId = session.metadata?.paymentId;
            const appointmentId = session.metadata?.appointmentId;

            if (paymentId) {
                await prisma.payment.update({
                    where: { id: paymentId },
                    data: {
                        status: PaymentStatus.UNPAID,
                        stripeEventId: event.id
                    }
                });
            }

            if (appointmentId) {
                await prisma.appointment.update({
                    where: { id: appointmentId },
                    data: {
                        paymentStatus: PaymentStatus.UNPAID
                    }
                });
            }

            console.log(`Checkout session ${session.id} expired. Payment marked as unpaid.`);
            break;
        }

        case "payment_intent.payment_failed": {
            const session = event.data.object as any;
            const paymentId = session.metadata?.paymentId;
            const appointmentId = session.metadata?.appointmentId;

            if (paymentId) {
                await prisma.payment.update({
                    where: { id: paymentId },
                    data: {
                        status: PaymentStatus.UNPAID,
                        stripeEventId: event.id
                    }
                });
            }

            if (appointmentId) {
                await prisma.appointment.update({
                    where: { id: appointmentId },
                    data: {
                        paymentStatus: PaymentStatus.UNPAID
                    }
                });
            }

            console.log(`Payment intent ${session.id} failed. Payment marked as unpaid.`);
            break;
        }

        default:
            console.log(`Unhandled event type ${event.type}`);
    }

    return { message: `Webhook Event ${event.id} processed successfully` };
};

export const PaymentService = {
    handlerStripeWebhookEvent
};