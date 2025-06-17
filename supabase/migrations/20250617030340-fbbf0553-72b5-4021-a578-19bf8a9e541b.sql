
-- Corregir la función trigger para evitar duplicados y manejar errores
CREATE OR REPLACE FUNCTION public.manejar_nuevo_usuario()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
BEGIN
  -- Intentar insertar solo si el perfil no existe
  INSERT INTO public.perfiles (id, nombre_usuario)
  VALUES (
    NEW.id, 
    COALESCE(
      NEW.raw_user_meta_data ->> 'username',
      NEW.raw_user_meta_data ->> 'name',
      split_part(NEW.email, '@', 1)
    )
  )
  ON CONFLICT (id) DO NOTHING;
  
  RETURN NEW;
END;
$function$;
