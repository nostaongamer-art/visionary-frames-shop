import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import { CustomerAccount, verifyCustomerCredentials, fetchOrders, Order } from "@/lib/orders-service";

interface CustomerContextValue {
  customer: CustomerAccount | null;
  orders: Order[];
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  refreshOrders: () => Promise<void>;
  loading: boolean;
}

const CustomerContext = createContext<CustomerContextValue | null>(null);

export function CustomerProvider({ children }: { children: ReactNode }) {
  const [customer, setCustomer] = useState<CustomerAccount | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem("glasses_logged_customer");
        if (saved) {
          setCustomer(JSON.parse(saved));
        }
      } catch (e) {
        console.error("Error reading logged customer:", e);
      }
      setLoading(false);
    }
  }, []);

  const refreshOrders = async () => {
    if (!customer) {
      setOrders([]);
      return;
    }
    const allOrders = await fetchOrders();
    const cleanCustomerCpf = customer.cpf.replace(/\D/g, "");
    const cleanCustomerEmail = customer.email.trim().toLowerCase();

    // Match orders by email or CPF
    const matched = allOrders.filter(
      (ord) =>
        ord.customerCpf.replace(/\D/g, "") === cleanCustomerCpf ||
        ord.customerEmail.trim().toLowerCase() === cleanCustomerEmail
    );
    setOrders(matched);
  };

  useEffect(() => {
    refreshOrders();
  }, [customer]);

  const login = async (email: string, password: string): Promise<boolean> => {
    const verified = await verifyCustomerCredentials(email, password);
    if (verified) {
      setCustomer(verified);
      if (typeof window !== "undefined") {
        localStorage.setItem("glasses_logged_customer", JSON.stringify(verified));
      }
      return true;
    }
    return false;
  };

  const logout = () => {
    setCustomer(null);
    setOrders([]);
    if (typeof window !== "undefined") {
      localStorage.removeItem("glasses_logged_customer");
    }
  };

  return (
    <CustomerContext.Provider
      value={{
        customer,
        orders,
        login,
        logout,
        refreshOrders,
        loading,
      }}
    >
      {children}
    </CustomerContext.Provider>
  );
}

export function useCustomer() {
  const ctx = useContext(CustomerContext);
  if (!ctx) throw new Error("useCustomer must be used within CustomerProvider");
  return ctx;
}
