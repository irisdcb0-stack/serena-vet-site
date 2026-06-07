-- Seed data for Serena Vet services and prices
-- Run this after creating the schema (supabase.sql)

insert into public.services (slug, title, default_duration_minutes, base_price, description) values
('consulta','Consulta general',30,50,'Consulta general y valoración clínica'),
('peluqueria_basica','Peluquería básica',120,200,'Corte, baño y secado básico'),
('peluqueria_completa','Peluquería completa',180,300,'Baño, corte, deslanado, sacar nudos según necesidad'),
('cirugia_menor','Cirugía menor',60,100,'Suturas y procedimientos menores (estimación inicial)'),
('esterilizacion_gato','Esterilización gato',90,200,'Esterilización en felinos (rango 150-300 según caso)'),
('esterilizacion_perro','Esterilización perro',120,300,'Esterilización canina (precio varía por tamaño)')
on conflict (slug) do nothing;

-- Example prices for size categories
with s as (select id from public.services where slug = 'peluqueria_basica')
insert into public.prices (service_id, size_category, complexity, price)
select s.id, p.size, p.complex, p.price
from s cross join (values
  ('small','basic',180),
  ('medium','basic',220),
  ('large','basic',300),
  ('small','advanced',240),
  ('medium','advanced',300),
  ('large','advanced',420)
) as p(size, complex, price)
on conflict do nothing;

-- Additional sample entries can be added similarly for other services
