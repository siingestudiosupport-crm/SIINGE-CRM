# 🔐 RLS Testing Guide - Verificación Crítica

## ¿Qué hace RLS?

**ANTES (sin RLS):**
```bash
curl -H "apikey: YOUR_SUPABASE_KEY" \
  https://your-supabase.co/rest/v1/clients?select=*

# Resultado: {"data": [todos los clientes]}
# Cualquiera con la API key = acceso total
```

**DESPUÉS (con RLS):**
```bash
curl -H "apikey: YOUR_SUPABASE_KEY" \
  https://your-supabase.co/rest/v1/clients?select=*

# Resultado: {"error": "row level security violation"}
# La API key SOLA no funciona, necesita usuario autenticado
```

---

## Pasos para Implementar

### 1. Ejecuta la SQL en Supabase

1. Ve a: **Supabase → SQL Editor**
2. Copia todo el contenido de `RLS_POLICIES.sql`
3. Pega en el editor
4. Click en **RUN**
5. Espera a que termine (1-2 min)

**Esperado:** "Success" sin errores

---

### 2. Verifica que RLS está activado

En SQL Editor, ejecuta:

```sql
SELECT schemaname, tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;
```

**Deberías ver:**
```
schemaname | tablename              | rowsecurity
-----------+------------------------+-------------
public     | activity_logs          | t (true)
public     | clients                | t (true)
public     | email_queue            | t (true)
public     | email_templates        | t (true)
public     | portal_access_tokens   | t (true)
public     | portal_request_logs    | t (true)
public     | projects               | t (true)
```

Si alguna tabla muestra `f (false)`, significa que RLS no está activado para esa tabla.

---

### 3. Verifica que las políticas están creadas

Ejecuta:

```sql
SELECT schemaname, tablename, policyname, permissive
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;
```

**Deberías ver políticas como:**
```
public | clients | Team can view all clients        | PERMISSIVE
public | clients | Team can insert clients          | PERMISSIVE
public | clients | Team can update clients          | PERMISSIVE
public | clients | Team can delete clients          | PERMISSIVE
```

Cuantas más políticas, mejor (eso significa más granularidad).

---

## Pruebas Críticas

### Test 1: API Key SIN autenticación (DEBE FALLAR)

**En Postman o similar:**

```
GET https://your-supabase.co/rest/v1/clients?select=*
Headers:
  apikey: YOUR_SUPABASE_ANON_KEY
```

**Resultado esperado:**
```json
{
  "code": "PGRST301",
  "message": "row level security violation",
  "hint": "The select statement attempted to select from something without the appropriate grants or some of the selected columns are restricted"
}
```

**Si ves los datos:** ❌ RLS no está funcionando

---

### Test 2: Dashboard (DEBE FUNCIONAR)

1. Ve a tu app: `http://localhost:5173`
2. Login con tu cuenta
3. Deberías ver todos tus clientes

**Si ves error "unauthorized":** Hay un problema con RLS

---

### Test 3: Portal SIN token (DEBE MOSTRAR ERROR DE TOKEN, NO DE RLS)

1. Abre el portal sin token: `/portal/ANY_CLIENT_ID/sow/ANY_PROJECT_ID`
2. Deberías ver: **"Missing access token"**
3. NO deberías ver: **"row level security violation"**

**Si ves RLS error:** La política del portal está mal

---

### Test 4: Portal CON token válido (DEBE FUNCIONAR)

1. Envía un SOW a un cliente desde el dashboard
2. El email tiene un link con token: `/portal/...?token=xyz`
3. Abre el link
4. Deberías ver el documento

**Si ves RLS error:** Hay un problema con la política pública

---

## Troubleshooting

### Problema: Dashboard muestra "unauthorized"

**Causa:** RLS está bloqueando a usuarios autenticados

**Solución:**
```sql
-- Verifica que el usuario está autenticado
SELECT auth.uid(), auth.role();

-- Si retorna NULL o 'anon', el usuario no está logged in
-- Si retorna un UUID y 'authenticated', está bien
```

---

### Problema: Portal no funciona

**Causa:** Política de portal es muy restrictiva

**Solución:** Verifica que la política permite lectura pública:
```sql
SELECT * FROM pg_policies
WHERE tablename = 'portal_access_tokens' 
  AND policyname LIKE '%public%';
```

Debería haber una política con `USING (true)` para permitir acceso público.

---

### Problema: Algunos clientes ven datos de otros

**Causa:** RLS no está configurado correctamente

**Solución:**
```sql
-- Verifica que NO hay política "FOR ALL USING (true)"
-- Eso permitiría acceso a todo

SELECT * FROM pg_policies
WHERE schemaname = 'public'
  AND qual = 'true'
  AND tablename IN ('clients', 'projects');
```

Si ves algo así, ELIMINA esas políticas.

---

## Monitoreo Continuado

### Cada semana, verifica:

```sql
-- Ver intentos fallidos de acceso (si Supabase lo registra)
-- Esto depende de tu plan de Supabase

SELECT COUNT(*) as failed_rls_checks
FROM pg_stat_statements
WHERE query LIKE '%row level security%';
```

### Cada mes, audita:

```sql
-- Ver qué usuarios han accedido a qué
SELECT COUNT(*), client_id, document_type
FROM portal_request_logs
WHERE created_at > now() - INTERVAL '30 days'
GROUP BY client_id, document_type
ORDER BY COUNT(*) DESC;
```

---

## Checklist de Verificación

- [ ] Todas las tablas sensibles tienen RLS = ON
- [ ] Dashboard funciona (puedo ver clientes)
- [ ] Portal público funciona (puedo firmar con token)
- [ ] API key sola NO funciona (retorna RLS error)
- [ ] Políticas están creadas para todas las tablas
- [ ] No hay políticas "USING (true)" para tablas sensibles
- [ ] Logs muestran accesos sin RLS errors

---

## Si algo sale mal

Si después de esto tu app está rota:

### Opción 1: Deshabilitar RLS temporalmente
```sql
-- SOLO para debug - NO mantener en producción
ALTER TABLE clients DISABLE ROW LEVEL SECURITY;
ALTER TABLE projects DISABLE ROW LEVEL SECURITY;
```

Esto te permitirá diagnosticar si el problema es RLS o algo más.

### Opción 2: Contactar Supabase Support
- Ve a: Supabase Dashboard → Support
- Diles: "RLS broke my app, necesito revertir"
- Pueden restaurar un backup si es necesario

---

## Próximo Paso: UUIDs

Una vez que RLS está funcionando correctamente:

1. Implementar UUIDs en clientes y projects (evita enumeration)
2. Luego encryption de datos (defensa en profundidad)

¿Ejecutaste la SQL y todo funciona? Avísame y continuamos con UUIDs.
