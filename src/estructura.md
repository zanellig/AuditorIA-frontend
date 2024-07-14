# Estructura extraída de la app original

## TABLA DE TASKS

| Identifier | Status | Task Type | Actions |
| ---------- | ------ | --------- | ------- |

```ts
  interface Actions {
    detail: showDetails() => void
    delete: deleteTask() => void
  }
```

## TABLA DASHBOARD

| Recording | Campaign | User | Direction | Duration | Date | Action |
| --------- | -------- | ---- | --------- | -------- | ---- | ------ |

### Corresponderían a estos headings de la base de datos de Neomirror

`row. GRABACION, IDAPLICACION, USUARIO, DIRECCION, SECTOT, FECHA`

> Asi esta en dashboard_logs.html

form:

```html
<form action="{{ url_for('copy_and_transcribe') }}" method="post">
  {{ dashboard_form.hidden_tag() }}
  <input type="hidden" name="grabacion" value="{{ row.GRABACION }}" />
  <input type="hidden" name="fecha" value="{{ row.FECHA }}" />
  <input type="hidden" name="application_id" value="{{ row.IDAPLICACION }}" />
  <input type="hidden" name="user" value="{{ row.USUARIO }}" />
  <input type="hidden" name="direction" value="{{ row.DIRECCION }}" />
  <input type="hidden" name="duration" value="{{ row.SECTOT }}" />
  <button type="submit" class="btn btn-small">Trascribir</button>
</form>
```

> La ruta acepta un GET y un POST

### Query

```python
query = f"""
            SELECT GRABACION, IDAPLICACION, USUARIO, DIRECCION, DATEDIFF(SS, CONEXION, FIN) AS SECTOT,
                   CONVERT(VARCHAR, FECHA, 112) AS FECHA
            FROM [10.20.30.35,2133].[TEL_LOGS].dbo.[_TICKETS] WITH (NOLOCK)
            WHERE IDAPLICACION IN ({placeholders})
            AND GRABACION <> ''
            AND FECHA >= ? AND FECHA <= ?
            AND DATEDIFF(SS, CONEXION, FIN) > ?
            ORDER BY SECTOT ASC
        """

```

> !? SECTOT es la duración de la llamada

### Secrets para consultar Neomirror

```python
connection = pyodbc.connect(
        'DRIVER={ODBC Driver 17 for SQL Server};'
        'SERVER=10.20.30.37;'
        'DATABASE=NEO_MIRROR;'
        'UID=iauser;'
        'PWD=123LSSop123'
    )
```

### Esta es la query que pude ejecutar en SSMS

```sql
SELECT
      [ID]
      ,[IDLLAMADA]
      ,[APLICACION]
      ,[IDAPLICACION]
      ,[USUARIO]
      ,[CONEXION]
      ,[FIN]
      ,[ANI_TELEFONO]
      ,[DIRECCION]
      ,[GRABACION]
   ,DATEDIFF(SS, CONEXION, FIN) AS SECTOT
   ,CONVERT(VARCHAR, FECHA, 112) AS FECHA
FROM [NEO_MIRROR].[dbo].[_TICKETS]
WHERE SECTOT > 40
-- AND IDAPLICACION IN (2)
AND FECHA >= '20240702' AND FECHA <= '20240703'
AND GRABACION <> ''
ORDER BY CONEXION DESC
```
