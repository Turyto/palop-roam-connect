-- Remove dead plan-inventory trigger + function (P1 fix).
--
-- History: migration 20250622123816 created public.plan_inventory plus the function
-- decrease_plan_inventory_on_order() and the trigger trigger_decrease_plan_inventory on
-- public.orders. Migration 20250704211438 then ran `DROP TABLE IF EXISTS public.plan_inventory
-- CASCADE`, which removed the table but left the trigger and function orphaned, still
-- referencing the now-missing table.
--
-- The trigger fires AFTER UPDATE on orders and, whenever an order's status transitions to
-- 'completed', executes `UPDATE public.plan_inventory ...` against a table that no longer
-- exists — throwing and blocking order completion. Inventory tracking is not in use, so we
-- remove both objects. Reversible by re-applying 20250622123816 if inventory tracking is
-- reintroduced.
DROP TRIGGER IF EXISTS trigger_decrease_plan_inventory ON public.orders;
DROP FUNCTION IF EXISTS public.decrease_plan_inventory_on_order();
