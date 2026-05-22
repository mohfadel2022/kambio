# Kambio Design & Implementation Rules

## PDF Invoices (A4)
- **Format**: Must always fit on a single A4 page (`210mm x 297mm`).
- **Typography**: 
    - Use a unified font stack: `Inter` for Latin characters (Spanish, numbers) and `Cairo` for Arabic characters.
    - **Font Embedding**: For critical documents like PDF invoices, embed the `Cairo` font as a base64 string (stored in `src/lib/fonts.ts`) using `@font-face` to ensure reliable rendering in Puppeteer/Headless environments without network latency issues.
    - Implementation: `fontFamily: 'Inter, Cairo, sans-serif'`.
- **Financial Section**: 
    - Keep the "Amount From" and "Amount To" block compact.
    - Font sizes should be moderate (e.g., `text-3xl` for source, `text-4xl` for destination) to avoid pushing content to a second page.
- **Layout**: Use `flex flex-col h-[297mm]` with `overflow-hidden` to guarantee single-page output.

## Navigation & UX
- **Order Management**: After creating or updating an order, **always redirect to the order details page** (`/dashboard/orders/[id]`), never back to the list.
- **WhatsApp Sharing**: 
    - **Icon**: Always use the brand-specific WhatsApp SVG icon (defined in `DataTableActions.tsx`).
    - **Mobile UX**: Use the Web Share API (`navigator.share`) with file support on mobile devices. This allows the user to select WhatsApp and send the PDF as a direct attachment. **Do not trigger automatic downloads when sharing is possible** to avoid redundant actions.
    - **Desktop/Fallback**: If sharing is not supported, normalize the phone number, trigger a PDF download, and open the `wa.me` chat simultaneously.

## Data & Filtering
- **Faceted Filters**: Always implement faceted filters (using `DataTableFacetedFilter`) for key categories (e.g., Roles in Users, Document Status in Clients).
- **Internationalization (i18n)**: 
    - **MANDATORY**: Every new message, label, or error string MUST be localized in both `es.json` and `ar.json`.
    - Do not use hardcoded strings in components. Use `t()` or `common()` keys.
    - If a key is missing, add it to both locales immediately.

## Currency & Accounting
- **Exchange Rates (OTC)**: 
    - Rates for `BuyRate` and `SellRate` in the `Currency` model are interpreted as **"Units of Foreign Currency per 1 Primary Currency (EUR)"**.
    - Example: If 1 EUR = 250 DZD, then `sellRate` for DZD should be `250`.
    - This ensures consistency with the Tiered Rates (`rateUnder500`, etc.) which follow the same "Foreign/Primary" convention.
- **Prisma Serialization**: Ensure all decimal values are serialized or converted to numbers using the `serialize()` utility before passing them to client components.

## Technical Patterns
- **Server Actions**: Always handle potential errors and ensure a guaranteed return path (even if redirecting).
- **Prisma "Invalid Invocation" in Dev Mode (CRITICAL)**: 
    - **Cause**: When a Next.js page imports `prisma` directly, Turbopack's hot-reload can cause the Prisma query engine process to die while the stale global singleton is still cached. The next request then fails with `Invalid prisma.model.findX() invocation`.
    - **Fix**: **Never call `prisma` directly inside page components** (`page.tsx`). Instead, move all DB queries to dedicated **server action** functions (e.g., `getOrderForEdit`, `getExchangeForEdit` in `src/app/actions/`). Page components should only import and call these server actions.
    - **Pattern**:
        ```ts
        // ✅ CORRECT — in actions/orders.ts
        export async function getOrderForEdit(id: string) {
          const order = await prisma.order.findUnique({ where: { id } });
          return JSON.parse(JSON.stringify({ order }));
        }
        // ✅ CORRECT — in page.tsx
        import { getOrderForEdit } from "@/app/actions/orders";
        const { order } = await getOrderForEdit(id);

        // ❌ WRONG — in page.tsx
        import { prisma } from "@/lib/prisma";
        const order = await prisma.order.findUnique({ where: { id } });
        ```
    - **Serialization**: Always `JSON.parse(JSON.stringify(...))` data returned from server actions to convert Prisma `Decimal` and `Date` objects to plain JS values before sending to client components.
- **TypeScript Verification**: 
    - Always pay close attention to TypeScript types and compilation errors when refactoring or modifying data structures.
    - If a Prisma model changes (e.g. fields added or removed like `fee`, `walletId`), verify all downstream usages (types, props, state objects) to prevent build failures.
    - Run `npx prisma generate` proactively after any database schema change to ensure types are up to date before making code edits.
