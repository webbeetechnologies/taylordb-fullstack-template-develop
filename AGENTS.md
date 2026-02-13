# AI Agent Instructions for TaylorDB Full-Stack Template

This template is designed for AI agents to build **modern, type-safe, full-stack applications** using TaylorDB as the data source. This template provides a complete monorepo setup with a React frontend (Vite + shadcn/ui) and a Node.js backend (tRPC + TaylorDB query builder).

---

## 🎯 Your Mission

Build production-ready, modern web applications (primarily dashboards and CRUD interfaces) that:

- Are **fully type-safe** from database to UI
- Use TaylorDB as the single source of truth for data
- Have **stunning, modern UI/UX** that wows users
- Follow best practices in architecture and code organization

---

## 📋 Development Workflow

### **Phase 1: Understand Requirements & Design**

#### Step 1: Gather Requirements

Ask the user clarifying questions about:

- What data they want to work with (understand the domain)
- Key features and user workflows
- Target users and use cases
- Any specific UI/UX preferences

#### Step 2: Understand the Database Schema

**CRITICAL**: Always start by reading these files to understand the data model:

- `apps/server/taylordb/types.ts` - TypeScript types generated from TaylorDB schema
- `apps/server/taylordb/query-builder.ts` - Query builder patterns (review for examples)

> ⚠️ **IMPORTANT**: If these files don't exist, STOP and ask the user to generate them first. Never proceed with mock data.

#### Step 3: Design the Color Scheme & Visual Identity

Based on the requirements, decide on:

- **Primary color scheme** (use HSL values for flexibility)
- **Design aesthetic** (modern glassmorphism, gradients, minimalism, etc.)
- **Typography** (Google Fonts like Inter, Outfit, or Manrope)
- **Animation style** (subtle micro-interactions vs. bold animations)

Document your design decisions briefly before implementing.

---

### **Phase 2: Build the Foundation**

#### Step 1: Set Up Server-Side Data Layer

Use querybuilder which is in **File: `apps/server/taylordb/query-builder.ts`**

You can access the query builder from

```typescript
publicProcedure.input({}).query(({ input, ctx }) => {
  const queryBuilder = ctx.queryBuilder;
});
```

// ============================================================================
// READ Operations
// ============================================================================

/**
 * Get all records from a table
 */
export async function getAllItems() {
  return await queryBuilder
    .selectFrom("items")
    .select(["id", "name", "status", "createdAt"])
    .orderBy("createdAt", "desc")
    .execute();
}

/**
 * Get a single record by ID
 */
export async function getItemById(id: number) {
  return await queryBuilder
    .selectFrom("items")
    .where("id", "=", id)
    .executeTakeFirst();
}

// ============================================================================
// CREATE Operations
// ============================================================================

export async function createItem(data: { name: string; status: string }) {
  return await queryBuilder.insertInto("items").values(data).executeTakeFirst();
}

// ============================================================================
// UPDATE Operations
// ============================================================================

export async function updateItem(
  id: number,
  data: { name?: string; status?: string },
) {
  return await queryBuilder
    .update("items")
    .set(data)
    .where("id", "=", id)
    .execute();
}

// ============================================================================
// DELETE Operations
// ============================================================================

export async function deleteItem(id: number) {
  return await queryBuilder.deleteFrom("items").where("id", "=", id).execute();
}
```

**Query Builder Patterns:**

- **Filtering**: `.where("field", "=", value)`, `.where("date", ">=", ["exactDay", "2024-01-01"])`
- **Select specific fields**: `.select(["id", "name", "status"])`
- **Ordering**: `.orderBy("createdAt", "desc")`
- **Single record**: `.executeTakeFirst()`
- **Multiple records**: `.execute()`
- **Array fields**: Use `[value]` for single-select enums
- **Date filters**: Use `["exactDay", date]` format

Organize functions by domain (e.g., all user-related functions together).

#### Step 2: Create tRPC API Router

**File: `apps/server/router.ts`**

Expose your database functions as type-safe tRPC procedures:

```typescript
import { z } from "zod";
import { router, publicProcedure } from "./trpc";
import * as db from "./taylordb/query-builder";

