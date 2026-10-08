alter table public.orders
  add column if not exists customer_name text not null default '',
  add column if not exists customer_phone text not null default '',
  add column if not exists shipping_address text not null default '',
  add column if not exists payment_method text not null default 'Pay on delivery';

create or replace function public.add_item_to_cart(p_product_id bigint)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := (select auth.uid());
  v_stock integer;
  v_is_active boolean;
  v_quantity integer;
begin
  if v_user_id is null then
    raise exception 'Sign in to save items to your bag.';
  end if;

  if public.current_user_role() is distinct from 'customer' then
    raise exception 'Only customer accounts can place orders.';
  end if;

  select stock, is_active
  into v_stock, v_is_active
  from public.products
  where id = p_product_id
  for update;

  if not found or not v_is_active then
    raise exception 'This product is no longer available.';
  end if;

  insert into public.cart (user_id, product_id, quantity)
  values (v_user_id, p_product_id, 1)
  on conflict (user_id, product_id)
  do update set quantity = public.cart.quantity + 1
  returning quantity into v_quantity;

  if v_quantity > v_stock then
    raise exception 'Only % item(s) are currently available.', v_stock;
  end if;
end;
$$;

create or replace function public.set_cart_quantity(p_product_id bigint, p_quantity integer)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := (select auth.uid());
  v_stock integer;
  v_is_active boolean;
begin
  if v_user_id is null then
    raise exception 'Sign in to update your saved bag.';
  end if;

  if public.current_user_role() is distinct from 'customer' then
    raise exception 'Only customer accounts can manage a shopping bag.';
  end if;

  if p_quantity < 0 then
    raise exception 'Quantity cannot be negative.';
  end if;

  if p_quantity = 0 then
    delete from public.cart
    where user_id = v_user_id and product_id = p_product_id;
    return;
  end if;

  select stock, is_active
  into v_stock, v_is_active
  from public.products
  where id = p_product_id
  for update;

  if not found or not v_is_active then
    raise exception 'This product is no longer available.';
  end if;

  if p_quantity > v_stock then
    raise exception 'Only % item(s) are currently available.', v_stock;
  end if;

  insert into public.cart (user_id, product_id, quantity)
  values (v_user_id, p_product_id, p_quantity)
  on conflict (user_id, product_id)
  do update set quantity = excluded.quantity;
end;
$$;

create or replace function public.merge_guest_cart(p_items jsonb)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := (select auth.uid());
  v_guest_item record;
  v_stock integer;
  v_is_active boolean;
  v_saved_quantity integer;
begin
  if v_user_id is null then
    raise exception 'Sign in to sync your bag.';
  end if;

  if public.current_user_role() is distinct from 'customer' then
    raise exception 'Only customer accounts can sync a shopping bag.';
  end if;

  if jsonb_typeof(p_items) is distinct from 'array'
     or exists (
       select 1
       from jsonb_to_recordset(p_items) as item(product_id bigint, quantity integer)
       where item.product_id is null or item.quantity is null or item.quantity < 1
     ) then
    raise exception 'The saved bag contains invalid items.';
  end if;

  for v_guest_item in
    select item.product_id, sum(item.quantity)::integer as quantity
    from jsonb_to_recordset(p_items) as item(product_id bigint, quantity integer)
    group by item.product_id
    order by item.product_id
  loop
    select stock, is_active
    into v_stock, v_is_active
    from public.products
    where id = v_guest_item.product_id
    for update;

    if not found or not v_is_active then
      raise exception 'A product in your saved bag is no longer available.';
    end if;

    select coalesce((
      select quantity
      from public.cart
      where user_id = v_user_id and product_id = v_guest_item.product_id
    ), 0)
    into v_saved_quantity
    ;

    if v_saved_quantity + v_guest_item.quantity > v_stock then
      raise exception 'There is not enough stock for a product in your saved bag.';
    end if;

    insert into public.cart (user_id, product_id, quantity)
    values (v_user_id, v_guest_item.product_id, v_saved_quantity + v_guest_item.quantity)
    on conflict (user_id, product_id)
    do update set quantity = excluded.quantity;
  end loop;
end;
$$;

create or replace function public.place_order(
  p_customer_name text,
  p_customer_phone text,
  p_shipping_address text
)
returns table(order_id bigint, total numeric)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := (select auth.uid());
  v_order_id bigint;
  v_total numeric(10, 2) := 0;
  v_item_count integer := 0;
  v_cart_item record;
begin
  if v_user_id is null then
    raise exception 'Sign in before placing an order.';
  end if;

  if public.current_user_role() is distinct from 'customer' then
    raise exception 'Only customer accounts can place orders.';
  end if;

  if length(trim(coalesce(p_customer_name, ''))) < 2
     or length(trim(coalesce(p_customer_phone, ''))) < 7
     or length(trim(coalesce(p_shipping_address, ''))) < 10 then
    raise exception 'Enter your name, a valid phone number, and full delivery address.';
  end if;

  for v_cart_item in
    select c.product_id, c.quantity, p.price, p.stock, p.is_active
    from public.cart c
    join public.products p on p.id = c.product_id
    where c.user_id = v_user_id
    order by c.product_id
    for update of c, p
  loop
    if not v_cart_item.is_active then
      raise exception 'A product in your bag is no longer available.';
    end if;

    if v_cart_item.quantity > v_cart_item.stock then
      raise exception 'A product in your bag does not have enough stock.';
    end if;

    v_item_count := v_item_count + 1;
    v_total := v_total + (v_cart_item.price * v_cart_item.quantity);
  end loop;

  if v_item_count = 0 then
    raise exception 'Your bag is empty.';
  end if;

  insert into public.orders (
    user_id,
    total,
    status,
    customer_name,
    customer_phone,
    shipping_address,
    payment_method
  )
  values (
    v_user_id,
    v_total,
    'Processing',
    trim(p_customer_name),
    trim(p_customer_phone),
    trim(p_shipping_address),
    'Pay on delivery'
  )
  returning id into v_order_id;

  insert into public.order_items (order_id, product_id, quantity, price)
  select v_order_id, c.product_id, c.quantity, p.price
  from public.cart c
  join public.products p on p.id = c.product_id
  where c.user_id = v_user_id;

  update public.products p
  set stock = p.stock - c.quantity
  from public.cart c
  where c.user_id = v_user_id
    and c.product_id = p.id;

  delete from public.cart where user_id = v_user_id;

  return query select v_order_id, v_total;
end;
$$;

revoke all on function public.add_item_to_cart(bigint) from public;
revoke all on function public.set_cart_quantity(bigint, integer) from public;
revoke all on function public.merge_guest_cart(jsonb) from public;
revoke all on function public.place_order(text, text, text) from public;
grant execute on function public.add_item_to_cart(bigint) to authenticated;
grant execute on function public.set_cart_quantity(bigint, integer) to authenticated;
grant execute on function public.merge_guest_cart(jsonb) to authenticated;
grant execute on function public.place_order(text, text, text) to authenticated;
