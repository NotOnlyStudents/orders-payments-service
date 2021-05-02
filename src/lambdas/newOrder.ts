import PaymentResponse from "src/models/PaymentResponse"
import OrderRepository from "src/repository/OrderRepository"
import { createHmac } from "crypto";
import CartToken from "src/models/CartToken";
import Address from "src/models/Address";

const lambda = async (repo: OrderRepository, t: CartToken, addr: Address, customerEmail: string, customerId: string, additionalInfo): Promise<PaymentResponse> => {
    if (!(customerEmail && customerId && t) || !validateToken(t))
        return new PaymentResponse(400)
    const payment = t.token.data.products
        .map((prod) => prod.price)
        .reduce((prev, curr) => curr + prev)
    let sessionId = sendOrderToStripe(payment)
    repo.placeOrder(sessionId, addr, t.token.data.products, customerEmail, customerId, additionalInfo)
    return new PaymentResponse(200, sessionId)
}
export default lambda

function validateToken(t: CartToken): boolean {
    const hmac = createHmac("sha256", "password")
        .update(JSON.stringify(t.token))
        .digest("base64")
    return hmac === t.hmac && new Date(t.token.timeout).getTime() >= Date.now()
}

function sendOrderToStripe(_paymentDue: number): string {
    return "pi_testPaymentId"
}