export const appRouter = router({
  // Group by domain/feature
  items: {
    getAll: publicProcedure.query(async () => {
      return await db.getAllItems();
    }),

    getById: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return await db.getItemById(input.id);
      }),

    create: publicProcedure
      .input(
        z.object({
          name: z.string().min(1),
          status: z.string(),
        }),
      )
      .mutation(async ({ input }) => {
        return await db.createItem(input);
      }),

    update: publicProcedure
      .input(
        z.object({
          id: z.number(),
          name: z.string().optional(),
          status: z.string().optional(),
        }),
      )
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        return await db.updateItem(id, data);
      }),

    delete: publicProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        return await db.deleteItem(input.id);
      }),
  },
});

export type AppRouter = typeof appRouter;
```

**Organization:**

- Group related procedures (e.g., `items`, `users`, `projects`)
- Use Zod for input validation
- Queries for reads, mutations for writes
- Export `AppRouter` type for frontend

---

### **Phase 3: Build the Frontend**

#### Step 1: Update Design System

**File: `apps/client/src/index.css`**

Update the design tokens based on your chosen color scheme:

```css
@layer base {
  :root {
    /* Update these HSL values for your color scheme */
    --background: 0 0% 100%;
    --foreground: 222.2 84% 4.9%;
    --primary: 262 83% 58%; /* Example: Purple */
    --primary-foreground: 210 40% 98%;
    --accent: 262 90% 95%;
    --accent-foreground: 262 83% 58%;
    /* ... customize all tokens ... */
    --radius: 0.75rem; /* Border radius */
  }

  .dark {
    /* Dark mode colors */
    --background: 222.2 84% 4.9%;
    --foreground: 210 40% 98%;
    --primary: 263 70% 65%;
    /* ... */
  }
}
```

#### Step 2: Create shadcn/ui Components

**Always use shadcn/ui components**. Install components as needed:

```bash
pnpm dlx shadcn@latest add <component-name>
```

**Available by default:**

- `button`, `card`, `input`, `label`, `textarea`, `select`, `tabs`, `alert`

**Common additions for dashboards:**

- `table`, `dialog`, `dropdown-menu`, `toast`, `sheet`, `form`, `badge`, `avatar`, `skeleton`

Install with: `pnpm dlx shadcn@latest add table dialog dropdown-menu toast sheet form badge avatar skeleton`

#### Step 3: Build Page Components

**File: `apps/client/src/pages/DashboardPage.tsx`**

Create feature-rich, modern pages:

```typescript
import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { trpc } from "@/lib/trpc";
import { PlusIcon, Loader2 } from "lucide-react";

export default function DashboardPage() {
  const [name, setName] = useState("");

  const { data: items, isLoading, refetch } = trpc.items.getAll.useQuery();

  const createMutation = trpc.items.create.useMutation({
    onSuccess: () => {
      refetch();
      setName("");
    },
  });

  const deleteMutation = trpc.items.delete.useMutation({
    onSuccess: () => refetch(),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name) {
      createMutation.mutate({ name, status: "active" });
    }
  };

  return (
    <div className="container mx-auto p-8 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Dashboard</h1>
        <p className="text-muted-foreground">Manage your items</p>
      </div>

      <div className="grid gap-6">
        {/* Create Form */}
        <Card>
          <CardHeader>
            <CardTitle>Add New Item</CardTitle>
            <CardDescription>
              Create a new item in your database
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="flex gap-4">
              <div className="flex-1">
                <Label htmlFor="name">Item Name</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter item name..."
                  required
                />
              </div>
              <Button
                type="submit"
                disabled={createMutation.isPending}
                className="mt-auto"
              >
                {createMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Adding...
                  </>
                ) : (
                  <>
                    <PlusIcon className="mr-2 h-4 w-4" />
                    Add Item
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Items List */}
        <Card>
          <CardHeader>
            <CardTitle>Your Items</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading && (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            )}

            {items && items.length === 0 && (
              <p className="text-center text-muted-foreground py-8">
                No items yet. Create your first item above.
              </p>
            )}

            <div className="space-y-3">
              {items?.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent transition-colors"
                >
                  <div>
                    <p className="font-medium">{item.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {item.status}
                    </p>
                  </div>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() =>
                      item.id && deleteMutation.mutate({ id: item.id })
                    }
                    disabled={deleteMutation.isPending}
                  >
                    Delete
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
```

#### Step 4: Update Routing

**File: `apps/client/src/main.tsx`**

Add your new pages to the router:

```typescript
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import App from "./App";
import HomePage from "./pages/HomePage";
import DashboardPage from "./pages/DashboardPage";

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      { index: true, element: <HomePage /> },
      { path: "dashboard", element: <DashboardPage /> },
    ],
  },
]);
```

**File: `apps/client/src/App.tsx`**

Update navigation:

```typescript
const navItems = [
  { to: "/", label: "Home" },
  { to: "/dashboard", label: "Dashboard" },
];
```

---

### **Phase 4: Polish & Validate**

#### Step 1: Run Type Checking

**ALWAYS run this before considering your work complete:**

```bash
pnpm build
```

Fix all TypeScript errors. Never use `any` unless absolutely necessary.

#### Step 2: Run Linter

```bash
pnpm lint
```

Fix all linting errors.

#### Step 3: Test in Browser

The dev server should be running. Test:

- All CRUD operations work correctly
- Data updates in real-time
- Error states display properly
- Loading states show appropriate feedback
- UI is responsive and looks great

---

## 🎨 Design Guidelines

### Visual Excellence Principles

1. **No Generic Colors**: Never use plain red/blue/green. Use curated HSL palettes.
   - ✅ `hsl(262 83% 58%)` (vibrant purple)
   - ❌ `#0000ff` (plain blue)

