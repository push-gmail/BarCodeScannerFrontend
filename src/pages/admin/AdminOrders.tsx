import { useEffect, useMemo, useRef, useState } from "react";
import {
  CheckCircle2,
  Clock3,
  Eye,
  Mail,
  Phone,
  UserRound,
  X,
} from "lucide-react";

import {
  getAdminOrders,
  updateAdminOrderStatus,
  type AdminOrder,
  type AdminOrderItem,
  type AdminOrderStatus,
  type ApprovalQrCode,
} from "../../api/adminApi";

function formatDate(value?: string | null) {
  if (!value) return "-";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";

  return date.toLocaleString();
}

function formatMoney(value: unknown) {
  const amount = Number(value || 0);
  return Number.isFinite(amount) ? amount.toFixed(2) : "0.00";
}

function displayValue(value: unknown) {
  if (value === null || value === undefined || value === "") return "-";
  if (Array.isArray(value)) return value.join(", ");
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
}



type ApprovalPopupData = {
  orderId: string;
  qrCodes: ApprovalQrCode[];
  emailSent: boolean;
  emailError?: string;
  pdfUrl?: string;
};

export default function AdminOrders() {
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<AdminOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | AdminOrderStatus>("all");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [approvalPopup, setApprovalPopup] = useState<ApprovalPopupData | null>(null);
  const popupTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const loadOrders = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await getAdminOrders(
        filter === "all" ? undefined : filter,
      );

      setOrders(response.data.orders || []);

      if (selectedOrder) {
        const fresh = (response.data.orders || []).find(
          (order) => order._id === selectedOrder._id,
        );
        if (fresh) setSelectedOrder(fresh);
      }
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  useEffect(() => {
    return () => {
      if (popupTimer.current) clearTimeout(popupTimer.current);
    };
  }, []);

  const closeApprovalPopup = () => {
    if (popupTimer.current) {
      clearTimeout(popupTimer.current);
      popupTimer.current = null;
    }
    setApprovalPopup(null);
  };

  const showApprovalPopup = (data: ApprovalPopupData) => {
    if (popupTimer.current) clearTimeout(popupTimer.current);
    setApprovalPopup(data);
    popupTimer.current = setTimeout(() => {
      setApprovalPopup(null);
      popupTimer.current = null;
    }, 20000);
  };

  const counts = useMemo(() => {
    const pending = orders.filter((order) => order.status === "pending").length;
    const approved = orders.filter((order) => order.status === "approved").length;

    return {
      total: orders.length,
      pending,
      approved,
    };
  }, [orders]);

  const changeStatus = async (
    order: AdminOrder,
    status: AdminOrderStatus,
  ) => {
    try {
      setActionId(order._id);
      setMessage("");
      setError("");

      const response = await updateAdminOrderStatus(order._id, status);

      setMessage(response.data.message || "Order status updated");

      setOrders((current) =>
        current.map((item) =>
          item._id === order._id ? response.data.order : item,
        ),
      );

      setSelectedOrder((current) =>
        current?._id === order._id ? response.data.order : current,
      );

      if (status === "approved") {
        showApprovalPopup({
          orderId: order._id,
          qrCodes: response.data.qrCodes || [],
          emailSent: Boolean(response.data.emailSent),
          emailError: response.data.emailError,
          pdfUrl: response.data.pdfUrl,
        });
      }
    } catch (err: any) {
      setError(err?.response?.data?.message || "Unable to update order status");
    } finally {
      setActionId(null);
    }
  };

  return (
    <div className="adminOrdersPage">
      <div className="adminOrdersHead">
        <div>
          <h1>Orders</h1>
          <p>Review user orders and keep them Pending or Approve them.</p>
        </div>

        <div className="adminOrderSummary">
          <span>Total: {counts.total}</span>
          <span>Pending: {counts.pending}</span>
          <span>Approved: {counts.approved}</span>
        </div>
      </div>

      <div className="adminOrderFilters">
        <button
          type="button"
          className={filter === "all" ? "active" : ""}
          onClick={() => setFilter("all")}
        >
          All
        </button>

        <button
          type="button"
          className={filter === "pending" ? "active" : ""}
          onClick={() => setFilter("pending")}
        >
          Pending
        </button>

        <button
          type="button"
          className={filter === "approved" ? "active" : ""}
          onClick={() => setFilter("approved")}
        >
          Approved
        </button>
      </div>

      {error && <div className="adminOrderError">{error}</div>}
      {message && <div className="success">{message}</div>}

      <section className="panel adminOrdersPanel">
        {loading ? (
          <div className="adminOrdersEmpty">Loading orders...</div>
        ) : orders.length === 0 ? (
          <div className="adminOrdersEmpty">No orders found.</div>
        ) : (
          <div className="tableWrap adminOrdersTableWrap">
            <table className="adminOrdersTable">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Contact</th>
                  <th>Product</th>
                  <th>Total</th>
                  <th>Order Date</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {orders.map((order) => {
                  const firstItem = order.items?.[0];
                  const image = firstItem?.selectedImage?.url;
                  const busy = actionId === order._id;

                  return (
                    <tr key={order._id}>
                      <td>
                        <div className="adminOrderUserCell">
                          <strong>{order.userId?.name || "Unknown User"}</strong>
                          <small>#{order._id.slice(-8)}</small>
                        </div>
                      </td>

                      <td>
                        <div className="adminOrderContactCell">
                          <span>
                            <Mail size={14} /> {order.userId?.email || "-"}
                          </span>
                          <span>
                            <Phone size={14} /> {order.userId?.phone || "-"}
                          </span>
                        </div>
                      </td>

                      <td>
                        <div className="adminOrderProductCell">
                          {image ? (
                            <img src={image} alt={firstItem?.categoryName || "Order product"} />
                          ) : (
                            <div className="adminOrderImageFallback">QR</div>
                          )}

                          <div>
                            <strong>{firstItem?.categoryName || "Product"}</strong>
                            <small>
                              {order.items?.length || 0} item
                              {(order.items?.length || 0) === 1 ? "" : "s"}
                            </small>
                          </div>
                        </div>
                      </td>

                      <td>
                        <strong>₹{formatMoney(order.totalAmount)}</strong>
                      </td>

                      <td>{formatDate(order.createdAt)}</td>

                      <td>
                        <span
                          className={`adminOrderStatus adminOrderStatus-${order.status}`}
                        >
                          {order.status === "approved" ? "Approved" : "Pending"}
                        </span>
                      </td>

                      <td>
                        <div className="adminOrderActions">
                          <button
                            type="button"
                            className="adminOrderViewAction"
                            title="View order"
                            onClick={() => setSelectedOrder(order)}
                          >
                            <Eye size={18} />
                          </button>

                          <button
                            type="button"
                            className={`adminOrderApproveAction ${
                              order.status === "approved" ? "selected" : ""
                            }`}
                            title="Approve order"
                            disabled={busy}
                            onClick={() => changeStatus(order, "approved")}
                          >
                            <CheckCircle2 size={19} />
                          </button>

                          <button
                            type="button"
                            className={`adminOrderPendingAction ${
                              order.status === "pending" ? "selected" : ""
                            }`}
                            title="Keep order pending"
                            disabled={busy}
                            onClick={() => changeStatus(order, "pending")}
                          >
                            <Clock3 size={19} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {selectedOrder && (
        <OrderDetailsModal
          order={selectedOrder}
          busy={actionId === selectedOrder._id}
          onClose={() => setSelectedOrder(null)}
          onStatusChange={(status) => changeStatus(selectedOrder, status)}
        />
      )}

      {approvalPopup && (
        <ApprovalQrPopup data={approvalPopup} onClose={closeApprovalPopup} />
      )}
    </div>
  );
}


function ApprovalQrPopup({
  data,
  onClose,
}: {
  data: ApprovalPopupData;
  onClose: () => void;
}) {
  return (
    <div className="approvalQrBackdrop" role="presentation" onMouseDown={onClose}>
      <div
        className="approvalQrModal"
        role="dialog"
        aria-modal="true"
        aria-label="Generated QR codes"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="approvalQrModalHead">
          <div>
            <h2>Order Approved</h2>
            <p>QR generated successfully.</p>
          </div>
          <button type="button" onClick={onClose} aria-label="Close QR popup">
            <X size={20} />
          </button>
        </div>

        <div className="approvalQrGrid">
          {data.qrCodes.length ? (
            data.qrCodes.map((qrCode) => (
              <article key={qrCode._id} className="approvalQrCard">
                {qrCode.qrImageUrl ? (
                  <img src={qrCode.qrImageUrl} alt={qrCode.code} />
                ) : (
                  <div className="approvalQrImageFallback">QR</div>
                )}
                <strong>{qrCode.code}</strong>
              </article>
            ))
          ) : (
            <p>QR generated.</p>
          )}
        </div>

        <div className={data.emailSent ? "approvalEmailOk" : "approvalEmailWarning"}>
          {data.emailSent
            ? "PDF sent to user's email successfully."
            : data.emailError || "QR generated, but email could not be sent."}
        </div>

        <p className="approvalQrAutoClose">
          This popup will close automatically in 20 seconds.
        </p>
      </div>
    </div>
  );
}

function OrderDetailsModal({
  order,
  busy,
  onClose,
  onStatusChange,
}: {
  order: AdminOrder;
  busy: boolean;
  onClose: () => void;
  onStatusChange: (status: AdminOrderStatus) => void;
}) {
  return (
    <div className="adminOrderModalBackdrop" role="presentation" onMouseDown={onClose}>
      <div
        className="adminOrderModal"
        role="dialog"
        aria-modal="true"
        aria-label="Order details"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="adminOrderModalHead">
          <div>
            <h2>Order Details</h2>
            <p>#{order._id}</p>
          </div>

          <button type="button" onClick={onClose} aria-label="Close order details">
            <X size={20} />
          </button>
        </div>

        <div className="adminOrderCustomerCard">
          <div>
            <UserRound size={18} />
            <span>
              <small>Name</small>
              <strong>{order.userId?.name || "-"}</strong>
            </span>
          </div>

          <div>
            <Mail size={18} />
            <span>
              <small>Email</small>
              <strong>{order.userId?.email || "-"}</strong>
            </span>
          </div>

          <div>
            <Phone size={18} />
            <span>
              <small>Phone</small>
              <strong>{order.userId?.phone || "-"}</strong>
            </span>
          </div>
        </div>

        <div className="adminOrderModalItems">
          {(order.items || []).map((item, index) => (
            <OrderItemDetails key={`${order._id}-${index}`} item={item} />
          ))}
        </div>

        <div className="adminOrderTotalCard">
          <span>Total</span>
          <strong>₹{formatMoney(order.totalAmount)}</strong>
        </div>

        <div className="adminOrderModalMeta">
          <span>Placed: {formatDate(order.createdAt)}</span>
          <span>
            Status: {order.status === "approved" ? "Approved" : "Pending"}
          </span>
          {order.processedAt && (
            <span>Processed: {formatDate(order.processedAt)}</span>
          )}
        </div>

        <div className="adminOrderModalActions">
          <button
            type="button"
            className="adminOrderApproveButton"
            disabled={busy}
            onClick={() => onStatusChange("approved")}
          >
            <CheckCircle2 size={18} /> Approve
          </button>

          <button
            type="button"
            className="adminOrderPendingButton"
            disabled={busy}
            onClick={() => onStatusChange("pending")}
          >
            <Clock3 size={18} /> Pending
          </button>
        </div>
      </div>
    </div>
  );
}

function OrderItemDetails({ item }: { item: AdminOrderItem }) {
  return (
    <article className="adminOrderItemCard">
      <div className="adminOrderItemMain">
        {item.selectedImage?.url ? (
          <img src={item.selectedImage.url} alt={item.categoryName || "QR product"} />
        ) : (
          <div className="adminOrderItemImageFallback">QR</div>
        )}

        <div>
          <h3>{item.categoryName || "Product"}</h3>
          <p>Price: ₹{formatMoney(item.unitPrice)}</p>
          <p>Quantity: {item.quantity || 1}</p>
          <strong>₹{formatMoney(item.lineTotal)}</strong>
        </div>
      </div>

      <div className="adminOrderSpecificationList">
        <h4>Specifications</h4>

        {item.specificationValues?.length ? (
          item.specificationValues.map((specification, index) => (
            <div key={`${specification.key || specification.label}-${index}`}>
              <span>{specification.label || specification.key || "Specification"}</span>
              <strong>{displayValue(specification.value)}</strong>
            </div>
          ))
        ) : (
          <p>No specifications saved.</p>
        )}
      </div>
    </article>
  );
}
