
-- Corregir la función trigger para manejar correctamente los tipos UUID
CREATE OR REPLACE FUNCTION public.manejar_nuevo_usuario()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
BEGIN
  INSERT INTO public.perfiles (id, nombre_usuario)
  VALUES (
    NEW.id, 
    COALESCE(
      NEW.raw_user_meta_data ->> 'username',
      NEW.raw_user_meta_data ->> 'name',
      split_part(NEW.email, '@', 1)
    )
  );
  RETURN NEW;
END;
$function$;

-- Crear el trigger si no existe
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.manejar_nuevo_usuario();

-- Habilitar RLS en las tablas si no está ya habilitado
ALTER TABLE public.perfiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transacciones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.objetivos_ahorro ENABLE ROW LEVEL SECURITY;

-- Eliminar políticas existentes si existen y crear nuevas
DROP POLICY IF EXISTS "usuarios_pueden_ver_su_perfil" ON public.perfiles;
DROP POLICY IF EXISTS "usuarios_pueden_actualizar_su_perfil" ON public.perfiles;
DROP POLICY IF EXISTS "usuarios_pueden_ver_sus_transacciones" ON public.transacciones;
DROP POLICY IF EXISTS "usuarios_pueden_gestionar_sus_objetivos_ahorro" ON public.objetivos_ahorro;

-- Crear políticas RLS básicas para acceso a datos de usuario
CREATE POLICY "usuarios_pueden_ver_su_perfil" ON public.perfiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "usuarios_pueden_actualizar_su_perfil" ON public.perfiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "usuarios_pueden_ver_sus_transacciones" ON public.transacciones
  FOR ALL USING (auth.uid() = usuario_id);

CREATE POLICY "usuarios_pueden_gestionar_sus_objetivos_ahorro" ON public.objetivos_ahorro
  FOR ALL USING (auth.uid() = usuario_id);
