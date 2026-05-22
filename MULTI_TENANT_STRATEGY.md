# Estrategia de Despliegue Multi-Cliente (Managed Single-Tenant)

Este documento describe la arquitectura recomendada para comercializar y distribuir Kambio a múltiples agencias (clientes) manteniendo la simplicidad del código y la seguridad de los datos, sin la complejidad de un SaaS Multi-Tenant monolítico.

## El Concepto: Inquilino Único Gestionado

El objetivo es tener **10, 50 o 100 clientes** utilizando Kambio de forma independiente, pero **centralizando el código**. 

Para lograrlo:
- **Código Fuente:** Único (1 solo repositorio en GitHub).
- **Base de Datos:** Múltiples (1 base de datos física aislada por cliente).
- **Infraestructura:** Despliegues independientes mediante PaaS (Platform as a Service).

Al mantener bases de datos físicamente separadas, garantizamos que los datos de la "Agencia A" nunca se mezclen con los de la "Agencia B", logrando el máximo nivel de seguridad (Data Isolation).

## Flujo de Infraestructura

1. **Alojamiento (Frontend/Backend):** Utilizar Vercel, Railway, o una solución auto-hospedada como Coolify.
2. **Bases de Datos:** Crear una base de datos independiente (en Turso, Supabase, o PostgreSQL privado) para cada cliente.
3. **Despliegue:** En la plataforma de alojamiento, se crea un "Proyecto" por cliente, todos apuntando a la misma rama `main` del repositorio de GitHub.
4. **Separación:** A cada proyecto se le asigna su propia variable de entorno `.env` con su respectivo `DATABASE_URL`.

## El Reto de las Actualizaciones de Base de Datos

Cuando se añade una nueva funcionalidad que requiere cambios en el esquema de la base de datos (ej. añadir una nueva tabla o columna en Prisma), ¿cómo actualizamos las 50 bases de datos sin borrar datos de clientes ni hacerlo manualmente?

La solución recae en la **automatización de migraciones (Prisma Migrate Deploy)**:

1. **Desarrollo:** Al cambiar `schema.prisma`, se ejecuta `npx prisma migrate dev`. Esto crea un archivo SQL seguro (una "migración") que instruye cómo alterar las tablas (`ALTER TABLE...`).
2. **Control de Versiones:** Los archivos de migración SQL se suben a GitHub.
3. **Pipeline de Producción:** El comando de "Build" en los servidores de los clientes se configura así:
   ```bash
   npx prisma generate && npx prisma migrate deploy && npm run build
   ```
4. **Ejecución Automática:** Cuando Vercel/Coolify recibe la actualización desde GitHub, antes de reiniciar la aplicación, Prisma se conecta a la base de datos de ese cliente específico y verifica la tabla interna `_prisma_migrations`.
5. **Aplicación Segura:** Prisma detecta qué migraciones son nuevas y **solo aplica esas alteraciones de esquema** sin eliminar ni afectar las filas de datos existentes.

## Beneficios de esta Estrategia

- **Cero cambios en el código actual:** No hay que añadir filtros de `companyId` a cada consulta del backend.
- **Escalabilidad segura:** Las migraciones de Prisma se encargan de evolucionar las bases de datos en paralelo.
- **Mantenimiento centralizado:** Un `git push` a `main` actualiza el software de todos los clientes a la vez.
- **Privacidad total:** Si un cliente decide darse de baja y pedir sus datos, simplemente se le exporta su base de datos aislada completa.
