
-- Add the two new real eSIM Access plans to the esim_packages table
INSERT INTO public.esim_packages (plan_id, plan_name, esim_access_package_id, package_name, data_amount, validity_days, price, currency) VALUES
('palop-neighbours1', 'Palop Neighbours1', 'DZ_01_7', 'Algeria 100MB 7 Days', '100 MB', 7, 2.30, 'EUR'),
('palop-neighbours2', 'Palop Neighbours2', 'AF-29_1_7', 'Africa 1GB 7 Days', '1 GB', 7, 7.70, 'EUR');
