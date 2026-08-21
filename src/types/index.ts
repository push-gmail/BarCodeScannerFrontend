export type User = { id: string; name: string; email: string; phone?: string; status: string };
export type HomeItem = { _id: string; title: string; itemType: string; specifications: Record<string, unknown>; price: number; status: string };
export type Order = { _id: string; status: string; totalAmount: number; paymentMethod: string; items: Array<{ title: string; itemType: string; quantity: number; lineTotal: number; specifications: Record<string, unknown> }> };
