import OrderResponse from 'src/models/OrderResponse';
import OrderRepository from 'src/repository/OrderRepository';
import { PaymentEvent, PaymentStatus } from 'src/models/PaymentEvent';
import PaymentResponse from 'src/models/PaymentResponse';

const lambda = async (
    repo: OrderRepository,
    paymentEvent: PaymentEvent,
): Promise<OrderResponse> => {
    let outcome = 204;
    if (paymentEvent.type === PaymentStatus.success) {
        outcome = await repo.moveToPayedOrders(paymentEvent.data.object.id) ? outcome : 500;
    }
    return new PaymentResponse(outcome);
};
export default lambda;
