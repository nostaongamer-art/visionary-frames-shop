import { supabase } from "@/integrations/supabase/client";

export interface Order {
  id: string;
  createdAt: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  customerCpf: string;
  address: {
    cep: string;
    street: string;
    number: string;
    complement: string;
    neighborhood: string;
    city: string;
    state: string;
  };
  shippingType: "free" | "express";
  paymentMethod: "credit_card" | "pix" | "boleto";
  items: {
    id: string | number;
    name: string;
    price: string;
    priceVal: number;
    quantity: number;
  }[];
  subtotal: number;
  discount: number;
  shippingCost: number;
  total: number;
  tags: {
    paymentStatus: "pago" | "pendente" | "reembolsado";
    shippingStatus: "com_frete" | "sem_frete";
  };
}

export interface CustomerAccount {
  fullName: string;
  email: string;
  phone: string;
  cpf: string;
  password?: string;
  createdAt: string;
}

function asContentRecord(value: unknown): Record<string, unknown> | null {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    return value as Record<string, unknown>;
  }
  return null;
}

// 1. ORDERS MANAGMENT
export async function fetchOrders(): Promise<Order[]> {
  try {
    const { data, error } = await supabase
      .from("home_page_content")
      .select("*")
      .eq("id", "orders_list")
      .single();

    if (error && error.code !== "PGRST116") {
      console.error("Error loading orders from Supabase:", error);
    }

    const content = asContentRecord(data?.content);
    if (content && Array.isArray(content.orders)) {
      if (typeof window !== "undefined") {
        localStorage.setItem("glasses_orders_list", JSON.stringify(content.orders));
      }
      return content.orders as Order[];
    }
  } catch (e) {
    console.error("Failed to fetch orders:", e);
  }

  // Fallback to local storage
  if (typeof window !== "undefined") {
    try {
      const cached = localStorage.getItem("glasses_orders_list");
      if (cached) return JSON.parse(cached);
    } catch (e) {
      console.error("Error reading orders from localStorage:", e);
    }
  }
  return [];
}

export async function saveOrder(orderData: Omit<Order, "id" | "createdAt">): Promise<Order> {
  const newOrder: Order = {
    ...orderData,
    id: `PED-${Math.floor(100000 + Math.random() * 900000)}`,
    createdAt: new Date().toISOString(),
  };

  const currentOrders = await fetchOrders();
  const updatedOrders = [newOrder, ...currentOrders]; // Add new order to start of list

  // Save locally
  if (typeof window !== "undefined") {
    localStorage.setItem("glasses_orders_list", JSON.stringify(updatedOrders));
  }

  // Save to DB
  try {
    await supabase.from("home_page_content").upsert({
      id: "orders_list",
      content: { orders: updatedOrders } as unknown as Json,
      updated_at: new Date().toISOString(),
    });
  } catch (e) {
    console.error("Error saving orders to Supabase:", e);
  }

  return newOrder;
}

export async function updateOrderTags(
  orderId: string,
  paymentStatus: "pago" | "pendente" | "reembolsado",
  shippingStatus: "com_frete" | "sem_frete"
): Promise<Order[]> {
  const currentOrders = await fetchOrders();
  const updatedOrders = currentOrders.map((ord) => {
    if (ord.id === orderId) {
      return {
        ...ord,
        tags: { paymentStatus, shippingStatus },
      };
    }
    return ord;
  });

  // Save locally
  if (typeof window !== "undefined") {
    localStorage.setItem("glasses_orders_list", JSON.stringify(updatedOrders));
  }

  // Save to DB
  try {
    await supabase.from("home_page_content").upsert({
      id: "orders_list",
      content: { orders: updatedOrders },
      updated_at: new Date().toISOString(),
    });
  } catch (e) {
    console.error("Error updating order tags in Supabase:", e);
  }

  return updatedOrders;
}

// 2. CUSTOMER ACCOUNTS MANAGMENT
export async function fetchCustomerAccounts(): Promise<CustomerAccount[]> {
  try {
    const { data, error } = await supabase
      .from("home_page_content")
      .select("*")
      .eq("id", "customer_accounts")
      .single();

    if (error && error.code !== "PGRST116") {
      console.error("Error loading customer accounts from Supabase:", error);
    }

    if (data && data.content && Array.isArray(data.content.accounts)) {
      if (typeof window !== "undefined") {
        localStorage.setItem("glasses_customer_accounts", JSON.stringify(data.content.accounts));
      }
      return data.content.accounts as CustomerAccount[];
    }
  } catch (e) {
    console.error("Failed to fetch customer accounts:", e);
  }

  // Fallback to local storage
  if (typeof window !== "undefined") {
    try {
      const cached = localStorage.getItem("glasses_customer_accounts");
      if (cached) return JSON.parse(cached);
    } catch (e) {
      console.error("Error reading customer accounts from localStorage:", e);
    }
  }
  return [];
}

export async function saveCustomerAccount(account: Omit<CustomerAccount, "createdAt">): Promise<CustomerAccount> {
  const newAccount: CustomerAccount = {
    ...account,
    createdAt: new Date().toISOString(),
  };

  const currentAccounts = await fetchCustomerAccounts();
  // Avoid duplicate CPFs
  const filtered = currentAccounts.filter(
    (acc) => acc.cpf.replace(/\D/g, "") !== account.cpf.replace(/\D/g, "")
  );
  const updatedAccounts = [...filtered, newAccount];

  // Save locally
  if (typeof window !== "undefined") {
    localStorage.setItem("glasses_customer_accounts", JSON.stringify(updatedAccounts));
  }

  // Save to DB
  try {
    await supabase.from("home_page_content").upsert({
      id: "customer_accounts",
      content: { accounts: updatedAccounts },
      updated_at: new Date().toISOString(),
    });
  } catch (e) {
    console.error("Error saving customer accounts to Supabase:", e);
  }

  return newAccount;
}

export async function findCustomerByCpf(cpf: string): Promise<CustomerAccount | null> {
  const cleanCpf = cpf.replace(/\D/g, "");
  const accounts = await fetchCustomerAccounts();
  return accounts.find((acc) => acc.cpf.replace(/\D/g, "") === cleanCpf) || null;
}

export async function findCustomerByEmailAndName(fullName: string, email: string): Promise<CustomerAccount | null> {
  const accounts = await fetchCustomerAccounts();
  const cleanName = fullName.trim().toLowerCase();
  const cleanEmail = email.trim().toLowerCase();

  return (
    accounts.find(
      (acc) =>
        acc.fullName.trim().toLowerCase() === cleanName &&
        acc.email.trim().toLowerCase() === cleanEmail
    ) || null
  );
}

export async function verifyCustomerCredentials(email: string, password: any): Promise<CustomerAccount | null> {
  const accounts = await fetchCustomerAccounts();
  const cleanEmail = email.trim().toLowerCase();
  
  return (
    accounts.find(
      (acc) =>
        acc.email.trim().toLowerCase() === cleanEmail &&
        acc.password === String(password)
    ) || null
  );
}
