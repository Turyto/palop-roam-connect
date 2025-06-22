
import { useCreateOrder } from './orders/useCreateOrder';
import { useUpdateOrder } from './orders/useUpdateOrder';
import { useFetchOrders } from './orders/useFetchOrders';

export const useOrders = () => {
  const { orders, ordersLoading, ordersError } = useFetchOrders();
  const { createOrder, createOrderAsync, isCreatingOrder } = useCreateOrder();
  const { updateOrder, isUpdatingOrder } = useUpdateOrder();

  return {
    orders,
    ordersLoading,
    ordersError,
    createOrder,
    createOrderAsync,
    updateOrder,
    isCreatingOrder,
    isUpdatingOrder
  };
};
