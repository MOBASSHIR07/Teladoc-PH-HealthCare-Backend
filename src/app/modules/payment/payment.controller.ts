import { Request, Response } from "express";
import { catchAsync } from "../../shared/catchAsync";
import { envVars } from "../../../config/env";
import { stripe } from "../../../config/stripe.config";
import { PaymentService } from "./payment.service";
import { sendResponse } from "../../shared/response";

const  handleWebHookEvent = catchAsync(async (req:Request, res:Response) => {
    const signature = req.headers["stripe-signature"] as string;
    const webhookSecret = envVars.STRIPE.STRIPE_WEBHOOK_SECRET;
    if (!signature || !webhookSecret) {
        return res.status(400).json({ message: "No signature provided" });
    }

    let event;
    try {
        event = stripe.webhooks.constructEvent(req.body, signature, webhookSecret);
        
    } catch (error:any) {
        console.log( "❌ Error message:", error.message);
        return res.status(400).json({ message: "Invalid signature" });
    }
    try {
        
        const result = await PaymentService.handleStripeWebHookEvent(event);
        sendResponse(res,{
            httpStatusCode: 200,
            success: true,
            message:"Webhook event processed successfully",
            data: result
        })
    } catch (error:any) {
        console.log("Error handling stripe webhook event", error);
        sendResponse(res,{
            httpStatusCode: 400,
            success: false,
            message:"Error handling stripe webhook event",
            data: error
        })
    }
    
})

export const PaymentController = {
    handleWebHookEvent
}