2. **Premium Aesthetics**: Make it feel high-end
   - Use subtle gradients, shadows, and glassmorphism
   - Add smooth transitions (`transition-all duration-200`)
   - Implement hover states on interactive elements
   - Use proper spacing and visual hierarchy

3. **Modern Typography**:
   - Import Google Fonts (e.g., Inter, Outfit, Manrope)
   - Use varied font weights (400, 500, 600, 700)
   - Proper text sizing hierarchy

4. **Micro-Animations**:
   - Loading spinners with `lucide-react` icons + `animate-spin`
   - Fade-ins on data load
   - Smooth transitions on hover
   - Button press feedback

5. **Dashboard-First Design**:
   - Card-based layouts
   - Clear visual grouping
   - Stats/metrics prominently displayed
   - Intuitive navigation

### Component Structure

**Always follow this pattern:**

```typescript
// 1. Imports (external, then internal)
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";

// 2. Type definitions (if needed)
interface ItemFormProps {
  onSuccess: () => void;
}

// 3. Component (arrow function)
export default function ItemForm({ onSuccess }: ItemFormProps) {
  // 4. State & hooks
  const [name, setName] = useState("");
  const createMutation = trpc.items.create.useMutation({ onSuccess });

  // 5. Event handlers
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate({ name });
  };

  // 6. Render
  return <form onSubmit={handleSubmit}>{/* ... */}</form>;
}
```

---

## 📁 File Organization Best Practices

### Backend Structure

```
apps/server/
├── taylordb/
│   ├── types.ts              # Generated types (DO NOT EDIT)
│   └── query-builder.ts      # All database operations
├── router.ts                 # tRPC API routes
├── trpc.ts                   # tRPC configuration
└── index.ts                  # Server entry point
```

### Frontend Structure

```
apps/client/src/
├── components/
│   ├── ui/                   # shadcn/ui components (auto-generated)
│   └── [custom]/             # Your custom components
├── pages/
│   └── [PageName].tsx        # Route pages
├── lib/
│   ├── trpc.ts               # tRPC client setup
│   └── utils.ts              # Utilities (cn helper, etc.)
├── App.tsx                   # Layout + navigation
├── main.tsx                  # Router + app initialization
└── index.css                 # Global styles + design tokens
```

### Where to Put What

| What                   | Where                                        |
| ---------------------- | -------------------------------------------- |
| Database queries       | `apps/server/taylordb/query-builder.ts`      |
| API endpoints          | `apps/server/router.ts`                      |
| Route pages            | `apps/client/src/pages/`                     |
| Reusable UI components | `apps/client/src/components/`                |
| shadcn/ui components   | `apps/client/src/components/ui/` (auto)      |
| Design tokens          | `apps/client/src/index.css`                  |
| TypeScript types       | Use generated types from `taylordb/types.ts` |

---

## 🔧 TaylorDB Query Builder Reference

### Common Query Patterns

```typescript
// SELECT with specific fields
queryBuilder
  .selectFrom("tableName")
  .select(["id", "name", "status"])
  .execute();

// WHERE conditions
.where("status", "=", "active")
.where("createdAt", ">=", ["exactDay", "2024-01-01"])
.where("tags", "hasAnyOf", ["tag1", "tag2"])

// ORDER BY
.orderBy("createdAt", "desc")
.orderBy("name", "asc")

// INSERT
queryBuilder
  .insertInto("tableName")
  .values({ name: "John", status: "active" })
  .executeTakeFirst();

// UPDATE
queryBuilder
  .update("tableName")
  .set({ status: "inactive" })
  .where("id", "=", 123)
  .execute();

// DELETE
queryBuilder
  .deleteFrom("tableName")
  .where("id", "=", 123)
  .execute();

// DELETE multiple
queryBuilder
  .deleteFrom("tableName")
  .where("id", "hasAnyOf", [1, 2, 3])
  .execute();
```

