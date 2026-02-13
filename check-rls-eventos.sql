-- Ver políticas RLS actuales en eventos
SELECT
  tablename,
  policyname,
  permissive,
  roles,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'eventos'
ORDER BY policyname;

-- Si no hay policies, agregar una para permitir SELECT público
-- (ejecutar si es necesario)
ALTER TABLE eventos ENABLE ROW LEVEL SECURITY;

-- Permitir SELECT público (anónimos pueden leer eventos activos)
CREATE POLICY "Eventos activos son públicos" ON eventos
  FOR SELECT
  USING (true);

-- Permitir UPDATE/INSERT/DELETE solo para usuarios autenticados
CREATE POLICY "Solo autenticados pueden modificar eventos" ON eventos
  FOR UPDATE
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Solo autenticados pueden insertar eventos" ON eventos
  FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Solo autenticados pueden eliminar eventos" ON eventos
  FOR DELETE
  USING (auth.role() = 'authenticated');
