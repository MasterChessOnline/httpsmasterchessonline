
REVOKE EXECUTE ON FUNCTION public.purchase_shop_item(text, text, integer) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.award_bot_game_coins(integer, text, integer) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.award_online_game_coins(uuid, integer) FROM PUBLIC, anon;
