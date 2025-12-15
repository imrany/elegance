import { Order, api } from "@/lib/api";
import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useMemo,
} from "react";
import { useAuth } from "./AuthContext";

interface OrderContextType {
  orders: Order[];
  getOrders: (key?: string, value?: string) => Promise<Order[]>;
  addOrder: (orderData: Order) => Promise<void>;
  removeOrder: (orderId: string) => Promise<void>;
  updateOrder: (orderId: string, orderData: Order) => Promise<void>;
  orderCount: number;
  orderStatusCount: Record<string, number>;
  isLoading: boolean;
  totalSpent: Record<string, number>;
}

const OrderContext = createContext<OrderContextType | undefined>(undefined);

export function OrderProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  async function getOrders(key?: string, value?: string) {
    setIsLoading(true);
    const { data: orders } = await api.getOrders(
      key || "user_id",
      value || user?.id,
    );
    setOrders(orders);
    setIsLoading(false);
    return orders;
  }

  useEffect(() => {
    getOrders();
  }, [user]);

  async function addOrder(orderData: Order) {
    setIsLoading(true);
    const { data: order } = await api.createOrder(orderData);
    setOrders((prev) => [...prev, order]);
    setIsLoading(false);
  }

  async function removeOrder(orderId: string) {
    setIsLoading(true);
    await api.deleteOrder(orderId);
    setOrders((prev) => prev.filter((order) => order.id !== orderId));
    setIsLoading(false);
  }

  async function updateOrder(orderId: string, orderData: Order) {
    setIsLoading(true);
    await api.updateOrder(orderId, orderData);
    setOrders((prev) =>
      prev.map((order) =>
        order.id === orderId ? { ...order, ...orderData } : order,
      ),
    );
    setIsLoading(false);
  }

  // Calculate stats
  const orderCount = useMemo(() => orders?.length || 0, [orders]);

  const orderStatusCount = useMemo(
    () =>
      orders?.reduce(
        (sum, order) => {
          const status = order?.status;
          return { ...sum, [status]: (sum[status] || 0) + 1 };
        },
        {} as Record<string, number>,
      ),
    [orders],
  );

  const totalSpent = useMemo(
    () =>
      orders?.reduce(
        (sum, order) => {
          const status = order?.status;
          const orderTotal = Number(order?.total) || 0;
          sum[status] = (sum[status] || 0) + orderTotal;
          return sum;
        },
        {} as Record<string, number>,
      ),
    [orders],
  );

  return (
    <OrderContext.Provider
      value={{
        orders,
        getOrders,
        addOrder,
        removeOrder,
        updateOrder,
        orderCount,
        orderStatusCount,
        isLoading,
        totalSpent,
      }}
    >
      {children}
    </OrderContext.Provider>
  );
}

export function useOrder() {
  const context = useContext(OrderContext);
  if (!context) {
    throw new Error("useOrder must be used within a CartProvider");
  }
  return context;
}
