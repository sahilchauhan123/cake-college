export const BAKERY_WHATSAPP_NUMBER =
  process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '919876543210';

export function getWhatsAppUrl(message: string): string {
  return `https://wa.me/${BAKERY_WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}

export function formatOrderWhatsAppMessage(order: {
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  fulfillmentType: 'DELIVERY' | 'PICKUP';
  deliveryAddress?: string;
  deliveryDate: string;
  deliverySlot: string;
  items: Array<{
    name: string;
    quantity: number;
    size?: string;
    price: number;
    message?: string;
  }>;
  subtotal: number;
  deliveryFee: number;
  grandTotal: number;
  notes?: string;
}): string {
  const itemsText = order.items
    .map(
      (item) =>
        `• *${item.quantity}x ${item.name}* (${item.size || 'Standard'}) - $${(
          item.price * item.quantity
        ).toFixed(2)}${item.message ? `\n   ✍️ Message: "${item.message}"` : ''}`
    )
    .join('\n');

  return `🎂 *NEW BAKERY ORDER: #${order.orderNumber}*
----------------------------------------
👤 *Customer:* ${order.customerName}
📞 *Phone:* ${order.customerPhone}
📦 *Fulfillment:* ${order.fulfillmentType === 'DELIVERY' ? '🚚 Home Delivery' : '🏪 Bakery Pickup'}
📅 *Date & Slot:* ${order.deliveryDate} (${order.deliverySlot})
${order.fulfillmentType === 'DELIVERY' && order.deliveryAddress ? `📍 *Address:* ${order.deliveryAddress}\n` : ''}
🛒 *Order Items:*
${itemsText}

----------------------------------------
Subtotal: $${order.subtotal.toFixed(2)}
Delivery Fee: $${order.deliveryFee.toFixed(2)}
*Total Amount:* *$${order.grandTotal.toFixed(2)}*
${order.notes ? `\n📝 *Notes:* ${order.notes}` : ''}
----------------------------------------
Please reply to confirm availability and scheduled baking time! ✨`;
}

export function formatCustomCakeWhatsAppMessage(cake: {
  requestNumber: string;
  customerName: string;
  customerPhone: string;
  cakeType: string;
  spongeFlavor: string;
  fillingFlavor: string;
  tierCount: number;
  estimatedWeightKg?: number;
  messageOnCake?: string;
  eventDate: string;
  deliverySlot: string;
  referenceImageUrl?: string;
  specialInstructions?: string;
}): string {
  return `✨ *NEW CUSTOM CAKE INQUIRY: #${cake.requestNumber}*
----------------------------------------
👤 *Customer:* ${cake.customerName}
📞 *Phone:* ${cake.customerPhone}
🍰 *Cake Style:* ${cake.cakeType}
🧁 *Sponge & Filling:* ${cake.spongeFlavor} with ${cake.fillingFlavor}
🎂 *Tiers:* ${cake.tierCount} Tier(s) (~${cake.estimatedWeightKg || 1} kg)
📅 *Event Date:* ${cake.eventDate} (${cake.deliverySlot})
${cake.messageOnCake ? `✍️ *Piped Message:* "${cake.messageOnCake}"\n` : ''}
${cake.referenceImageUrl ? `📷 *Reference Image:* ${cake.referenceImageUrl}\n` : ''}
${cake.specialInstructions ? `📝 *Special Requests:* ${cake.specialInstructions}\n` : ''}
----------------------------------------
Kindly review the custom design and reply with the final price quotation! 🥖`;
}