### Field Type Handling

| TaylorDB Field Type | TypeScript Type | Query Value Format           |
| ------------------- | --------------- | ---------------------------- |
| Text                | `string`        | `"value"`                    |
| Number              | `number`        | `42`                         |
| Date                | `string`        | `["exactDay", "2024-01-01"]` |
| Single Select       | `string[]`      | `["option"]`                 |
| Multi Select        | `string[]`      | `["opt1", "opt2"]`           |
| Checkbox            | `boolean`       | `true` / `false`             |

---

## ✅ Code Style Guidelines

### TypeScript

- **Never use `any`**. Use proper types from `taylordb/types.ts`
- Strict null checks: handle `null` and `undefined` explicitly
- Use type inference where obvious, explicit types for function params/returns

### Naming Conventions

- **Variables/Functions**: `camelCase` (e.g., `getUserData`)
- **Components**: `PascalCase` (e.g., `DashboardPage`)
- **Constants**: `UPPER_CASE` (e.g., `MAX_ITEMS`)
- **Files**: Match component name (e.g., `DashboardPage.tsx`)

### Imports

- Group external imports first, then internal
- Use path aliases: `@/components/...` not `../../components/...`

### Components

- Use arrow functions: `const MyComponent = () => { ... }`
- Props typing: `interface MyComponentProps { ... }`
- Keep components focused (single responsibility)

### Error Handling

- Display error states in UI
- Use tRPC's built-in error handling
- Show user-friendly messages

### Comments

- Use JSDoc for functions: `/** Description */`
- Explain "why", not "what"
- Remove commented-out code

---

## 🎓 Example: Building a Task Manager Dashboard

**User Request**: "Build a task manager with projects and tasks"

### 1. Analyze Schema

Assume TaylorDB has:

- `projects` table: `id`, `name`, `description`, `status`
- `tasks` table: `id`, `title`, `projectId`, `status`, `dueDate`

### 2. Design Decision

- **Color**: Gradient purple/blue theme
- **Style**: Modern with glassmorphism cards
- **Layout**: Projects on left sidebar, tasks on right

### 3. Backend (`apps/server/taylordb/query-builder.ts`)

```typescript
export async function getAllProjects() {
  return await queryBuilder
    .selectFrom("projects")
    .select(["id", "name", "description", "status"])
    .execute();
}

export async function getTasksByProject(projectId: number) {
  return await queryBuilder
    .selectFrom("tasks")
    .where("projectId", "=", projectId)
    .orderBy("dueDate", "asc")
    .execute();
}
```

### 4. API (`apps/server/router.ts`)

```typescript
export const appRouter = router({
  projects: {
    getAll: publicProcedure.query(() => db.getAllProjects()),
  },
  tasks: {
    getByProject: publicProcedure
      .input(z.object({ projectId: z.number() }))
      .query(({ input }) => db.getTasksByProject(input.projectId)),
  },
});
```

### 5. Frontend (`apps/client/src/pages/TasksPage.tsx`)

Build the UI with cards, proper loading states, and type-safe tRPC calls.

---

## ⚠️ Critical Rules

1. **NEVER use mock data.** Always connect to real TaylorDB.
2. **NEVER ignore TypeScript errors.** Fix them before moving on.
3. **ALWAYS use shadcn/ui components** instead of hand-rolling UI.
4. **NEVER modify generated types** in `taylordb/types.ts`.
5. **ALWAYS run `pnpm build`** to validate your work.
6. **Design must be modern and premium**, not basic MVP.

---

## 🎯 Success Criteria

Your implementation is successful when:

- ✅ All TypeScript errors are resolved (`pnpm build` passes)
- ✅ All lint errors are fixed (`pnpm lint` passes)
- ✅ UI looks modern and premium (not basic/generic)
- ✅ All CRUD operations work correctly with TaylorDB
- ✅ Loading and error states are handled gracefully
- ✅ Code is well-organized and follows best practices
- ✅ Type safety is maintained from database to UI

---

**Remember**: You're building production-quality applications that should impress users from the first glance. Focus on visual excellence, type safety, and solid architecture.
