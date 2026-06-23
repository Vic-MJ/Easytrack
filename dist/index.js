var __defProp = Object.defineProperty;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// shared/schema.ts
var schema_exports = {};
__export(schema_exports, {
  adminPasswords: () => adminPasswords,
  adminPasswordsRelations: () => adminPasswordsRelations,
  agendaEvents: () => agendaEvents,
  areaEnum: () => areaEnum,
  areas: () => areas,
  documents: () => documents,
  insertAdminPasswordSchema: () => insertAdminPasswordSchema,
  insertAgendaEventSchema: () => insertAgendaEventSchema,
  insertNotificationSchema: () => insertNotificationSchema,
  insertRepositionPieceSchema: () => insertRepositionPieceSchema,
  insertRepositionSchema: () => insertRepositionSchema,
  insertRepositionTransferSchema: () => insertRepositionTransferSchema,
  insertUserSchema: () => insertUserSchema,
  materialStatusEnum: () => materialStatusEnum,
  notificationTypeEnum: () => notificationTypeEnum,
  notifications: () => notifications,
  notificationsRelations: () => notificationsRelations,
  repositionContrastFabrics: () => repositionContrastFabrics,
  repositionHistory: () => repositionHistory,
  repositionHistoryRelations: () => repositionHistoryRelations,
  repositionMaterials: () => repositionMaterials,
  repositionMaterialsRelations: () => repositionMaterialsRelations,
  repositionPieces: () => repositionPieces,
  repositionPiecesRelations: () => repositionPiecesRelations,
  repositionProducts: () => repositionProducts,
  repositionStatusEnum: () => repositionStatusEnum,
  repositionTimers: () => repositionTimers,
  repositionTransfers: () => repositionTransfers,
  repositionTransfersRelations: () => repositionTransfersRelations,
  repositionTypeEnum: () => repositionTypeEnum,
  repositions: () => repositions,
  repositionsRelations: () => repositionsRelations,
  systemSettings: () => systemSettings,
  transferStatusEnum: () => transferStatusEnum,
  urgencyEnum: () => urgencyEnum,
  users: () => users,
  usersRelations: () => usersRelations
});
import { pgTable, text, serial, integer, boolean, timestamp, pgEnum, varchar, real } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
var areaEnum, repositionTypeEnum, urgencyEnum, repositionStatusEnum, transferStatusEnum, notificationTypeEnum, materialStatusEnum, users, notifications, repositions, repositionPieces, repositionProducts, repositionContrastFabrics, repositionTimers, repositionTransfers, repositionHistory, adminPasswords, repositionMaterials, documents, systemSettings, usersRelations, repositionsRelations, repositionPiecesRelations, repositionTransfersRelations, repositionHistoryRelations, adminPasswordsRelations, repositionMaterialsRelations, notificationsRelations, insertUserSchema, insertNotificationSchema, insertRepositionSchema, insertRepositionPieceSchema, insertRepositionTransferSchema, insertAdminPasswordSchema, agendaEvents, insertAgendaEventSchema, areas;
var init_schema = __esm({
  "shared/schema.ts"() {
    "use strict";
    areaEnum = pgEnum("area", ["patronaje", "corte", "bordado", "ensamble", "plancha", "calidad", "operaciones", "admin", "almacen", "dise\xF1o", "envios", "maquilas"]);
    repositionTypeEnum = pgEnum("reposition_type", ["reposici\xF3n", "reproceso"]);
    urgencyEnum = pgEnum("urgency", ["urgente", "intermedio", "poco_urgente"]);
    repositionStatusEnum = pgEnum("reposition_status", ["pendiente", "aprobado", "rechazado", "completado", "eliminado", "cancelado"]);
    transferStatusEnum = pgEnum("transfer_status", ["pending", "accepted", "rejected"]);
    notificationTypeEnum = pgEnum("notification_type", [
      "transfer_request",
      "transfer_accepted",
      "transfer_rejected",
      "order_completed",
      "new_reposition",
      "reposition_transfer",
      "reposition_approved",
      "reposition_rejected",
      "reposition_completed",
      "reposition_deleted",
      "reposition_canceled",
      "reposition_paused",
      "reposition_resumed",
      "reposition_received",
      "transfer_processed",
      "completion_approval_needed",
      "partial_transfer_warning",
      "reposition_reactivated"
    ]);
    materialStatusEnum = pgEnum("material_status", ["disponible", "falta_parcial", "no_disponible"]);
    users = pgTable("users", {
      id: serial("id").primaryKey(),
      username: text("username").notNull().unique(),
      password: text("password").notNull(),
      name: text("name").notNull(),
      area: areaEnum("area").notNull(),
      isActive: boolean("is_active").notNull().default(true),
      createdAt: timestamp("created_at").defaultNow().notNull()
    });
    notifications = pgTable("notifications", {
      id: serial("id").primaryKey(),
      userId: integer("user_id").notNull(),
      type: notificationTypeEnum("type").notNull(),
      title: text("title").notNull(),
      message: text("message").notNull(),
      repositionId: integer("reposition_id"),
      read: boolean("read").notNull().default(false),
      createdAt: timestamp("created_at").defaultNow().notNull()
    });
    repositions = pgTable("repositions", {
      id: serial("id").primaryKey(),
      folio: text("folio").notNull().unique(),
      type: repositionTypeEnum("type").notNull(),
      solicitanteNombre: text("solicitante_nombre").notNull(),
      solicitanteArea: areaEnum("solicitante_area").notNull(),
      fechaSolicitud: timestamp("fecha_solicitud").defaultNow().notNull(),
      noSolicitud: text("no_solicitud").notNull(),
      noHoja: text("no_hoja"),
      fechaCorte: text("fecha_corte"),
      causanteDano: text("causante_dano").notNull(),
      tipoAccidente: text("tipo_accidente").notNull(),
      otroAccidente: text("otro_accidente"),
      areaCausanteDano: text("area_causante_dano"),
      descripcionSuceso: text("descripcion_suceso").notNull(),
      modeloPrenda: text("modelo_prenda").notNull(),
      tela: text("tela").notNull(),
      color: text("color").notNull(),
      tipoPieza: text("tipo_pieza").notNull(),
      consumoTela: real("consumo_tela"),
      urgencia: urgencyEnum("urgencia").notNull(),
      observaciones: text("observaciones"),
      volverHacer: text("volver_hacer"),
      materialesImplicados: text("materiales_implicados"),
      currentArea: areaEnum("current_area").notNull(),
      status: repositionStatusEnum("status").notNull().default("pendiente"),
      createdBy: integer("created_by").notNull(),
      approvedBy: integer("approved_by"),
      createdAt: timestamp("created_at").defaultNow().notNull(),
      approvedAt: timestamp("approved_at"),
      completedAt: timestamp("completed_at"),
      rejectionReason: text("rejection_reason")
    });
    repositionPieces = pgTable("reposition_pieces", {
      id: serial("id").primaryKey(),
      repositionId: integer("reposition_id").notNull(),
      repositionProductId: integer("reposition_product_id"),
      // Link to specific product
      talla: text("talla").notNull(),
      cantidad: integer("cantidad").notNull(),
      unit: varchar("unit", { length: 20 }).default("piezas"),
      // 'piezas' | 'pares'
      folioOriginal: text("folio_original"),
      createdAt: timestamp("created_at").defaultNow().notNull()
    });
    repositionProducts = pgTable("reposition_products", {
      id: serial("id").primaryKey(),
      repositionId: integer("reposition_id").notNull(),
      modeloPrenda: text("modelo_prenda").notNull(),
      tela: text("tela").notNull(),
      color: text("color").notNull(),
      tipoPieza: text("tipo_pieza").notNull(),
      consumoTela: real("consumo_tela"),
      createdAt: timestamp("created_at").defaultNow().notNull()
    });
    repositionContrastFabrics = pgTable("reposition_contrast_fabrics", {
      id: serial("id").primaryKey(),
      repositionId: integer("reposition_id").notNull(),
      ubicacion: text("ubicacion").notNull().default(""),
      tela: text("tela").notNull(),
      color: text("color").notNull(),
      consumo: real("consumo").notNull(),
      createdAt: timestamp("created_at").defaultNow().notNull()
    });
    repositionTimers = pgTable("reposition_timers", {
      id: serial("id").primaryKey(),
      repositionId: integer("reposition_id").notNull(),
      area: areaEnum("area").notNull(),
      userId: integer("user_id").notNull(),
      startTime: timestamp("start_time"),
      endTime: timestamp("end_time"),
      elapsedMinutes: real("elapsed_minutes"),
      isRunning: boolean("is_running").default(false),
      manualStartTime: varchar("manual_start_time", { length: 5 }),
      // HH:MM format
      manualEndTime: varchar("manual_end_time", { length: 5 }),
      // HH:MM format
      manualDate: varchar("manual_date", { length: 10 }),
      // YYYY-MM-DD format
      createdAt: timestamp("created_at").defaultNow().notNull()
    });
    repositionTransfers = pgTable("reposition_transfers", {
      id: serial("id").primaryKey(),
      repositionId: integer("reposition_id").notNull(),
      fromArea: areaEnum("from_area").notNull(),
      toArea: areaEnum("to_area").notNull(),
      notes: text("notes"),
      createdBy: integer("created_by").notNull(),
      processedBy: integer("processed_by"),
      status: transferStatusEnum("status").notNull().default("pending"),
      createdAt: timestamp("created_at").defaultNow().notNull(),
      processedAt: timestamp("processed_at")
    });
    repositionHistory = pgTable("reposition_history", {
      id: serial("id").primaryKey(),
      repositionId: integer("reposition_id").notNull(),
      action: text("action").notNull(),
      description: text("description").notNull(),
      fromArea: areaEnum("from_area"),
      toArea: areaEnum("to_area"),
      userId: integer("user_id").notNull(),
      createdAt: timestamp("created_at").defaultNow().notNull()
    });
    adminPasswords = pgTable("admin_passwords", {
      id: serial("id").primaryKey(),
      password: text("password").notNull(),
      createdBy: integer("created_by").notNull(),
      isActive: boolean("is_active").notNull().default(true),
      createdAt: timestamp("created_at").defaultNow().notNull()
    });
    repositionMaterials = pgTable("reposition_materials", {
      id: serial("id").primaryKey(),
      repositionId: integer("reposition_id").notNull(),
      materialStatus: materialStatusEnum("material_status").notNull().default("disponible"),
      missingMaterials: text("missing_materials"),
      notes: text("notes"),
      isPaused: boolean("is_paused").notNull().default(false),
      pauseReason: text("pause_reason"),
      pausedBy: integer("paused_by"),
      pausedAt: timestamp("paused_at"),
      resumedBy: integer("resumed_by"),
      resumedAt: timestamp("resumed_at"),
      createdAt: timestamp("created_at").defaultNow().notNull(),
      updatedAt: timestamp("updated_at").defaultNow().notNull()
    });
    documents = pgTable("documents", {
      id: serial("id").primaryKey(),
      filename: text("filename").notNull(),
      originalName: text("original_name").notNull(),
      size: integer("size").notNull(),
      path: text("path").notNull(),
      repositionId: integer("reposition_id"),
      uploadedBy: integer("uploaded_by").notNull(),
      createdAt: timestamp("created_at").defaultNow().notNull()
    });
    systemSettings = pgTable("system_settings", {
      key: text("key").primaryKey(),
      value: text("value").notNull(),
      updatedBy: integer("updated_by"),
      updatedAt: timestamp("updated_at").defaultNow().notNull()
    });
    usersRelations = relations(users, ({ many }) => ({
      notifications: many(notifications),
      createdRepositions: many(repositions, { relationName: "creator" }),
      approvedRepositions: many(repositions, { relationName: "approver" }),
      repositionTransfers: many(repositionTransfers, { relationName: "transferCreator" }),
      repositionHistory: many(repositionHistory),
      adminPasswords: many(adminPasswords)
    }));
    repositionsRelations = relations(repositions, ({ one, many }) => ({
      creator: one(users, {
        fields: [repositions.createdBy],
        references: [users.id],
        relationName: "creator"
      }),
      approver: one(users, {
        fields: [repositions.approvedBy],
        references: [users.id],
        relationName: "approver"
      }),
      pieces: many(repositionPieces),
      transfers: many(repositionTransfers),
      history: many(repositionHistory)
    }));
    repositionPiecesRelations = relations(repositionPieces, ({ one }) => ({
      reposition: one(repositions, {
        fields: [repositionPieces.repositionId],
        references: [repositions.id]
      })
    }));
    repositionTransfersRelations = relations(repositionTransfers, ({ one }) => ({
      reposition: one(repositions, {
        fields: [repositionTransfers.repositionId],
        references: [repositions.id]
      }),
      creator: one(users, {
        fields: [repositionTransfers.createdBy],
        references: [users.id],
        relationName: "transferCreator"
      }),
      processor: one(users, {
        fields: [repositionTransfers.processedBy],
        references: [users.id],
        relationName: "transferProcessor"
      })
    }));
    repositionHistoryRelations = relations(repositionHistory, ({ one }) => ({
      reposition: one(repositions, {
        fields: [repositionHistory.repositionId],
        references: [repositions.id]
      }),
      user: one(users, {
        fields: [repositionHistory.userId],
        references: [users.id]
      })
    }));
    adminPasswordsRelations = relations(adminPasswords, ({ one }) => ({
      creator: one(users, {
        fields: [adminPasswords.createdBy],
        references: [users.id]
      })
    }));
    repositionMaterialsRelations = relations(repositionMaterials, ({ one }) => ({
      reposition: one(repositions, {
        fields: [repositionMaterials.repositionId],
        references: [repositions.id]
      }),
      pausedByUser: one(users, {
        fields: [repositionMaterials.pausedBy],
        references: [users.id]
      }),
      resumedByUser: one(users, {
        fields: [repositionMaterials.resumedBy],
        references: [users.id]
      })
    }));
    notificationsRelations = relations(notifications, ({ one }) => ({
      user: one(users, {
        fields: [notifications.userId],
        references: [users.id]
      })
    }));
    insertUserSchema = createInsertSchema(users).pick({
      username: true,
      password: true,
      name: true,
      area: true
    });
    insertNotificationSchema = createInsertSchema(notifications).omit({
      id: true,
      read: true,
      createdAt: true
    });
    insertRepositionSchema = createInsertSchema(repositions).omit({
      id: true,
      folio: true,
      createdBy: true,
      approvedBy: true,
      createdAt: true,
      approvedAt: true,
      completedAt: true
    });
    insertRepositionPieceSchema = createInsertSchema(repositionPieces).omit({
      id: true,
      createdAt: true
    });
    insertRepositionTransferSchema = createInsertSchema(repositionTransfers).omit({
      id: true,
      status: true,
      createdBy: true,
      processedBy: true,
      createdAt: true,
      processedAt: true
    });
    insertAdminPasswordSchema = createInsertSchema(adminPasswords).omit({
      id: true,
      createdBy: true,
      createdAt: true
    });
    agendaEvents = pgTable("agenda_events", {
      id: serial("id").primaryKey(),
      createdBy: integer("created_by").notNull().references(() => users.id),
      // Quién creó la tarea (Admin/Envíos)
      assignedToArea: areaEnum("assigned_to_area").notNull(),
      // Área a la que se asigna la tarea
      title: varchar("title", { length: 255 }).notNull(),
      description: text("description"),
      date: varchar("date", { length: 10 }).notNull(),
      // YYYY-MM-DD format
      time: varchar("time", { length: 5 }).notNull(),
      // HH:MM format
      priority: varchar("priority", { length: 10 }).notNull().default("media"),
      // alta, media, baja
      status: varchar("status", { length: 15 }).notNull().default("pendiente"),
      // pendiente, completado, cancelado
      createdAt: timestamp("created_at").defaultNow(),
      updatedAt: timestamp("updated_at").defaultNow()
    });
    insertAgendaEventSchema = createInsertSchema(agendaEvents);
    areas = ["patronaje", "corte", "bordado", "ensamble", "plancha", "calidad", "operaciones", "envios", "almacen", "admin", "dise\xF1o", "maquilas"];
  }
});

// server/db.ts
import pg from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
var Pool, connectionString, pool, db;
var init_db = __esm({
  "server/db.ts"() {
    "use strict";
    init_schema();
    ({ Pool } = pg);
    connectionString = process.env.DATABASE_URL || "postgresql://postgres:12345@localhost:5432/jasanaordenes";
    if (!connectionString) {
      throw new Error(
        "DATABASE_URL must be set. Did you forget to provision a database?"
      );
    }
    pool = new Pool({
      connectionString,
      ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false,
      // Para Render, siempre usar SSL si está en la URL externa
      ...connectionString.includes("render.com") && {
        ssl: { rejectUnauthorized: false }
      }
    });
    db = drizzle({ client: pool, schema: schema_exports });
  }
});

// server/storage.ts
import { eq, desc, and, or, ne, isNotNull, isNull, gte, lte, sql, asc } from "drizzle-orm";
import ExcelJS from "exceljs";
import session from "express-session";
import connectPg from "connect-pg-simple";
function broadcastNotification(notification) {
  const wss = global.wss;
  if (wss) {
    wss.clients.forEach((client) => {
      if (client.readyState === 1) {
        client.send(JSON.stringify({
          type: "notification",
          data: notification
        }));
      }
    });
    console.log("Notificaci\xF3n enviada por WebSocket:", notification.title);
  } else {
    console.log("WebSocket no disponible para enviar notificaci\xF3n");
  }
}
var PostgresSessionStore, DatabaseStorage, storage;
var init_storage = __esm({
  "server/storage.ts"() {
    "use strict";
    init_schema();
    init_db();
    init_db();
    PostgresSessionStore = connectPg(session);
    DatabaseStorage = class {
      async getAllUsers() {
        return await db.select().from(users).orderBy(asc(users.id));
      }
      async deleteUserById(userId) {
        const result = await db.delete(users).where(eq(users.id, Number(userId))).returning().catch(() => []);
        return result.length > 0;
      }
      sessionStore;
      constructor() {
        this.sessionStore = new PostgresSessionStore({
          pool,
          createTableIfMissing: true
        });
      }
      async getUser(id) {
        const [user] = await db.select().from(users).where(eq(users.id, id));
        if (user) {
          console.log(`[STORAGE] Fetched user ${id}:`, { username: user.username, isActive: user.isActive });
        }
        return user || void 0;
      }
      async getUserByUsername(username) {
        const [user] = await db.select().from(users).where(eq(users.username, username));
        if (user) {
          console.log(`[STORAGE] Fetched user by username ${username}:`, { id: user.id, isActive: user.isActive });
        }
        return user || void 0;
      }
      async createUser(insertUser) {
        const [user] = await db.insert(users).values(insertUser).returning();
        return user;
      }
      async getAdminUser() {
        const adminUsers = await db.select().from(users).where(eq(users.area, "admin")).limit(1);
        return adminUsers[0] || void 0;
      }
      async getAllAdminUsers() {
        return await db.select().from(users).where(eq(users.area, "admin"));
      }
      async resetUserPassword(userId, hashedPassword) {
        await db.update(users).set({ password: hashedPassword }).where(eq(users.id, userId));
      }
      async createNotification(notification) {
        let newNotification;
        try {
          [newNotification] = await db.insert(notifications).values(notification).returning();
        } catch (error) {
          if (error.code === "23505" && error.constraint === "notifications_pkey") {
            console.log("Detectado error de secuencia en ID de notificaciones. Intentando corregir...");
            await db.execute(sql`SELECT setval('notifications_id_seq', (SELECT MAX(id) FROM notifications))`);
            console.log("Secuencia de notificaciones corregida. Reintentando inserci\xF3n...");
            [newNotification] = await db.insert(notifications).values(notification).returning();
          } else {
            throw error;
          }
        }
        broadcastNotification({
          ...newNotification,
          userId: newNotification.userId
        });
        return newNotification;
      }
      async getUserNotifications(userId) {
        const userNotifications = await db.select().from(notifications).where(eq(notifications.userId, userId)).orderBy(desc(notifications.createdAt));
        console.log(`getUserNotifications: Found ${userNotifications.length} notifications for user ${userId}`);
        return userNotifications;
      }
      async markNotificationRead(notificationId) {
        await db.update(notifications).set({ read: true }).where(eq(notifications.id, notificationId));
      }
      async clearAllUserNotifications(userId) {
        await db.update(notifications).set({ read: true }).where(eq(notifications.userId, userId));
      }
      async getRepositions(area, userArea) {
        console.log(`Getting repositions for area: ${area}, userArea: ${userArea}`);
        let query = db.select().from(repositions);
        if (userArea === "dise\xF1o") {
          query = query.where(
            and(
              eq(repositions.status, "aprobado"),
              ne(repositions.status, "eliminado")
            )
          );
          console.log("Applied dise\xF1o filter: aprobado status only");
        } else if (userArea !== "admin" && userArea !== "envios") {
          query = query.where(
            and(
              ne(repositions.status, "eliminado"),
              ne(repositions.status, "completado"),
              ne(repositions.status, "cancelado")
            )
          );
          console.log("Applied non-admin filter: excluding eliminated, completed, and cancelled");
        } else {
          console.log("No status filters applied (admin/envios area)");
        }
        const results = await query.orderBy(desc(repositions.createdAt));
        console.log(`Found ${results.length} repositions for user area ${userArea}`);
        if (results.length > 0) {
          console.log("Sample results:", results.slice(0, 3).map((r) => ({
            folio: r.folio,
            status: r.status,
            type: r.type
          })));
        }
        return results;
      }
      async getRepositionsByArea(area, userId) {
        let whereCondition;
        const excludeStatuses = area === "admin" || area === "envios" ? [ne(repositions.status, "eliminado")] : [
          ne(repositions.status, "eliminado"),
          ne(repositions.status, "completado"),
          ne(repositions.status, "cancelado")
        ];
        if (userId) {
          whereCondition = and(
            or(
              eq(repositions.currentArea, area),
              eq(repositions.createdBy, userId)
            ),
            ...excludeStatuses
          );
        } else {
          whereCondition = and(
            eq(repositions.currentArea, area),
            ...excludeStatuses
          );
        }
        return await db.select().from(repositions).where(whereCondition).orderBy(desc(repositions.createdAt));
      }
      async getRepositionById(id) {
        const [reposition] = await db.select().from(repositions).where(eq(repositions.id, id));
        return reposition || void 0;
      }
      async getNextRepositionCounter() {
        const now = /* @__PURE__ */ new Date();
        const year = now.getFullYear();
        const month = now.getMonth() + 1;
        const yearStr = year.toString();
        const monthStr = String(month).padStart(2, "0");
        const monthYear = `${monthStr}-${yearStr.slice(-2)}`;
        await db.execute(sql`
      INSERT INTO reposition_folio_counters (month_year, current_value)
      VALUES (${monthYear}, 0)
      ON CONFLICT (month_year) DO NOTHING
    `);
        const result = await db.execute(sql`
      UPDATE reposition_folio_counters
      SET current_value = current_value + 1
      WHERE month_year = ${monthYear}
      RETURNING current_value
    `);
        if (result.rows.length > 0) {
          return result.rows[0].current_value;
        }
        return 1;
      }
      async approveReposition(repositionId, action, userId, notes) {
        const [reposition] = await db.update(repositions).set({
          status: action,
          approvedBy: userId,
          approvedAt: /* @__PURE__ */ new Date(),
          rejectionReason: action === "rechazado" ? notes : null
          // NO cambiar área automáticamente, mantener en área actual
        }).where(eq(repositions.id, repositionId)).returning();
        await this.addRepositionHistory(
          repositionId,
          action === "aprobado" ? "approved" : "rejected",
          `Reposici\xF3n ${action === "aprobado" ? "aprobada" : "rechazada"}${notes ? `: ${notes}` : ""}`,
          userId
        );
        await this.createNotification({
          userId: reposition.createdBy,
          type: action === "aprobado" ? "reposition_approved" : "reposition_rejected",
          title: action === "aprobado" ? "Reposici\xF3n Aprobada" : "Reposici\xF3n Rechazada",
          message: `Tu reposici\xF3n ${reposition.folio} ha sido ${action === "aprobado" ? "aprobada" : "rechazada"}${notes ? `: ${notes}` : ""}`,
          repositionId
        });
        return reposition;
      }
      async createRepositionTransfer(transfer, createdBy) {
        const [repositionTransfer] = await db.insert(repositionTransfers).values({
          ...transfer,
          createdBy,
          createdAt: /* @__PURE__ */ new Date()
        }).returning();
        await this.addRepositionHistory(
          transfer.repositionId,
          "transfer_requested",
          `Transfer requested from ${transfer.fromArea} to ${transfer.toArea}`,
          createdBy,
          transfer.fromArea,
          transfer.toArea
        );
        const reposition = await this.getRepositionById(transfer.repositionId);
        const targetAreaUsers = await db.select().from(users).where(eq(users.area, transfer.toArea));
        for (const user of targetAreaUsers) {
          await this.createNotification({
            userId: user.id,
            type: "reposition_transfer",
            title: "Nueva Transferencia de Reposici\xF3n",
            message: `Se ha solicitado transferir la reposici\xF3n ${reposition?.folio} de ${transfer.fromArea} a ${transfer.toArea}`,
            repositionId: transfer.repositionId
          });
        }
        return repositionTransfer;
      }
      async processRepositionTransfer(transferId, action, userId, reason) {
        const updateData = {
          status: action,
          processedBy: userId,
          processedAt: /* @__PURE__ */ new Date()
        };
        if (action === "rejected" && reason) {
          updateData.notes = reason;
        }
        const [transfer] = await db.update(repositionTransfers).set(updateData).where(eq(repositionTransfers.id, transferId)).returning();
        if (action === "accepted") {
          await db.update(repositions).set({ currentArea: transfer.toArea }).where(eq(repositions.id, transfer.repositionId));
        }
        const historyDescription = action === "accepted" ? `Transfer ${action} from ${transfer.fromArea} to ${transfer.toArea}` : `Transfer ${action} from ${transfer.fromArea} to ${transfer.toArea}${reason ? ` - Motivo: ${reason}` : ""}`;
        await this.addRepositionHistory(
          transfer.repositionId,
          `transfer_${action}`,
          historyDescription,
          userId,
          transfer.fromArea,
          transfer.toArea
        );
        const reposition = await this.getRepositionById(transfer.repositionId);
        await this.createNotification({
          userId: transfer.createdBy,
          type: "transfer_processed",
          title: `Transferencia ${action === "accepted" ? "Aceptada" : "Rechazada"}`,
          message: `La transferencia de la reposici\xF3n ${reposition?.folio} ha sido ${action === "accepted" ? "aceptada" : "rechazada"}`,
          repositionId: transfer.repositionId
        });
        if (action === "rejected") {
          const originAreaUsers = await db.select().from(users).where(eq(users.area, transfer.fromArea));
          for (const user of originAreaUsers) {
            if (user.id !== transfer.createdBy) {
              await this.createNotification({
                userId: user.id,
                type: "transfer_processed",
                // Usamos el mismo tipo para mantener consistencia
                title: "Transferencia Rechazada",
                message: `La transferencia de la reposici\xF3n ${reposition?.folio} hacia ${transfer.toArea} ha sido rechazada.${reason ? ` Motivo: ${reason}` : ""}`,
                repositionId: transfer.repositionId
              });
            }
          }
        }
        if (action === "accepted") {
          const targetAreaUsers = await db.select().from(users).where(eq(users.area, transfer.toArea));
          for (const user of targetAreaUsers) {
            if (user.id !== userId) {
              await this.createNotification({
                userId: user.id,
                type: "reposition_received",
                title: "Nueva Reposici\xF3n Recibida",
                message: `La reposici\xF3n ${reposition?.folio} ha llegado a tu \xE1rea`,
                repositionId: reposition?.id
              });
            }
          }
        }
        return transfer;
      }
      async getRepositionHistory(repositionId) {
        const historyEntries = await db.select({
          id: repositionHistory.id,
          action: repositionHistory.action,
          description: repositionHistory.description,
          fromArea: repositionHistory.fromArea,
          toArea: repositionHistory.toArea,
          createdAt: repositionHistory.createdAt,
          userName: users.name
        }).from(repositionHistory).leftJoin(users, eq(repositionHistory.userId, users.id)).where(eq(repositionHistory.repositionId, repositionId)).orderBy(desc(repositionHistory.createdAt));
        return historyEntries.map((entry) => ({
          id: entry.id,
          action: entry.action,
          description: entry.description,
          fromArea: entry.fromArea || void 0,
          toArea: entry.toArea || void 0,
          createdAt: entry.createdAt.toISOString(),
          userName: entry.userName || "Usuario desconocido"
        }));
      }
      async createAdminPassword(password, createdBy) {
        const [adminPassword] = await db.insert(adminPasswords).values({
          password,
          createdBy
        }).returning();
        return adminPassword;
      }
      async verifyAdminPassword(password) {
        const [adminPassword] = await db.select().from(adminPasswords).where(and(eq(adminPasswords.password, password), eq(adminPasswords.isActive, true))).orderBy(desc(adminPasswords.createdAt));
        return !!adminPassword;
      }
      async updateRepositionConsumo(repositionId, consumoTela) {
        await db.update(repositions).set({ consumoTela }).where(eq(repositions.id, repositionId));
      }
      async cancelReposition(repositionId, userId, reason) {
        console.log("Cancelling reposition:", repositionId, "by user:", userId, "reason:", reason);
        const reposition = await this.getRepositionById(repositionId);
        if (!reposition) {
          throw new Error("Reposici\xF3n no encontrada");
        }
        console.log("Found reposition:", reposition.folio);
        await db.update(repositions).set({
          status: "cancelado",
          completedAt: /* @__PURE__ */ new Date()
        }).where(eq(repositions.id, repositionId));
        console.log("Updated reposition status to cancelado");
        await this.addRepositionHistory(
          repositionId,
          "canceled",
          `Reposici\xF3n cancelada. Motivo: ${reason}`,
          userId
        );
        console.log("Added history entry");
        if (reposition.createdBy !== userId) {
          await this.createNotification({
            userId: reposition.createdBy,
            type: "reposition_canceled",
            title: "Reposici\xF3n Cancelada",
            message: `La reposici\xF3n ${reposition.folio} ha sido cancelada. Motivo: ${reason}`,
            repositionId
          });
          console.log("Created notification for user:", reposition.createdBy);
        }
      }
      async deleteReposition(repositionId, userId) {
        console.log("Permanently deleting reposition:", repositionId, "requested by user:", userId);
        const reposition = await this.getRepositionById(repositionId);
        if (!reposition) {
          throw new Error("Reposici\xF3n no encontrada");
        }
        await db.delete(notifications).where(eq(notifications.repositionId, repositionId));
        await db.delete(repositionPieces).where(eq(repositionPieces.repositionId, repositionId));
        await db.delete(repositionProducts).where(eq(repositionProducts.repositionId, repositionId));
        await db.delete(repositionMaterials).where(eq(repositionMaterials.repositionId, repositionId));
        await db.delete(repositionContrastFabrics).where(eq(repositionContrastFabrics.repositionId, repositionId));
        await db.delete(documents).where(eq(documents.repositionId, repositionId));
        await db.delete(repositionHistory).where(eq(repositionHistory.repositionId, repositionId));
        await db.delete(repositionTimers).where(eq(repositionTimers.repositionId, repositionId));
        await db.delete(repositionTransfers).where(eq(repositionTransfers.repositionId, repositionId));
        await db.delete(repositions).where(eq(repositions.id, repositionId));
        console.log(`Reposition ${reposition.folio} (ID: ${repositionId}) permanently deleted.`);
      }
      async completeReposition(repositionId, userId, notes) {
        const now = /* @__PURE__ */ new Date();
        console.log("Completing reposition:", {
          repositionId,
          userId,
          completedAt: now,
          notes
        });
        await db.update(repositions).set({
          status: "completado",
          completedAt: now,
          approvedBy: userId
        }).where(eq(repositions.id, repositionId));
        const updatedReposition = await this.getRepositionById(repositionId);
        console.log("Reposition after completion update:", {
          id: updatedReposition?.id,
          status: updatedReposition?.status,
          completedAt: updatedReposition?.completedAt,
          approvedBy: updatedReposition?.approvedBy
        });
        await this.addRepositionHistory(
          repositionId,
          "completed",
          `Reposici\xF3n finalizada${notes ? ` - ${notes}` : ""}`,
          userId
        );
        const reposition = await this.getRepositionById(repositionId);
        if (reposition && reposition.createdBy !== userId) {
          await this.createNotification({
            userId: reposition.createdBy,
            type: "reposition_completed",
            title: "Reposici\xF3n Completada",
            message: `La reposici\xF3n ${reposition.folio} ha sido completada${notes ? `: ${notes}` : ""}`,
            repositionId
          });
        }
      }
      async requestCompletionApproval(repositionId, userId, notes) {
        await this.addRepositionHistory(
          repositionId,
          "completion_requested",
          `Solicitud de finalizaci\xF3n enviada${notes ? `: ${notes}` : ""}`,
          userId
        );
        const adminUsers = await db.select().from(users).where(eq(users.area, "admin"));
        const enviosUsers = await db.select().from(users).where(eq(users.area, "envios"));
        const operacionesUsers = await db.select().from(users).where(eq(users.area, "operaciones"));
        const allTargetUsers = [...adminUsers, ...enviosUsers, ...operacionesUsers];
        const reposition = await this.getRepositionById(repositionId);
        if (reposition) {
          for (const targetUser of allTargetUsers) {
            await this.createNotification({
              userId: targetUser.id,
              type: "completion_approval_needed",
              title: "Solicitud de Finalizaci\xF3n",
              message: `Se solicita aprobaci\xF3n para finalizar la reposici\xF3n ${reposition.folio}${notes ? `: ${notes}` : ""}`,
              repositionId
            });
          }
        }
      }
      async getPendingRepositionsCount() {
        const repositions2 = await this.getAllRepositions(false);
        return repositions2.filter((r) => r.status === "pendiente").length;
      }
      async getAllRepositions(includeDeleted = false) {
        let query;
        if (!includeDeleted) {
          query = db.select().from(repositions).where(ne(repositions.status, "eliminado"));
        } else {
          query = db.select().from(repositions);
        }
        return await query.orderBy(desc(repositions.createdAt));
      }
      async getRecentRepositions(area, limit = 10) {
        let whereCondition = ne(repositions.status, "eliminado");
        if (area && area !== "admin") {
          whereCondition = and(
            ne(repositions.status, "eliminado"),
            eq(repositions.currentArea, area)
          );
        }
        return await db.select().from(repositions).where(whereCondition).orderBy(desc(repositions.createdAt)).limit(limit);
      }
      async getRepositionTracking(repositionId) {
        console.log("Getting tracking for reposition ID:", repositionId);
        const reposition = await this.getRepositionById(repositionId);
        if (!reposition) {
          console.log("Reposicion not found for ID:", repositionId);
          throw new Error("Reposici\xF3n no encontrada");
        }
        console.log("Found reposition:", reposition.folio);
        const history = await this.getRepositionHistory(repositionId);
        console.log("History entries:", history.length);
        const transfersFromDB = await db.query.repositionTransfers.findMany({
          where: eq(repositionTransfers.repositionId, repositionId),
          orderBy: desc(repositionTransfers.createdAt),
          with: {
            creator: true,
            processor: true
          }
        });
        console.log("Transfers found:", transfersFromDB.length);
        let timersFromDB = [];
        try {
          timersFromDB = await db.select().from(repositionTimers).where(eq(repositionTimers.repositionId, repositionId));
        } catch (timerError) {
          console.error("Error fetching timers:", timerError);
          timersFromDB = [];
        }
        console.log("Timers found:", timersFromDB.length);
        const areasWithTimers = timersFromDB.map((t) => t.area);
        const allRelevantAreas = Array.from(/* @__PURE__ */ new Set([...areasWithTimers, reposition.currentArea]));
        const areaOrder = ["patronaje", "corte", "bordado", "ensamble", "plancha", "calidad"];
        const sortedAreas = allRelevantAreas.sort((a, b) => {
          const indexA = areaOrder.indexOf(a);
          const indexB = areaOrder.indexOf(b);
          return indexA - indexB;
        });
        console.log("Relevant areas for this reposition:", sortedAreas);
        const stepsFromAreas = sortedAreas.map((area, index) => {
          const areaTimer = timersFromDB.find((t) => t.area === area);
          let status = "pending";
          if (areaTimer && areaTimer.manualStartTime && areaTimer.manualEndTime) {
            status = "completed";
          } else if (area === reposition.currentArea && reposition.status !== "completado") {
            status = "current";
          } else if (reposition.status === "completado") {
            status = "completed";
          }
          let timeSpent = void 0;
          let timeInMinutes = 0;
          if (areaTimer && areaTimer.manualStartTime && areaTimer.manualEndTime) {
            if (areaTimer.elapsedMinutes && !isNaN(areaTimer.elapsedMinutes) && areaTimer.elapsedMinutes > 0) {
              timeInMinutes = areaTimer.elapsedMinutes;
            } else {
              const [startHour, startMinute] = areaTimer.manualStartTime.split(":").map(Number);
              const [endHour, endMinute] = areaTimer.manualEndTime.split(":").map(Number);
              if (!isNaN(startHour) && !isNaN(startMinute) && !isNaN(endHour) && !isNaN(endMinute)) {
                const startTotalMinutes = startHour * 60 + startMinute;
                const endTotalMinutes = endHour * 60 + endMinute;
                timeInMinutes = endTotalMinutes - startTotalMinutes;
                if (timeInMinutes < 0) {
                  timeInMinutes += 24 * 60;
                }
              }
            }
            if (!isNaN(timeInMinutes) && timeInMinutes > 0) {
              const hours = Math.floor(timeInMinutes / 60);
              const minutes = Math.round(timeInMinutes % 60);
              timeSpent = hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
            }
          }
          const areaHistory = history.find(
            (h) => h.toArea === area || area === "patronaje" && h.action === "created" || h.action === "manual_time_set" && h.description?.includes(area)
          );
          return {
            id: index + 1,
            area,
            status,
            timestamp: areaHistory?.createdAt || areaTimer?.createdAt,
            user: areaHistory?.userName,
            timeSpent,
            timeInMinutes,
            date: areaTimer?.manualDate
          };
        });
        const areaTimesCalculated = {};
        timersFromDB.forEach((timer) => {
          let elapsedMinutes = 0;
          if (timer.manualStartTime && timer.manualEndTime) {
            if (timer.elapsedMinutes && !isNaN(timer.elapsedMinutes) && timer.elapsedMinutes > 0) {
              elapsedMinutes = timer.elapsedMinutes;
            } else {
              const [startHour, startMinute] = timer.manualStartTime.split(":").map(Number);
              const [endHour, endMinute] = timer.manualEndTime.split(":").map(Number);
              if (!isNaN(startHour) && !isNaN(startMinute) && !isNaN(endHour) && !isNaN(endMinute)) {
                const startTotalMinutes = startHour * 60 + startMinute;
                const endTotalMinutes = endHour * 60 + endMinute;
                elapsedMinutes = endTotalMinutes - startTotalMinutes;
                if (elapsedMinutes < 0) {
                  elapsedMinutes += 24 * 60;
                }
              }
            }
            if (!isNaN(elapsedMinutes) && elapsedMinutes > 0) {
              areaTimesCalculated[timer.area] = (areaTimesCalculated[timer.area] || 0) + elapsedMinutes;
            }
          }
        });
        history.forEach((event) => {
          if (event.description && event.description.includes("Tiempo manual registrado:")) {
            const timeMatch = event.description.match(/(\d+)\s*minutos?\s*en\s*área\s*(\w+)/i);
            if (timeMatch) {
              const minutes = parseInt(timeMatch[1]);
              const area = timeMatch[2].toLowerCase();
              if (!isNaN(minutes) && minutes > 0) {
                areaTimesCalculated[area] = (areaTimesCalculated[area] || 0) + minutes;
              }
            }
          }
        });
        console.log("Area times calculated:", areaTimesCalculated);
        const validTimes = Object.values(areaTimesCalculated).filter((minutes) => !isNaN(minutes) && minutes > 0);
        const totalMinutesCalculated = validTimes.reduce((sum, minutes) => sum + minutes, 0);
        const totalHours = Math.floor(totalMinutesCalculated / 60);
        const remainingMinutes = Math.round(totalMinutesCalculated % 60);
        const totalTimeFormatted = totalMinutesCalculated > 0 ? totalHours > 0 ? `${totalHours}h ${remainingMinutes}m` : `${remainingMinutes}m` : "0m";
        const completedSteps = stepsFromAreas.filter((s) => s.status === "completed").length;
        const progress = sortedAreas.length > 0 ? Math.round(completedSteps / sortedAreas.length * 100) : 0;
        const result = {
          reposition: {
            folio: reposition.folio,
            status: reposition.status,
            currentArea: reposition.currentArea,
            progress
          },
          steps: stepsFromAreas,
          history,
          transfers: transfersFromDB.map((t) => ({
            id: t.id,
            fromArea: t.fromArea,
            toArea: t.toArea,
            status: t.status || "pending",
            notes: t.notes || "",
            createdAt: t.createdAt,
            processedAt: t.processedAt || null,
            transferredBy: t.creator ? t.creator.name : "Usuario Desconocido",
            processedBy: t.processor ? t.processor.name : null
          })),
          totalTime: {
            formatted: totalTimeFormatted,
            minutes: totalMinutesCalculated
          },
          areaTimes: areaTimesCalculated
        };
        console.log("Returning tracking data:", JSON.stringify(result, null, 2));
        return result;
      }
      async getPendingRepositionTransfers(userArea) {
        return await db.select().from(repositionTransfers).where(and(
          eq(repositionTransfers.toArea, userArea),
          eq(repositionTransfers.status, "pending")
        )).orderBy(desc(repositionTransfers.createdAt));
      }
      async hasRecentTransfer(repositionId, fromArea) {
        const pendingTransfer = await db.select().from(repositionTransfers).where(and(
          eq(repositionTransfers.repositionId, repositionId),
          eq(repositionTransfers.fromArea, fromArea),
          eq(repositionTransfers.status, "pending")
        )).limit(1);
        if (pendingTransfer.length > 0) {
          const transferTime = new Date(pendingTransfer[0].createdAt);
          const now = /* @__PURE__ */ new Date();
          const timeDiffMs = now.getTime() - transferTime.getTime();
          const fiveMinutesMs = 5 * 60 * 1e3;
          const remainingMs = fiveMinutesMs - timeDiffMs;
          if (remainingMs > 0) {
            const remainingMinutes = Math.ceil(remainingMs / (60 * 1e3));
            return {
              hasRecent: true,
              remainingTime: Math.max(1, remainingMinutes)
            };
          }
        }
        const fiveMinutesAgo = /* @__PURE__ */ new Date();
        fiveMinutesAgo.setMinutes(fiveMinutesAgo.getMinutes() - 5);
        const recentTransfer = await db.select().from(repositionTransfers).where(and(
          eq(repositionTransfers.repositionId, repositionId),
          eq(repositionTransfers.fromArea, fromArea),
          gte(repositionTransfers.createdAt, fiveMinutesAgo)
        )).orderBy(desc(repositionTransfers.createdAt)).limit(1);
        if (recentTransfer.length > 0) {
          const transferTime = new Date(recentTransfer[0].createdAt);
          const now = /* @__PURE__ */ new Date();
          const timeDiffMs = now.getTime() - transferTime.getTime();
          const remainingMs = 5 * 60 * 1e3 - timeDiffMs;
          if (remainingMs > 0) {
            const remainingMinutes = Math.ceil(remainingMs / (60 * 1e3));
            return {
              hasRecent: true,
              remainingTime: Math.max(1, remainingMinutes)
            };
          }
        }
        return { hasRecent: false };
      }
      // Agenda Events
      async getAgendaEvents(user) {
        if (user.area === "admin" || user.area === "envios") {
          return await db.select({
            id: agendaEvents.id,
            createdBy: agendaEvents.createdBy,
            assignedToArea: agendaEvents.assignedToArea,
            title: agendaEvents.title,
            description: agendaEvents.description,
            date: agendaEvents.date,
            time: agendaEvents.time,
            priority: agendaEvents.priority,
            status: agendaEvents.status,
            createdAt: agendaEvents.createdAt,
            updatedAt: agendaEvents.updatedAt,
            creatorName: users.name
          }).from(agendaEvents).leftJoin(users, eq(agendaEvents.createdBy, users.id)).orderBy(asc(agendaEvents.date), asc(agendaEvents.time));
        } else {
          return await db.select({
            id: agendaEvents.id,
            createdBy: agendaEvents.createdBy,
            assignedToArea: agendaEvents.assignedToArea,
            title: agendaEvents.title,
            description: agendaEvents.description,
            date: agendaEvents.date,
            time: agendaEvents.time,
            priority: agendaEvents.priority,
            status: agendaEvents.status,
            createdAt: agendaEvents.createdAt,
            updatedAt: agendaEvents.updatedAt,
            creatorName: users.name
          }).from(agendaEvents).leftJoin(users, eq(agendaEvents.createdBy, users.id)).where(eq(agendaEvents.assignedToArea, user.area)).orderBy(asc(agendaEvents.date), asc(agendaEvents.time));
        }
      }
      async createAgendaEvent(eventData) {
        const [event] = await db.insert(agendaEvents).values(eventData).returning();
        return event;
      }
      async updateAgendaEvent(eventId, eventData) {
        const [event] = await db.update(agendaEvents).set(eventData).where(eq(agendaEvents.id, eventId)).returning();
        if (!event) {
          throw new Error("Tarea no encontrada");
        }
        return event;
      }
      async updateTaskStatus(eventId, userArea, status) {
        const [event] = await db.update(agendaEvents).set({ status, updatedAt: /* @__PURE__ */ new Date() }).where(and(
          eq(agendaEvents.id, eventId),
          eq(agendaEvents.assignedToArea, userArea)
        )).returning();
        if (!event) {
          throw new Error("Tarea no encontrada o no asignada a tu \xE1rea");
        }
        return event;
      }
      async deleteAgendaEvent(eventId) {
        const result = await db.delete(agendaEvents).where(eq(agendaEvents.id, eventId));
        if (result.rowCount === 0) {
          throw new Error("Tarea no encontrada");
        }
      }
      async generateReport(type, format, startDate, endDate, filters) {
        throw new Error("Method not implemented.");
      }
      async saveReportToOneDrive(type, startDate, endDate, filters) {
        throw new Error("Method not implemented.");
      }
      async startRepositionTimer(repositionId, userId, area) {
        console.log("Starting timer for reposition:", repositionId, "user:", userId, "area:", area);
        const reposition = await this.getRepositionById(repositionId);
        if (!reposition) {
          throw new Error("Reposici\xF3n no encontrada");
        }
        if (reposition.status !== "aprobado") {
          throw new Error("Solo se puede iniciar el cron\xF3metro en reposiciones aprobadas");
        }
        if (reposition.createdBy === userId) {
          throw new Error("El creador de la reposici\xF3n no debe registrar tiempo");
        }
        const existingTimer = await db.select().from(repositionTimers).where(and(
          eq(repositionTimers.repositionId, repositionId),
          eq(repositionTimers.area, area),
          isNull(repositionTimers.endTime)
        )).limit(1);
        if (existingTimer.length > 0) {
          throw new Error("Ya hay un cron\xF3metro activo para esta \xE1rea en esta reposici\xF3n");
        }
        const newTimer = await db.insert(repositionTimers).values({
          repositionId,
          area,
          userId,
          startTime: /* @__PURE__ */ new Date()
        }).returning();
        await this.addRepositionHistory(
          repositionId,
          "timer_started",
          `Cron\xF3metro iniciado en \xE1rea ${area}`,
          userId
        );
        console.log("Timer started successfully:", newTimer[0]);
        return newTimer[0];
      }
      async stopRepositionTimer(repositionId, area, userId) {
        const [activeTimer] = await db.select().from(repositionTimers).where(and(
          eq(repositionTimers.repositionId, repositionId),
          eq(repositionTimers.isRunning, true)
        )).orderBy(desc(repositionTimers.startTime));
        if (!activeTimer) {
          throw new Error("No hay cron\xF3metro activo para esta reposici\xF3n");
        }
        const endTime = /* @__PURE__ */ new Date();
        const startTime = new Date(activeTimer.startTime);
        const elapsedMilliseconds = endTime.getTime() - startTime.getTime();
        const elapsedMinutes = Math.floor(elapsedMilliseconds / (1e3 * 60));
        const hours = Math.floor(elapsedMinutes / 60);
        const minutes = elapsedMinutes % 60;
        const elapsedTimeFormatted = `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:00`;
        await db.update(repositionTimers).set({
          endTime,
          elapsedMinutes,
          isRunning: false
        }).where(eq(repositionTimers.id, activeTimer.id));
        const user = await this.getUser(userId);
        await db.insert(repositionHistory).values({
          repositionId,
          action: "timer_stopped",
          description: `Cron\xF3metro detenido por ${user?.name || "Usuario"} en \xE1rea ${area}. Tiempo transcurrido: ${elapsedTimeFormatted}`,
          userId
        });
        console.log(`Timer stopped for reposition ${repositionId} by user ${userId} in area ${area}. Elapsed: ${elapsedTimeFormatted}`);
        return { elapsedTime: elapsedTimeFormatted };
      }
      async getRepositionTimers(repositionId) {
        console.log(`Retrieving timers for reposition ${repositionId}`);
        const timers = await db.select().from(repositionTimers).where(eq(repositionTimers.repositionId, repositionId));
        const localTimers = timers.map((timer) => {
          const startTime = timer.startTime ? new Date(timer.startTime) : null;
          const endTime = timer.endTime ? new Date(timer.endTime) : null;
          let elapsedMinutes = timer.elapsedMinutes || 0;
          if (startTime && endTime) {
            elapsedMinutes = (endTime.getTime() - startTime.getTime()) / (1e3 * 60);
          }
          const hours = Math.floor(elapsedMinutes / 60);
          const minutes = Math.floor(elapsedMinutes % 60);
          const elapsedTime = `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:00`;
          return {
            id: timer.id,
            repositionId: timer.repositionId,
            userId: timer.userId,
            area: timer.area,
            startTime,
            endTime,
            elapsedTime
          };
        });
        return localTimers;
      }
      async getReportData(type, startDate, endDate, filters) {
        throw new Error("Method not implemented.");
      }
      async getUserAgendaEvents(userId) {
        throw new Error("Method not implemented.");
      }
      async setManualRepositionTime(repositionId, area, userId, startTime, endTime, startDate, endDate) {
        console.log("Setting manual time for reposition:", repositionId, "area:", area, "user:", userId);
        const reposition = await this.getRepositionById(repositionId);
        if (!reposition) {
          throw new Error("Reposici\xF3n no encontrada");
        }
        if (!startTime || !endTime || !startDate || !endDate) {
          throw new Error("Todos los campos de fecha y hora son requeridos");
        }
        const startDateTime = /* @__PURE__ */ new Date(`${startDate}T${startTime}:00`);
        const endDateTime = /* @__PURE__ */ new Date(`${endDate}T${endTime}:00`);
        console.log("Start DateTime:", startDateTime);
        console.log("End DateTime:", endDateTime);
        console.log("Start Date String:", `${startDate}T${startTime}:00`);
        console.log("End Date String:", `${endDate}T${endTime}:00`);
        if (startDateTime >= endDateTime) {
          throw new Error("La hora de inicio debe ser anterior a la hora de fin");
        }
        const durationMs = endDateTime.getTime() - startDateTime.getTime();
        const durationMinutes = Math.round(durationMs / (1e3 * 60));
        console.log("Duration in minutes:", durationMinutes);
        if (durationMinutes <= 0) {
          throw new Error("La duraci\xF3n debe ser positiva");
        }
        if (durationMinutes > 24 * 60) {
          throw new Error("La duraci\xF3n no puede exceder 24 horas");
        }
        const existingTimer = await db.select().from(repositionTimers).where(and(
          eq(repositionTimers.repositionId, repositionId),
          eq(repositionTimers.area, area)
        )).limit(1);
        if (existingTimer.length > 0) {
          await db.update(repositionTimers).set({
            manualStartTime: startTime,
            manualEndTime: endTime,
            startTime: startDateTime,
            endTime: endDateTime,
            elapsedMinutes: durationMinutes,
            isRunning: false,
            userId,
            manualDate: startDate
          }).where(eq(repositionTimers.id, existingTimer[0].id));
          console.log("Updated existing timer with manual time");
        } else {
          await db.insert(repositionTimers).values({
            repositionId,
            area,
            userId,
            startTime: startDateTime,
            endTime: endDateTime,
            elapsedMinutes: durationMinutes,
            isRunning: false,
            manualStartTime: startTime,
            manualEndTime: endTime,
            manualDate: startDate
          });
          console.log("Created new timer with manual time");
        }
        await this.addRepositionHistory(
          repositionId,
          "timer_manual",
          `Tiempo manual: ${Math.floor(durationMinutes / 60)}h ${durationMinutes % 60}m`,
          userId
        );
        const hours = Math.floor(durationMinutes / 60);
        const minutes = durationMinutes % 60;
        const elapsedTime = `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:00`;
        return {
          repositionId,
          area,
          userId,
          startTime: startDateTime,
          endTime: endDateTime,
          elapsedTime,
          duration: durationMinutes
        };
      }
      async getRepositionTimer(repositionId, area) {
        const [timer] = await db.select().from(repositionTimers).where(and(
          eq(repositionTimers.repositionId, repositionId),
          eq(repositionTimers.area, area)
        )).limit(1);
        return timer || null;
      }
      // Funciones para gestión de materiales
      async updateRepositionMaterialStatus(repositionId, materialStatus, missingMaterials, notes) {
        const existingMaterial = await db.select().from(repositionMaterials).where(eq(repositionMaterials.repositionId, repositionId)).limit(1);
        if (existingMaterial.length > 0) {
          await db.update(repositionMaterials).set({
            materialStatus,
            missingMaterials,
            notes,
            updatedAt: /* @__PURE__ */ new Date()
          }).where(eq(repositionMaterials.repositionId, repositionId));
        } else {
          await db.insert(repositionMaterials).values({
            repositionId,
            materialStatus,
            missingMaterials,
            notes
          });
        }
        await this.addRepositionHistory(
          repositionId,
          "material_status_updated",
          `Estado de materiales actualizado: ${materialStatus}${missingMaterials ? ` - Faltantes: ${missingMaterials}` : ""}`,
          1
          // Esto debería ser el ID del usuario actual
        );
      }
      async pauseReposition(repositionId, reason, userId) {
        const existingMaterial = await db.select().from(repositionMaterials).where(eq(repositionMaterials.repositionId, repositionId)).limit(1);
        if (existingMaterial.length > 0) {
          await db.update(repositionMaterials).set({
            isPaused: true,
            pauseReason: reason,
            pausedBy: userId,
            pausedAt: /* @__PURE__ */ new Date(),
            updatedAt: /* @__PURE__ */ new Date()
          }).where(eq(repositionMaterials.repositionId, repositionId));
        } else {
          await db.insert(repositionMaterials).values({
            repositionId,
            isPaused: true,
            pauseReason: reason,
            pausedBy: userId,
            pausedAt: /* @__PURE__ */ new Date()
          });
        }
        await this.addRepositionHistory(
          repositionId,
          "paused",
          `Reposici\xF3n pausada por almac\xE9n. Motivo: ${reason}`,
          userId
        );
        const areaUsers = await db.select().from(users).where(or(
          eq(users.area, "admin"),
          eq(users.area, "operaciones"),
          eq(users.area, "envios")
        ));
        for (const user of areaUsers) {
          await this.createNotification({
            userId: user.id,
            type: "reposition_paused",
            title: "Reposici\xF3n Pausada",
            message: `La reposici\xF3n ha sido pausada por almac\xE9n. Motivo: ${reason}`,
            repositionId
          });
        }
      }
      async resumeReposition(repositionId, userId) {
        await db.transaction(async (tx) => {
          await tx.update(repositionMaterials).set({
            isPaused: false,
            resumedBy: userId,
            resumedAt: /* @__PURE__ */ new Date(),
            updatedAt: /* @__PURE__ */ new Date()
          }).where(eq(repositionMaterials.repositionId, repositionId));
          await tx.insert(repositionHistory).values({
            repositionId,
            action: "resumed",
            description: "Reposici\xF3n reanudada por almac\xE9n",
            userId
          });
        });
      }
      async reactivateReposition(repositionId, userId, reason) {
        await db.transaction(async (tx) => {
          const [reposition] = await tx.select().from(repositions).where(eq(repositions.id, repositionId)).limit(1);
          if (!reposition) {
            throw new Error("Reposici\xF3n no encontrada");
          }
          await tx.update(repositions).set({
            status: "aprobado",
            completedAt: null
          }).where(eq(repositions.id, repositionId));
          await tx.insert(repositionHistory).values({
            repositionId,
            action: "reactivated",
            description: `Reposici\xF3n reactivada - Motivo: ${reason}`,
            userId,
            createdAt: /* @__PURE__ */ new Date()
          });
          const usersToSend = await tx.select().from(users).where(eq(users.area, reposition.solicitanteArea));
          for (const user of usersToSend) {
            await tx.insert(notifications).values({
              userId: user.id,
              type: "reposition_reactivated",
              title: "Reposici\xF3n Reactivada",
              message: `La reposici\xF3n ${reposition.folio} ha sido reactivada y est\xE1 nuevamente en proceso`,
              repositionId,
              createdAt: /* @__PURE__ */ new Date()
            });
          }
        });
      }
      async getRepositionMaterialStatus(repositionId) {
        const material = await db.select().from(repositionMaterials).where(eq(repositionMaterials.repositionId, repositionId)).limit(1);
        return material[0] || null;
      }
      async saveRepositionDocument(documentData) {
        const allowedExtensions = [".pdf", ".xml", ".jpg", ".jpeg", ".png"];
        const fileExtension = documentData.originalName.toLowerCase().split(".").pop();
        if (!fileExtension || !allowedExtensions.includes(`.${fileExtension}`)) {
          throw new Error("Tipo de archivo no permitido. Solo se permiten archivos PDF, XML, JPG, PNG y JPEG.");
        }
        let document;
        try {
          [document] = await db.insert(documents).values({
            filename: documentData.filename,
            originalName: documentData.originalName,
            size: documentData.size,
            path: documentData.path,
            repositionId: documentData.repositionId,
            uploadedBy: documentData.uploadedBy
          }).returning();
        } catch (error) {
          if (error.code === "23505" && error.constraint === "documents_pkey") {
            console.log("Error secuencia documents. Corrigiendo...");
            await db.execute(sql`SELECT setval('documents_id_seq', (SELECT MAX(id) FROM documents))`);
            [document] = await db.insert(documents).values({
              filename: documentData.filename,
              originalName: documentData.originalName,
              size: documentData.size,
              path: documentData.path,
              repositionId: documentData.repositionId,
              uploadedBy: documentData.uploadedBy
            }).returning();
          } else {
            throw error;
          }
        }
        return document;
      }
      async getRepositionDocuments(repositionId) {
        const docs = await db.select({
          id: documents.id,
          filename: documents.filename,
          originalName: documents.originalName,
          size: documents.size,
          uploadedBy: documents.uploadedBy,
          createdAt: documents.createdAt,
          uploaderName: users.name
        }).from(documents).leftJoin(users, eq(documents.uploadedBy, users.id)).where(eq(documents.repositionId, repositionId)).orderBy(documents.createdAt);
        return docs;
      }
      async getRepositionPieces(repositionId) {
        const pieces = await db.select({
          id: repositionPieces.id,
          talla: repositionPieces.talla,
          cantidad: repositionPieces.cantidad,
          folioOriginal: repositionPieces.folioOriginal
        }).from(repositionPieces).where(eq(repositionPieces.repositionId, repositionId)).orderBy(repositionPieces.id);
        console.log("Pieces from database:", pieces);
        return pieces;
      }
      async getAllRepositionsForAlmacen() {
        const result = await db.select({
          id: repositions.id,
          folio: repositions.folio,
          type: repositions.type,
          solicitanteNombre: repositions.solicitanteNombre,
          solicitanteArea: repositions.solicitanteArea,
          modeloPrenda: repositions.modeloPrenda,
          tela: repositions.tela,
          color: repositions.color,
          tipoPieza: repositions.tipoPieza,
          consumoTela: repositions.consumoTela,
          urgencia: repositions.urgencia,
          currentArea: repositions.currentArea,
          status: repositions.status,
          createdAt: repositions.createdAt,
          isPaused: repositionMaterials.isPaused,
          pauseReason: repositionMaterials.pauseReason,
          observaciones: repositions.observaciones
        }).from(repositions).leftJoin(repositionMaterials, eq(repositions.id, repositionMaterials.repositionId)).where(and(
          ne(repositions.status, "eliminado"),
          ne(repositions.status, "completado")
        )).orderBy(desc(repositions.createdAt));
        return result;
      }
      async createReposition(data, pieces, createdBy) {
        const { productos, telaContraste, ...mainRepositionData } = data;
        let repositionData = { ...mainRepositionData };
        if ((data.type === "reposici\xF3n" || data.type === "reproceso") && productos && productos.length > 0) {
          const firstProduct = productos[0];
          repositionData = {
            ...repositionData,
            modeloPrenda: firstProduct.modeloPrenda || "",
            tela: firstProduct.tela || (data.type === "reproceso" ? "N/A" : ""),
            color: firstProduct.color || (data.type === "reproceso" ? "N/A" : ""),
            tipoPieza: firstProduct.tipoPieza || (data.type === "reproceso" ? "N/A" : ""),
            consumoTela: firstProduct.consumoTela || 0
          };
        } else if (data.type === "reproceso" && !productos?.length) {
          repositionData = {
            ...repositionData,
            modeloPrenda: repositionData.modeloPrenda || "",
            tela: repositionData.tela || "N/A",
            color: repositionData.color || "N/A",
            tipoPieza: repositionData.tipoPieza || "N/A",
            consumoTela: 0
          };
        }
        let reposition;
        try {
          [reposition] = await db.insert(repositions).values({
            ...repositionData,
            createdBy,
            volverHacer: data.volverHacer,
            descripcionSuceso: data.descripcionSuceso,
            materialesImplicados: data.materialesImplicados,
            observaciones: data.observaciones,
            createdAt: /* @__PURE__ */ new Date()
          }).returning();
        } catch (error) {
          if (error.code === "23505" && error.constraint === "repositions_pkey") {
            console.log("Detectado error de secuencia en ID de reposiciones. Intentando corregir...");
            await db.execute(sql`SELECT setval('repositions_id_seq', (SELECT MAX(id) FROM repositions))`);
            console.log("Secuencia corregida. Reintentando inserci\xF3n...");
            [reposition] = await db.insert(repositions).values({
              ...repositionData,
              createdBy,
              volverHacer: data.volverHacer,
              descripcionSuceso: data.descripcionSuceso,
              materialesImplicados: data.materialesImplicados,
              observaciones: data.observaciones,
              createdAt: /* @__PURE__ */ new Date()
            }).returning();
          } else {
            throw error;
          }
        }
        if (productos && productos.length > 0) {
          try {
            const productPromises = productos.map(async (producto) => {
              const [newProduct] = await db.insert(repositionProducts).values({
                repositionId: reposition.id,
                modeloPrenda: producto.modeloPrenda,
                tela: producto.tela,
                color: producto.color,
                tipoPieza: producto.tipoPieza,
                consumoTela: producto.consumoTela || 0
              }).returning();
              if (producto.pieces && producto.pieces.length > 0) {
                await db.insert(repositionPieces).values(producto.pieces.map((piece) => ({
                  repositionId: reposition.id,
                  repositionProductId: newProduct.id,
                  // Vincular con el producto específico
                  talla: piece.talla,
                  cantidad: piece.cantidad,
                  unit: piece.unit || "piezas",
                  folioOriginal: piece.folioOriginal
                })));
              }
            });
            await Promise.all(productPromises);
          } catch (error) {
            console.error("Error al guardar productos y piezas:", error);
            throw error;
          }
        } else if (pieces.length > 0) {
          try {
            await db.insert(repositionPieces).values(pieces.map((piece) => ({
              ...piece,
              repositionId: reposition.id
            })));
          } catch (error) {
            if (error.code === "23505" && error.constraint === "reposition_pieces_pkey") {
              console.log("Error secuencia reposition_pieces. Corrigiendo...");
              await db.execute(sql`SELECT setval('reposition_pieces_id_seq', (SELECT MAX(id) FROM reposition_pieces))`);
              await db.insert(repositionPieces).values(pieces.map((piece) => ({
                ...piece,
                repositionId: reposition.id
              })));
            } else throw error;
          }
        }
        if (telaContraste && telaContraste.length > 0) {
          try {
            await db.insert(repositionContrastFabrics).values(telaContraste.map((tela) => ({
              repositionId: reposition.id,
              ubicacion: tela.ubicacion,
              tela: tela.tela,
              color: tela.color,
              consumo: tela.consumo || 0
            })));
          } catch (error) {
            if (error.code === "23505" && error.constraint === "reposition_contrast_fabrics_pkey") {
              console.log("Error secuencia reposition_contrast_fabrics. Corrigiendo...");
              await db.execute(sql`SELECT setval('reposition_contrast_fabrics_id_seq', (SELECT MAX(id) FROM reposition_contrast_fabrics))`);
              await db.insert(repositionContrastFabrics).values(telaContraste.map((tela) => ({
                repositionId: reposition.id,
                ubicacion: tela.ubicacion,
                tela: tela.tela,
                color: tela.color,
                consumo: tela.consumo || 0
              })));
            } else throw error;
          }
        }
        await this.addRepositionHistory(
          reposition.id,
          "created",
          `Reposici\xF3n ${reposition.type} creada`,
          createdBy
        );
        const adminUsers = await db.select().from(users).where(eq(users.area, "admin"));
        const operacionesUsers = await db.select().from(users).where(eq(users.area, "operaciones"));
        const enviosUsers = await db.select().from(users).where(eq(users.area, "envios"));
        const allTargetUsers = [...adminUsers, ...operacionesUsers, ...enviosUsers];
        for (const targetUser of allTargetUsers) {
          await this.createNotification({
            userId: targetUser.id,
            type: "new_reposition",
            title: "Nueva Solicitud de Reposici\xF3n",
            message: `Se ha creado una nueva solicitud de ${data.type}: ${data.folio}`,
            repositionId: reposition.id
          });
        }
        return reposition;
      }
      async fixAllSequences() {
        const tables = [
          "users",
          "notifications",
          "repositions",
          "reposition_pieces",
          "reposition_products",
          "reposition_contrast_fabrics",
          "reposition_timers",
          "reposition_transfers",
          "reposition_history",
          "admin_passwords",
          "reposition_materials",
          "documents",
          "agenda_events"
        ];
        console.log("Starting global sequence repair...");
        for (const table of tables) {
          try {
            const seqName = `${table}_id_seq`;
            const query = sql`SELECT setval('${sql.raw(seqName)}', COALESCE((SELECT MAX(id) FROM ${sql.raw(table)}), 1))`;
            await db.execute(query);
            console.log(`Fixed sequence for table: ${table}`);
          } catch (error) {
            console.error(`Error fixing sequence for table ${table}:`, error);
          }
        }
        try {
          const now = /* @__PURE__ */ new Date();
          const month = String(now.getMonth() + 1).padStart(2, "0");
          const year = String(now.getFullYear()).slice(-2);
          const monthYear = `${month}-${year}`;
          const pattern = `JN-REQ-${monthYear}-%`;
          console.log(`Verifying reposition sequence for ${monthYear}...`);
          const maxResult = await db.execute(sql`
        SELECT MAX(CAST(SUBSTRING(folio FROM '[0-9]+$') AS INTEGER)) as max_val 
        FROM repositions 
        WHERE folio LIKE ${pattern}
      `);
          if (maxResult.rows.length > 0) {
            const maxVal = maxResult.rows[0].max_val;
            if (maxVal) {
              console.log(`Found max reposition index for ${monthYear}: ${maxVal}`);
              await db.execute(sql`
            INSERT INTO reposition_folio_counters (month_year, current_value)
            VALUES (${monthYear}, ${maxVal})
            ON CONFLICT (month_year) 
            DO UPDATE SET current_value = GREATEST(reposition_folio_counters.current_value, ${maxVal})
          `);
              console.log(`Synced reposition folio counter for ${monthYear} to at least ${maxVal}`);
            }
          }
        } catch (error) {
          console.error("Error fixing reposition sequence:", error);
        }
        console.log("Global sequence repair completed.");
        console.log("Global sequence repair completed.");
      }
      async getSequenceData(table) {
        try {
          if (table === "repositions") {
            const now = /* @__PURE__ */ new Date();
            const year = now.getFullYear();
            const month = now.getMonth() + 1;
            const monthYear = `${String(month).padStart(2, "0")}-${year.toString().slice(-2)}`;
            const result2 = await db.execute(sql`SELECT current_value FROM reposition_folio_counters WHERE month_year = ${monthYear}`);
            if (result2.rows.length === 0) {
              return { lastValue: 0, nextValue: 1 };
            }
            const lastValue2 = result2.rows[0].current_value;
            return { lastValue: lastValue2, nextValue: lastValue2 + 1 };
          }
          const seqName = `${table}_id_seq`;
          const result = await db.execute(sql`SELECT last_value, is_called FROM ${sql.raw(seqName)}`);
          if (result.rows.length === 0) return null;
          const lastValue = parseInt(result.rows[0].last_value);
          const isCalled = result.rows[0].is_called;
          const nextValue = isCalled ? lastValue + 1 : lastValue;
          return { lastValue, nextValue };
        } catch (error) {
          console.error(`Error getting sequence data for table ${table}:`, error);
          return null;
        }
      }
      async setSequenceValue(table, value) {
        try {
          if (table === "repositions") {
            const now = /* @__PURE__ */ new Date();
            const year = now.getFullYear();
            const month = now.getMonth() + 1;
            const monthYear = `${String(month).padStart(2, "0")}-${year.toString().slice(-2)}`;
            await db.execute(sql`
          INSERT INTO reposition_folio_counters (month_year, current_value)
          VALUES (${monthYear}, 0)
          ON CONFLICT (month_year) DO NOTHING
        `);
            const valueToSet = value - 1;
            await db.execute(sql`
          UPDATE reposition_folio_counters
          SET current_value = ${valueToSet}
          WHERE month_year = ${monthYear}
        `);
            console.log(`Folio counter for ${monthYear} set to ${valueToSet} (next will be ${value})`);
            return;
          }
          const seqName = `${table}_id_seq`;
          await db.execute(sql`SELECT setval('${sql.raw(seqName)}', ${value}, false)`);
          console.log(`Sequence for ${table} set to ${value} (next value will be ${value})`);
        } catch (error) {
          console.error(`Error setting sequence value for table ${table}:`, error);
          throw error;
        }
      }
      async updateUser(userId, updateData) {
        try {
          const existingUser = await this.getUser(userId);
          if (!existingUser) {
            throw new Error("Usuario no encontrado");
          }
          const updateFields = {
            name: updateData.name,
            username: updateData.username,
            area: updateData.area
          };
          if (updateData.isActive !== void 0) {
            updateFields.isActive = updateData.isActive;
          }
          if (updateData.password) {
            updateFields.password = updateData.password;
          }
          await db.update(users).set(updateFields).where(eq(users.id, userId));
          console.log(`User ${userId} updated successfully`);
        } catch (error) {
          console.error("Error updating user:", error);
          throw error;
        }
      }
      async addRepositionHistory(repositionId, action, description, userId, fromArea, toArea) {
        try {
          await db.insert(repositionHistory).values({
            repositionId,
            action,
            description,
            userId,
            fromArea,
            toArea,
            createdAt: /* @__PURE__ */ new Date()
          });
        } catch (error) {
          if (error.code === "23505" && error.constraint === "reposition_history_pkey") {
            console.log("Detectado error de secuencia en ID de historial de reposiciones. Intentando corregir...");
            await db.execute(sql`SELECT setval('reposition_history_id_seq', (SELECT MAX(id) FROM reposition_history))`);
            console.log("Secuencia de historial corregida. Reintentando inserci\xF3n...");
            await db.insert(repositionHistory).values({
              repositionId,
              action,
              description,
              userId,
              fromArea,
              toArea,
              createdAt: /* @__PURE__ */ new Date()
            });
          } else {
            throw error;
          }
        }
      }
      // Métricas
      async getMonthlyMetrics(month, year) {
        console.log(`Getting monthly metrics for ${month}/${year}`);
        const startDate = new Date(year, month, 1);
        startDate.setHours(6, 0, 0, 0);
        const endDate = new Date(year, month + 1, 0);
        endDate.setHours(29, 59, 59, 999);
        console.log("Date range:", startDate.toISOString(), "to", endDate.toISOString());
        try {
          const repositionsQuery = await db.select({
            area: repositions.solicitanteArea,
            type: repositions.type,
            count: sql`COUNT(*)::int`
          }).from(repositions).where(and(
            gte(repositions.createdAt, startDate),
            lte(repositions.createdAt, endDate),
            ne(repositions.status, "eliminado")
          )).groupBy(repositions.solicitanteArea, repositions.type);
          console.log("Repositions query result:", repositionsQuery);
          const totalRepositions = repositionsQuery.reduce((sum, item) => sum + item.count, 0);
          console.log("Total repositions:", totalRepositions);
          if (totalRepositions === 0) {
            return {
              byArea: [],
              byAreaAndType: [],
              byCause: [],
              total: 0
            };
          }
          const areaMap = /* @__PURE__ */ new Map();
          repositionsQuery.forEach((item) => {
            const area = item.area || "Sin \xE1rea";
            if (!areaMap.has(area)) {
              areaMap.set(area, { count: 0, reposiciones: 0, reprocesos: 0 });
            }
            const areaData = areaMap.get(area);
            areaData.count += item.count;
            if (item.type === "repocision" || item.type === "reposici\xF3n") {
              areaData.reposiciones += item.count;
            } else if (item.type === "reproceso") {
              areaData.reprocesos += item.count;
            }
          });
          const byArea = await Promise.all(Array.from(areaMap.entries()).map(async ([area, data]) => {
            try {
              const areaPiecesQuery = await db.select({
                totalPieces: sql`COUNT(${repositionPieces.id})::int`
              }).from(repositionPieces).innerJoin(repositions, eq(repositionPieces.repositionId, repositions.id)).where(and(
                eq(repositions.solicitanteArea, area),
                gte(repositions.createdAt, startDate),
                lte(repositions.createdAt, endDate),
                ne(repositions.status, "eliminado")
              ));
              const pieces = areaPiecesQuery[0]?.totalPieces || 0;
              const percentage = totalRepositions > 0 ? Math.round(data.count / totalRepositions * 100) : 0;
              return {
                area,
                count: data.count,
                reposiciones: data.reposiciones,
                reprocesos: data.reprocesos,
                pieces,
                percentage
              };
            } catch (error) {
              console.error(`Error calculating pieces for area ${area}:`, error);
              return {
                area,
                count: data.count,
                reposiciones: data.reposiciones,
                reprocesos: data.reprocesos,
                pieces: 0,
                percentage: totalRepositions > 0 ? Math.round(data.count / totalRepositions * 100) : 0
              };
            }
          }));
          const byAreaAndType = repositionsQuery.map((item) => ({
            area: item.area || "Sin \xE1rea",
            type: item.type,
            count: item.count,
            percentage: totalRepositions > 0 ? Math.round(item.count / totalRepositions * 100) : 0
          }));
          const causesQuery = await db.select({
            cause: repositions.tipoAccidente,
            count: sql`COUNT(*)::int`
          }).from(repositions).where(and(
            gte(repositions.createdAt, startDate),
            lte(repositions.createdAt, endDate),
            ne(repositions.status, "eliminado"),
            isNotNull(repositions.tipoAccidente)
          )).groupBy(repositions.tipoAccidente);
          const totalCauses = causesQuery.reduce((sum, item) => sum + item.count, 0);
          const byCause = causesQuery.map((item) => ({
            cause: item.cause || "Sin especificar",
            count: item.count,
            percentage: totalCauses > 0 ? Math.round(item.count / totalCauses * 100) : 0
          }));
          const byCausativeAreaQuery = await db.select({
            area: repositions.areaCausanteDano,
            type: repositions.type,
            count: sql`COUNT(*)::int`
          }).from(repositions).where(and(
            gte(repositions.createdAt, startDate),
            lte(repositions.createdAt, endDate),
            ne(repositions.status, "eliminado"),
            isNotNull(repositions.areaCausanteDano)
          )).groupBy(repositions.areaCausanteDano, repositions.type);
          const causativeAreaMap = /* @__PURE__ */ new Map();
          byCausativeAreaQuery.forEach((item) => {
            const area = item.area || "Sin \xE1rea";
            if (!causativeAreaMap.has(area)) {
              causativeAreaMap.set(area, { count: 0, reposiciones: 0, reprocesos: 0 });
            }
            const areaData = causativeAreaMap.get(area);
            areaData.count += item.count;
            if (item.type === "repocision" || item.type === "reposici\xF3n") {
              areaData.reposiciones += item.count;
            } else if (item.type === "reproceso") {
              areaData.reprocesos += item.count;
            }
          });
          const totalCausativeArea = Array.from(causativeAreaMap.values()).reduce((sum, data) => sum + data.count, 0);
          const byCausativeArea = Array.from(causativeAreaMap.entries()).map(([area, data]) => {
            const percentage = totalCausativeArea > 0 ? Math.round(data.count / totalCausativeArea * 100) : 0;
            return {
              area,
              count: data.count,
              reposiciones: data.reposiciones,
              reprocesos: data.reprocesos,
              percentage
            };
          });
          const totalReposicionesCount = repositionsQuery.filter((item) => item.type === "repocision" || item.type === "reposici\xF3n").reduce((sum, item) => sum + item.count, 0);
          const totalReprocesos = repositionsQuery.filter((item) => item.type === "reproceso").reduce((sum, item) => sum + item.count, 0);
          const totalPieces = byArea.reduce((sum, item) => sum + item.pieces, 0);
          let mostActiveArea = "N/A";
          if (byArea.length > 0) {
            const sortedAreas = [...byArea].sort((a, b) => b.count - a.count);
            mostActiveArea = sortedAreas[0].area;
          }
          console.log("Final metrics result:", {
            byArea,
            byAreaAndType,
            byCause,
            byCausativeArea,
            total: totalRepositions,
            totalReposiciones: totalReposicionesCount,
            totalReprocesos,
            totalPieces,
            mostActiveArea
          });
          return {
            byArea,
            byAreaAndType,
            byCause,
            byCausativeArea,
            total: totalRepositions,
            totalReposiciones: totalReposicionesCount,
            totalReprocesos,
            totalPieces,
            mostActiveArea
          };
        } catch (error) {
          console.error("Get monthly metrics error:", error);
          throw new Error("Error al obtener m\xE9tricas mensuales: " + error.message);
        }
      }
      async getOverallMetrics() {
        console.log("Getting overall metrics...");
        const totalRepositionsQuery = await db.select({ count: sql`COUNT(*)::int` }).from(repositions).where(ne(repositions.status, "eliminado"));
        const totalRepositions = totalRepositionsQuery[0]?.count || 0;
        console.log("Total repositions:", totalRepositions);
        const totalPiecesQuery = await db.select({ count: sql`COUNT(*)::int` }).from(repositionPieces).innerJoin(repositions, eq(repositionPieces.repositionId, repositions.id)).where(ne(repositions.status, "eliminado"));
        const totalPieces = totalPiecesQuery[0]?.count || 0;
        console.log("Total pieces:", totalPieces);
        let mostActiveArea = "N/A";
        if (totalRepositions > 0) {
          const mostActiveAreaQuery = await db.select({
            area: repositions.solicitanteArea,
            count: sql`COUNT(*)::int`
          }).from(repositions).where(and(
            ne(repositions.status, "eliminado"),
            isNotNull(repositions.solicitanteArea)
          )).groupBy(repositions.solicitanteArea).orderBy(desc(sql`COUNT(*)::int`)).limit(1);
          mostActiveArea = mostActiveAreaQuery[0]?.area || "N/A";
        }
        console.log("Most active area:", mostActiveArea);
        const twelveMonthsAgo = /* @__PURE__ */ new Date();
        twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);
        const monthlyAvgQuery = await db.select({ count: sql`COUNT(*)::int` }).from(repositions).where(and(
          gte(repositions.createdAt, twelveMonthsAgo),
          ne(repositions.status, "eliminado")
        ));
        const monthlyAverage = Math.round((monthlyAvgQuery[0]?.count || 0) / 12);
        console.log("Monthly average:", monthlyAverage);
        const result = {
          totalRepositions,
          totalPieces,
          mostActiveArea,
          monthlyAverage
        };
        console.log("Overall metrics result:", result);
        return result;
      }
      async getRequestAnalysis() {
        console.log("Getting request analysis...");
        const requestsQuery = await db.select({
          noSolicitud: repositions.noSolicitud,
          type: repositions.type,
          count: sql`COUNT(*)::int`
        }).from(repositions).where(and(
          ne(repositions.status, "eliminado"),
          isNotNull(repositions.noSolicitud)
        )).groupBy(repositions.noSolicitud, repositions.type);
        console.log("Requests query result:", requestsQuery);
        const requestsMap = /* @__PURE__ */ new Map();
        requestsQuery.forEach((item) => {
          const key = item.noSolicitud;
          if (!requestsMap.has(key)) {
            requestsMap.set(key, { reposiciones: 0, reprocesos: 0 });
          }
          const data = requestsMap.get(key);
          if (item.type === "repocision" || item.type === "reposici\xF3n") {
            data.reposiciones += item.count;
          } else if (item.type === "reproceso") {
            data.reprocesos += item.count;
          }
        });
        console.log("Requests map:", requestsMap);
        const topRequests = Array.from(requestsMap.entries()).map(([noSolicitud, data]) => ({
          noSolicitud,
          reposiciones: data.reposiciones,
          reprocesos: data.reprocesos,
          total: data.reposiciones + data.reprocesos
        })).sort((a, b) => b.total - a.total).slice(0, 10);
        const totalRequestsWithRepositions = requestsMap.size;
        const allRepositionsCount = requestsQuery.reduce((sum, item) => sum + item.count, 0);
        const averageRepositionsPerRequest = totalRequestsWithRepositions > 0 ? Math.round(allRepositionsCount / totalRequestsWithRepositions * 100) / 100 : 0;
        const mostProblematicRequest = topRequests[0]?.noSolicitud || "N/A";
        const result = {
          totalRequestsWithRepositions,
          averageRepositionsPerRequest,
          mostProblematicRequest,
          topRequests
        };
        console.log("Request analysis result:", result);
        return result;
      }
      async exportMonthlyMetrics(month, year) {
        const workbook = new ExcelJS.Workbook();
        const metrics = await this.getMonthlyMetrics(month, year);
        const worksheet1 = workbook.addWorksheet("Por \xC1rea Solicitante");
        worksheet1.columns = [
          { header: "\xC1rea", key: "area", width: 15 },
          { header: "Total", key: "count", width: 15 },
          { header: "Reposiciones", key: "reposiciones", width: 15 },
          { header: "Reprocesos", key: "reprocesos", width: 15 },
          { header: "Piezas", key: "pieces", width: 15 },
          { header: "Porcentaje del Total", key: "percentage", width: 18 }
        ];
        metrics.byArea.forEach((item) => {
          worksheet1.addRow({
            area: item.area,
            count: item.count,
            reposiciones: item.reposiciones || 0,
            reprocesos: item.reprocesos || 0,
            pieces: item.pieces,
            percentage: `${item.percentage}%`
          });
        });
        const worksheet2 = workbook.addWorksheet("Causas de Da\xF1o");
        worksheet2.columns = [
          { header: "Causa", key: "cause", width: 30 },
          { header: "Cantidad", key: "count", width: 15 },
          { header: "Porcentaje", key: "percentage", width: 15 }
        ];
        metrics.byCause.forEach((item) => {
          worksheet2.addRow(item);
        });
        const worksheet3 = workbook.addWorksheet("Por \xC1rea Causante");
        worksheet3.columns = [
          { header: "\xC1rea Causante", key: "area", width: 20 },
          { header: "Total", key: "count", width: 15 },
          { header: "Reposiciones", key: "reposiciones", width: 15 },
          { header: "Reprocesos", key: "reprocesos", width: 15 },
          { header: "Porcentaje del Total", key: "percentage", width: 18 }
        ];
        if (metrics.byCausativeArea) {
          metrics.byCausativeArea.forEach((item) => {
            worksheet3.addRow({
              area: item.area,
              count: item.count,
              reposiciones: item.reposiciones || 0,
              reprocesos: item.reprocesos || 0,
              percentage: `${item.percentage}%`
            });
          });
        }
        [worksheet1, worksheet2, worksheet3].forEach((ws) => {
          ws.getRow(1).font = { bold: true };
          ws.getRow(1).fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: "FFE6E6E6" }
          };
        });
        const buffer = await workbook.xlsx.writeBuffer();
        return Buffer.from(buffer);
      }
      async exportCausativeAreaMetrics(month, year) {
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet("Por \xC1rea Causante");
        const metrics = await this.getMonthlyMetrics(month, year);
        worksheet.columns = [
          { header: "\xC1rea Causante", key: "area", width: 25 },
          { header: "Total", key: "count", width: 15 },
          { header: "Reposiciones", key: "reposiciones", width: 15 },
          { header: "Reprocesos", key: "reprocesos", width: 15 },
          { header: "Porcentaje", key: "percentage", width: 18 }
        ];
        if (metrics.byCausativeArea) {
          metrics.byCausativeArea.forEach((item) => {
            worksheet.addRow({
              area: item.area,
              count: item.count,
              reposiciones: item.reposiciones || 0,
              reprocesos: item.reprocesos || 0,
              percentage: `${item.percentage}%`
            });
          });
        }
        worksheet.getRow(1).font = { bold: true };
        worksheet.getRow(1).fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "FFE6E6E6" }
        };
        worksheet.eachRow((row, rowNumber) => {
          row.eachCell((cell) => {
            cell.border = {
              top: { style: "thin" },
              left: { style: "thin" },
              bottom: { style: "thin" },
              right: { style: "thin" }
            };
          });
        });
        const buffer = await workbook.xlsx.writeBuffer();
        return Buffer.from(buffer);
      }
      async exportOverallMetrics() {
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet("M\xE9tricas Generales");
        const metrics = await this.getOverallMetrics();
        worksheet.columns = [
          { header: "M\xE9trica", key: "metric", width: 25 },
          { header: "Valor", key: "value", width: 15 }
        ];
        worksheet.addRow({ metric: "Total Reposiciones", value: metrics.totalRepositions });
        worksheet.addRow({ metric: "Total Piezas", value: metrics.totalPieces });
        worksheet.addRow({ metric: "\xC1rea M\xE1s Activa", value: metrics.mostActiveArea });
        worksheet.addRow({ metric: "Promedio Mensual", value: metrics.monthlyAverage });
        worksheet.getRow(1).font = { bold: true };
        worksheet.getRow(1).fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "FFE6E6E6" }
        };
        const buffer = await workbook.xlsx.writeBuffer();
        return Buffer.from(buffer);
      }
      async exportRequestAnalysis() {
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet("An\xE1lisis de Solicitudes");
        worksheet.columns = [
          { header: "No. Solicitud", key: "noSolicitud", width: 15 },
          { header: "Total Reposiciones", key: "total", width: 18 },
          { header: "Reposiciones", key: "reposiciones", width: 15 },
          { header: "Reprocesos", key: "reprocesos", width: 15 }
        ];
        const analysis = await this.getRequestAnalysis();
        analysis.topRequests.forEach((request) => {
          worksheet.addRow(request);
        });
        worksheet.getRow(1).font = { bold: true };
        worksheet.getRow(1).fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "FFE6E6E6" }
        };
        worksheet.eachRow((row, rowNumber) => {
          row.eachCell((cell) => {
            cell.border = {
              top: { style: "thin" },
              left: { style: "thin" },
              bottom: { style: "thin" },
              right: { style: "thin" }
            };
          });
        });
        const buffer = await workbook.xlsx.writeBuffer();
        return Buffer.from(buffer);
      }
      async clearEntireDatabase(deleteUsers = false) {
        console.log("Starting complete database clear...");
        try {
          await db.delete(documents);
          await db.delete(repositionTimers);
          await db.delete(repositionTransfers);
          await db.delete(repositionHistory);
          await db.delete(repositionMaterials);
          await db.delete(repositionProducts);
          await db.delete(repositionContrastFabrics);
          await db.delete(repositionPieces);
          await db.delete(repositions);
          await db.delete(notifications);
          await db.delete(agendaEvents);
          await db.delete(adminPasswords);
          if (deleteUsers) {
            console.log("Deleting users (except admin)...");
            await db.delete(users).where(ne(users.area, "admin"));
          }
          console.log("Database cleared successfully");
        } catch (error) {
          console.error("Error clearing database:", error);
          throw new Error("Error al limpiar la base de datos: " + error.message);
        }
      }
      async backupUsers() {
        try {
          const allUsers = await db.select().from(users).orderBy(asc(users.id));
          const backup = {
            version: "1.0",
            timestamp: (/* @__PURE__ */ new Date()).toISOString(),
            users: allUsers.map((user) => ({
              id: user.id,
              username: user.username,
              name: user.name,
              area: user.area,
              password: user.password,
              // Incluir password hasheado para restauración completa
              createdAt: user.createdAt
            }))
          };
          console.log(`Backup created with ${backup.users.length} users`);
          return backup;
        } catch (error) {
          console.error("Error creating backup:", error);
          throw new Error("Error al crear respaldo de usuarios: " + error.message);
        }
      }
      async restoreUsers(backupData) {
        try {
          if (!backupData.users || !Array.isArray(backupData.users)) {
            throw new Error("Formato de respaldo inv\xE1lido");
          }
          let created = 0;
          let updated = 0;
          let errors = 0;
          for (const userData of backupData.users) {
            try {
              const existingUser = await this.getUserByUsername(userData.username);
              if (existingUser) {
                await db.update(users).set({
                  name: userData.name,
                  area: userData.area,
                  password: userData.password
                }).where(eq(users.id, existingUser.id));
                updated++;
              } else {
                await db.insert(users).values({
                  username: userData.username,
                  name: userData.name,
                  area: userData.area,
                  password: userData.password,
                  createdAt: userData.createdAt ? new Date(userData.createdAt) : /* @__PURE__ */ new Date()
                });
                created++;
              }
            } catch (userError) {
              console.error(`Error processing user ${userData.username}:`, userError);
              errors++;
            }
          }
          const result = {
            message: `Restauraci\xF3n completada: ${created} usuarios creados, ${updated} usuarios actualizados`,
            created,
            updated,
            errors
          };
          console.log("Restore completed:", result);
          return result;
        } catch (error) {
          console.error("Error restoring users:", error);
          throw new Error("Error al restaurar usuarios: " + error.message);
        }
      }
      async resetUserSequence() {
        try {
          await db.execute(sql`ALTER SEQUENCE users_id_seq RESTART WITH 1;`);
          console.log("User ID sequence reset successfully");
        } catch (error) {
          console.error("Error resetting user ID sequence:", error);
          throw new Error("Error al reiniciar la secuencia de ID de usuario: " + error.message);
        }
      }
      async updateReposition(repositionId, updateData, pieces, userId) {
        console.log("Updating reposition:", { repositionId, updateData, pieces: pieces.length });
        const existingReposition = await db.select().from(repositions).where(eq(repositions.id, repositionId)).limit(1);
        if (existingReposition.length === 0) {
          throw new Error("Reposici\xF3n no encontrada");
        }
        const existing = existingReposition[0];
        const preservedFields = {
          folio: existing.folio,
          solicitanteNombre: existing.solicitanteNombre,
          solicitanteArea: existing.solicitanteArea,
          // PRESERVE ORIGINAL CREATOR AREA
          fechaSolicitud: existing.fechaSolicitud,
          createdBy: existing.createdBy,
          createdAt: existing.createdAt
        };
        const {
          folio,
          solicitanteNombre,
          solicitanteArea,
          fechaSolicitud,
          createdBy,
          createdAt,
          productos,
          telaContraste,
          ...safeUpdateData
        } = updateData;
        const [updatedReposition] = await db.update(repositions).set({
          ...safeUpdateData,
          ...preservedFields,
          // Apply preserved fields
          status: "pendiente"
          // Reset to pending when edited
        }).where(eq(repositions.id, repositionId)).returning();
        console.log("Main reposition data updated");
        await db.delete(repositionPieces).where(eq(repositionPieces.repositionId, repositionId));
        await db.delete(repositionProducts).where(eq(repositionProducts.repositionId, repositionId));
        await db.delete(repositionContrastFabrics).where(eq(repositionContrastFabrics.repositionId, repositionId));
        console.log("Existing pieces, products, and contrast fabrics deleted");
        if (productos && productos.length > 0) {
          const productValues = productos.map((producto) => ({
            repositionId,
            modeloPrenda: producto.modeloPrenda,
            tela: producto.tela,
            color: producto.color,
            tipoPieza: producto.tipoPieza,
            consumoTela: producto.consumoTela || 0
          }));
          await db.insert(repositionProducts).values(productValues);
          console.log("New products inserted:", productValues.length);
        }
        if (pieces && pieces.length > 0) {
          const pieceValues = pieces.map((piece) => ({
            repositionId,
            talla: piece.talla,
            cantidad: piece.cantidad,
            folioOriginal: piece.folioOriginal || null
          }));
          await db.insert(repositionPieces).values(pieceValues);
          console.log("New pieces inserted:", pieceValues.length);
        }
        if (telaContraste && telaContraste.length > 0) {
          const fabricValues = telaContraste.map((tela) => ({
            repositionId,
            ubicacion: tela.ubicacion,
            tela: tela.tela,
            color: tela.color,
            consumo: tela.consumo || 0
          }));
          await db.insert(repositionContrastFabrics).values(fabricValues);
          console.log("New contrast fabrics inserted:", fabricValues.length);
        }
        await this.addRepositionHistory(
          repositionId,
          "updated",
          "Reposici\xF3n editada y reenviada para aprobaci\xF3n",
          userId
        );
        const reposition = await this.getRepositionById(repositionId);
        console.log("Updated reposition retrieved:", reposition?.folio);
        const approvalUsers = await db.select().from(users).where(or(
          eq(users.area, "admin"),
          eq(users.area, "envios"),
          eq(users.area, "operaciones")
        ));
        for (const user of approvalUsers) {
          await this.createNotification({
            userId: user.id,
            type: "new_reposition",
            title: "Reposici\xF3n Reenviada",
            message: `La reposici\xF3n ${reposition?.folio} ha sido editada y reenviada para aprobaci\xF3n`,
            repositionId
          });
        }
        console.log("Update reposition completed successfully");
        return updatedReposition;
      }
      async getRepositionProducts(repositionId) {
        return await db.select().from(repositionProducts).where(eq(repositionProducts.repositionId, repositionId));
      }
      async backupCompleteSystem() {
        try {
          console.log("Starting complete system backup...");
          console.log("Fetching users...");
          const allUsers = await db.select().from(users).orderBy(asc(users.id));
          console.log(`Found ${allUsers.length} users`);
          console.log("Fetching notifications...");
          const allNotifications = await db.select().from(notifications).orderBy(asc(notifications.id));
          console.log(`Found ${allNotifications.length} notifications`);
          console.log("Fetching repositions...");
          const allRepositions = await db.select().from(repositions).orderBy(asc(repositions.id));
          console.log(`Found ${allRepositions.length} repositions (including all statuses)`);
          console.log("Sample repositions:", allRepositions.slice(0, 3).map((r) => ({ id: r.id, folio: r.folio, status: r.status })));
          console.log("Fetching reposition pieces...");
          const allRepositionPieces = await db.select().from(repositionPieces).orderBy(asc(repositionPieces.id));
          console.log(`Found ${allRepositionPieces.length} reposition pieces`);
          console.log("Fetching reposition products...");
          const allRepositionProducts = await db.select().from(repositionProducts).orderBy(asc(repositionProducts.id));
          console.log(`Found ${allRepositionProducts.length} reposition products`);
          console.log("Fetching reposition timers...");
          const allRepositionTimers = await db.select().from(repositionTimers).orderBy(asc(repositionTimers.id));
          console.log(`Found ${allRepositionTimers.length} reposition timers`);
          console.log("Fetching reposition transfers...");
          const allRepositionTransfers = await db.select().from(repositionTransfers).orderBy(asc(repositionTransfers.id));
          console.log(`Found ${allRepositionTransfers.length} reposition transfers`);
          console.log("Fetching reposition history...");
          const allRepositionHistory = await db.select().from(repositionHistory).orderBy(asc(repositionHistory.id));
          console.log(`Found ${allRepositionHistory.length} reposition history entries`);
          console.log("Fetching reposition materials...");
          const allRepositionMaterials = await db.select().from(repositionMaterials).orderBy(asc(repositionMaterials.id));
          console.log(`Found ${allRepositionMaterials.length} reposition materials`);
          console.log("Fetching admin passwords...");
          const allAdminPasswords = await db.select().from(adminPasswords).orderBy(asc(adminPasswords.id));
          console.log(`Found ${allAdminPasswords.length} admin passwords`);
          console.log("Fetching agenda events...");
          const allAgendaEvents = await db.select().from(agendaEvents).orderBy(asc(agendaEvents.id));
          console.log(`Found ${allAgendaEvents.length} agenda events`);
          console.log("Fetching reposition contrast fabrics...");
          const allRepositionContrastFabrics = await db.select().from(repositionContrastFabrics).orderBy(asc(repositionContrastFabrics.id));
          console.log(`Found ${allRepositionContrastFabrics.length} reposition contrast fabrics`);
          console.log("Fetching documents...");
          const allDocuments = await db.select().from(documents).orderBy(asc(documents.id));
          console.log(`Found ${allDocuments.length} documents`);
          const backup = {
            version: "1.0",
            timestamp: (/* @__PURE__ */ new Date()).toISOString(),
            system: "JASANA",
            tables: {
              users: allUsers,
              notifications: allNotifications,
              repositions: allRepositions,
              repositionPieces: allRepositionPieces,
              repositionProducts: allRepositionProducts,
              repositionTimers: allRepositionTimers,
              repositionTransfers: allRepositionTransfers,
              repositionHistory: allRepositionHistory,
              repositionMaterials: allRepositionMaterials,
              adminPasswords: allAdminPasswords,
              agendaEvents: allAgendaEvents,
              documents: allDocuments,
              repositionContrastFabrics: allRepositionContrastFabrics
            },
            stats: {
              totalUsers: allUsers.length,
              totalNotifications: allNotifications.length,
              totalRepositions: allRepositions.length,
              totalRepositionPieces: allRepositionPieces.length,
              totalRepositionProducts: allRepositionProducts.length,
              totalRepositionTimers: allRepositionTimers.length,
              totalRepositionTransfers: allRepositionTransfers.length,
              totalRepositionHistory: allRepositionHistory.length,
              totalRepositionMaterials: allRepositionMaterials.length,
              totalAdminPasswords: allAdminPasswords.length,
              totalAgendaEvents: allAgendaEvents.length,
              totalDocuments: allDocuments.length,
              totalRepositionContrastFabrics: allRepositionContrastFabrics.length
            }
          };
          console.log("Complete system backup created successfully");
          console.log("Backup stats:", backup.stats);
          console.log("=== BACKUP VERIFICATION ===");
          console.log("Tables in backup:", Object.keys(backup.tables));
          console.log("Repositions in backup:", backup.tables.repositions.length);
          if (backup.tables.repositions.length > 0) {
            console.log("Sample repositions:", backup.tables.repositions.slice(0, 3).map((r) => ({
              id: r.id,
              folio: r.folio,
              status: r.status
            })));
          }
          console.log("RepositionPieces in backup:", backup.tables.repositionPieces.length);
          console.log("RepositionHistory in backup:", backup.tables.repositionHistory.length);
          console.log("RepositionTransfers in backup:", backup.tables.repositionTransfers.length);
          console.log("RepositionProducts in backup:", backup.tables.repositionProducts.length);
          console.log("RepositionTimers in backup:", backup.tables.repositionTimers.length);
          console.log("RepositionMaterials in backup:", backup.tables.repositionMaterials.length);
          console.log("=== END VERIFICATION ===");
          return backup;
        } catch (error) {
          console.error("Backup complete system error:", error);
          throw new Error("Error al crear respaldo completo del sistema: " + error.message);
        }
      }
      async restoreCompleteSystem(backupData) {
        try {
          if (!backupData || typeof backupData !== "object") {
            throw new Error("Formato de respaldo inv\xE1lido - no es un objeto v\xE1lido");
          }
          console.log("Backup data keys:", Object.keys(backupData));
          const isUserBackup = backupData.users && Array.isArray(backupData.users) && !backupData.tables;
          const isSystemBackup = backupData.tables && typeof backupData.tables === "object";
          if (!isUserBackup && !isSystemBackup) {
            throw new Error(`Formato de respaldo inv\xE1lido - debe ser un respaldo de usuarios o del sistema completo. Propiedades encontradas: ${Object.keys(backupData).join(", ")}`);
          }
          if (isUserBackup) {
            console.log("Detectado respaldo de usuarios, convirtiendo a formato de sistema...");
            const originalUsers = backupData.users;
            backupData = {
              version: backupData.version || "1.0",
              timestamp: backupData.timestamp || (/* @__PURE__ */ new Date()).toISOString(),
              system: "JASANA",
              tables: {
                users: originalUsers
              }
            };
            console.log("Respaldo convertido exitosamente con", originalUsers.length, "usuarios");
          }
          if (backupData.tables) {
            const mainProperties = ["users", "repositions", "notifications"];
            for (const prop of mainProperties) {
              if (backupData.tables.hasOwnProperty(prop) && !Array.isArray(backupData.tables[prop])) {
                throw new Error(`Formato de respaldo inv\xE1lido - tables.${prop} debe ser un array`);
              }
            }
          }
          let restored = {
            users: 0,
            notifications: 0,
            adminPasswords: 0,
            agendaEvents: 0,
            documents: 0,
            repositions: 0,
            repositionPieces: 0,
            repositionProducts: 0,
            repositionTimers: 0,
            repositionTransfers: 0,
            repositionHistory: 0,
            repositionMaterials: 0,
            repositionContrastFabrics: 0,
            errors: 0
          };
          if (backupData.tables.users && Array.isArray(backupData.tables.users)) {
            console.log(`Restaurando ${backupData.tables.users.length} usuarios...`);
            for (const userData of backupData.tables.users) {
              try {
                const existingUser = await this.getUserByUsername(userData.username);
                if (!existingUser) {
                  await db.insert(users).values({
                    ...userData,
                    createdAt: userData.createdAt ? new Date(userData.createdAt) : /* @__PURE__ */ new Date()
                  });
                  restored.users++;
                  console.log(`Usuario ${userData.username} restaurado exitosamente`);
                } else {
                  console.log(`Usuario ${userData.username} ya existe, omitiendo`);
                }
              } catch (error) {
                console.error(`Error restoring user ${userData.username}:`, error);
                restored.errors++;
              }
            }
            console.log(`Usuarios procesados: ${restored.users} creados`);
          }
          if (backupData.tables.repositions && Array.isArray(backupData.tables.repositions)) {
            console.log(`Restaurando ${backupData.tables.repositions.length} reposiciones...`);
            if (backupData.tables.repositions.length > 0) {
              console.log("Sample repositions to restore:", backupData.tables.repositions.slice(0, 3).map((r) => ({
                folio: r.folio,
                status: r.status,
                type: r.type,
                solicitanteArea: r.solicitanteArea
              })));
            }
            for (const repositionData of backupData.tables.repositions) {
              try {
                const existingReposition = await db.select().from(repositions).where(eq(repositions.folio, repositionData.folio)).limit(1);
                if (existingReposition.length === 0) {
                  const insertData = {
                    ...repositionData,
                    fechaSolicitud: repositionData.fechaSolicitud ? new Date(repositionData.fechaSolicitud) : /* @__PURE__ */ new Date(),
                    createdAt: repositionData.createdAt ? new Date(repositionData.createdAt) : /* @__PURE__ */ new Date(),
                    completedAt: repositionData.completedAt ? new Date(repositionData.completedAt) : null,
                    approvedAt: repositionData.approvedAt ? new Date(repositionData.approvedAt) : null
                  };
                  console.log(`Inserting reposition ${repositionData.folio} with status: ${repositionData.status}`);
                  await db.insert(repositions).values(insertData);
                  restored.repositions++;
                } else {
                  console.log(`Reposici\xF3n ${repositionData.folio} ya existe, omitiendo`);
                }
              } catch (error) {
                console.error(`Error restoring reposition ${repositionData.folio}:`, error);
                restored.errors++;
              }
            }
            console.log(`Reposiciones procesadas: ${restored.repositions} creadas`);
            const totalAfterRestore = await db.select({ count: sql`COUNT(*)::int` }).from(repositions);
            console.log(`Total repositions in database after restore: ${totalAfterRestore[0]?.count || 0}`);
          }
          if (backupData.tables.repositionPieces && Array.isArray(backupData.tables.repositionPieces)) {
            console.log(`Restaurando ${backupData.tables.repositionPieces.length} piezas de reposiciones...`);
            for (const pieceData of backupData.tables.repositionPieces) {
              try {
                await db.insert(repositionPieces).values({
                  ...pieceData,
                  createdAt: pieceData.createdAt ? new Date(pieceData.createdAt) : /* @__PURE__ */ new Date()
                }).onConflictDoNothing();
                restored.repositionPieces++;
              } catch (error) {
                console.error(`Error restoring reposition piece:`, error);
                restored.errors++;
              }
            }
            console.log(`Piezas de reposiciones procesadas: ${restored.repositionPieces} restauradas`);
          }
          if (backupData.tables.repositionProducts && Array.isArray(backupData.tables.repositionProducts)) {
            console.log(`Restaurando ${backupData.tables.repositionProducts.length} productos de reposiciones...`);
            for (const productData of backupData.tables.repositionProducts) {
              try {
                await db.insert(repositionProducts).values({
                  ...productData,
                  createdAt: productData.createdAt ? new Date(productData.createdAt) : /* @__PURE__ */ new Date()
                }).onConflictDoNothing();
                restored.repositionProducts++;
              } catch (error) {
                console.error(`Error restoring reposition product:`, error);
                restored.errors++;
              }
            }
            console.log(`Productos de reposiciones procesadas: ${restored.repositionProducts} restaurados`);
          }
          if (backupData.tables.repositionTransfers && Array.isArray(backupData.tables.repositionTransfers)) {
            console.log(`Restaurando ${backupData.tables.repositionTransfers.length} transferencias de reposiciones...`);
            for (const transferData of backupData.tables.repositionTransfers) {
              try {
                await db.insert(repositionTransfers).values({
                  ...transferData,
                  createdAt: transferData.createdAt ? new Date(transferData.createdAt) : /* @__PURE__ */ new Date(),
                  processedAt: transferData.processedAt ? new Date(transferData.processedAt) : null
                }).onConflictDoNothing();
                restored.repositionTransfers++;
              } catch (error) {
                console.error(`Error restoring reposition transfer:`, error);
                restored.errors++;
              }
            }
            console.log(`Transferencias de reposiciones procesadas: ${restored.repositionTransfers} restauradas`);
          }
          if (backupData.tables.repositionHistory && Array.isArray(backupData.tables.repositionHistory)) {
            console.log(`Restaurando ${backupData.tables.repositionHistory.length} entradas de historial de reposiciones...`);
            for (const historyData of backupData.tables.repositionHistory) {
              try {
                await db.insert(repositionHistory).values({
                  ...historyData,
                  createdAt: historyData.createdAt ? new Date(historyData.createdAt) : /* @__PURE__ */ new Date()
                }).onConflictDoNothing();
                restored.repositionHistory++;
              } catch (error) {
                console.error(`Error restoring reposition history:`, error);
                restored.errors++;
              }
            }
            console.log(`Historial de reposiciones procesado: ${restored.repositionHistory} entradas restauradas`);
          }
          if (backupData.tables.notifications) {
            for (const notificationData of backupData.tables.notifications) {
              try {
                await db.insert(notifications).values({
                  ...notificationData,
                  createdAt: notificationData.createdAt ? new Date(notificationData.createdAt) : /* @__PURE__ */ new Date()
                }).onConflictDoNothing();
                restored.notifications++;
              } catch (error) {
                console.error(`Error restoring notification:`, error);
                restored.errors++;
              }
            }
          }
          if (backupData.tables.documents) {
            for (const documentData of backupData.tables.documents) {
              try {
                await db.insert(documents).values({
                  ...documentData,
                  createdAt: documentData.createdAt ? new Date(documentData.createdAt) : /* @__PURE__ */ new Date()
                }).onConflictDoNothing();
                restored.documents++;
              } catch (error) {
                console.error(`Error restoring document:`, error);
                restored.errors++;
              }
            }
          }
          if (backupData.tables.agendaEvents) {
            for (const eventData of backupData.tables.agendaEvents) {
              try {
                await db.insert(agendaEvents).values({
                  ...eventData,
                  createdAt: eventData.createdAt ? new Date(eventData.createdAt) : /* @__PURE__ */ new Date(),
                  updatedAt: eventData.updatedAt ? new Date(eventData.updatedAt) : /* @__PURE__ */ new Date()
                }).onConflictDoNothing();
                restored.agendaEvents++;
              } catch (error) {
                console.error(`Error restoring agenda event:`, error);
                restored.errors++;
              }
            }
          }
          if (backupData.tables.repositionTimers && Array.isArray(backupData.tables.repositionTimers)) {
            console.log(`Restaurando ${backupData.tables.repositionTimers.length} timers de reposiciones...`);
            for (const timerData of backupData.tables.repositionTimers) {
              try {
                await db.insert(repositionTimers).values({
                  ...timerData,
                  createdAt: timerData.createdAt ? new Date(timerData.createdAt) : /* @__PURE__ */ new Date(),
                  startTime: timerData.startTime ? new Date(timerData.startTime) : null,
                  endTime: timerData.endTime ? new Date(timerData.endTime) : null
                }).onConflictDoNothing();
                restored.repositionTimers++;
              } catch (error) {
                console.error(`Error restoring reposition timer:`, error);
                restored.errors++;
              }
            }
            console.log(`Timers de reposiciones procesados: ${restored.repositionTimers} restaurados`);
          }
          if (backupData.tables.repositionMaterials && Array.isArray(backupData.tables.repositionMaterials)) {
            console.log(`Restaurando ${backupData.tables.repositionMaterials.length} materiales de reposiciones...`);
            for (const materialData of backupData.tables.repositionMaterials) {
              try {
                await db.insert(repositionMaterials).values({
                  ...materialData,
                  createdAt: materialData.createdAt ? new Date(materialData.createdAt) : /* @__PURE__ */ new Date(),
                  updatedAt: materialData.updatedAt ? new Date(materialData.updatedAt) : /* @__PURE__ */ new Date(),
                  pausedAt: materialData.pausedAt ? new Date(materialData.pausedAt) : null,
                  resumedAt: materialData.resumedAt ? new Date(materialData.resumedAt) : null
                }).onConflictDoNothing();
                restored.repositionMaterials++;
              } catch (error) {
                console.error(`Error restoring reposition material:`, error);
                restored.errors++;
              }
            }
            console.log(`Materiales de reposiciones procesados: ${restored.repositionMaterials} restaurados`);
          }
          if (backupData.tables.repositionContrastFabrics && Array.isArray(backupData.tables.repositionContrastFabrics)) {
            console.log(`Restaurando ${backupData.tables.repositionContrastFabrics.length} contrastes de telas...`);
            for (const contrastData of backupData.tables.repositionContrastFabrics) {
              try {
                await db.insert(repositionContrastFabrics).values({
                  ...contrastData,
                  createdAt: contrastData.createdAt ? new Date(contrastData.createdAt) : /* @__PURE__ */ new Date()
                }).onConflictDoNothing();
                restored.repositionContrastFabrics++;
              } catch (error) {
                console.error(`Error restoring reposition contrast fabric:`, error);
                restored.errors++;
              }
            }
            console.log(`Contrastes de telas procesados: ${restored.repositionContrastFabrics} restaurados`);
          }
          if (backupData.tables.adminPasswords && Array.isArray(backupData.tables.adminPasswords)) {
            console.log(`Restaurando ${backupData.tables.adminPasswords.length} contrase\xF1as de admin...`);
            for (const passwordData of backupData.tables.adminPasswords) {
              try {
                await db.insert(adminPasswords).values({
                  ...passwordData,
                  createdAt: passwordData.createdAt ? new Date(passwordData.createdAt) : /* @__PURE__ */ new Date()
                }).onConflictDoNothing();
                restored.adminPasswords++;
              } catch (error) {
                console.error(`Error restoring admin password:`, error);
                restored.errors++;
              }
            }
            console.log(`Contrase\xF1as de admin procesadas: ${restored.adminPasswords} restauradas`);
          }
          console.log("Complete system restore completed");
          const totalRestored = Object.values(restored).reduce(
            (sum, val) => typeof val === "number" ? sum + val : sum,
            0
          );
          return {
            message: `Restauraci\xF3n del sistema completada: ${totalRestored} elementos restaurados total`,
            restored,
            summary: {
              totalRestored,
              hasErrors: restored.errors > 0
            },
            backupInfo: {
              version: backupData.version,
              timestamp: backupData.timestamp,
              originalStats: backupData.stats
            }
          };
        } catch (error) {
          console.error("Restore complete system error:", error);
          if (error.message.includes("Formato de respaldo inv\xE1lido")) {
            throw error;
          }
          throw new Error(`Error al restaurar el sistema completo: ${error.message}`);
        }
      }
      async getSystemSetting(key) {
        const [setting] = await db.select().from(systemSettings).where(eq(systemSettings.key, key));
        return setting?.value;
      }
      async setSystemSetting(key, value, userId) {
        const existing = await this.getSystemSetting(key);
        if (existing !== void 0) {
          await db.update(systemSettings).set({ value, updatedBy: userId, updatedAt: /* @__PURE__ */ new Date() }).where(eq(systemSettings.key, key));
        } else {
          await db.insert(systemSettings).values({
            key,
            value,
            updatedBy: userId,
            updatedAt: /* @__PURE__ */ new Date()
          });
        }
      }
    };
    storage = new DatabaseStorage();
  }
});

// server/auth.ts
var auth_exports = {};
__export(auth_exports, {
  authenticateToken: () => authenticateToken,
  hashPassword: () => hashPassword,
  setupAuth: () => setupAuth
});
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import session2 from "express-session";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import connectPg2 from "connect-pg-simple";
async function hashPassword(password) {
  const salt = randomBytes(16).toString("hex");
  const buf = await scryptAsync(password, salt, 64);
  return `${buf.toString("hex")}.${salt}`;
}
async function comparePasswords(supplied, stored) {
  const [hashed, salt] = stored.split(".");
  const hashedBuf = Buffer.from(hashed, "hex");
  const suppliedBuf = await scryptAsync(supplied, salt, 64);
  return timingSafeEqual(hashedBuf, suppliedBuf);
}
function authenticateToken(req, res, next) {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: "Autenticaci\xF3n requerida" });
  }
  next();
}
function setupAuth(app2) {
  const PostgresSessionStore2 = connectPg2(session2);
  const sessionSettings = {
    secret: process.env.SESSION_SECRET || "jasana-secret-key-12345",
    resave: false,
    saveUninitialized: false,
    store: new PostgresSessionStore2({
      pool,
      createTableIfMissing: true
    }),
    cookie: {
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1e3
    }
  };
  app2.set("trust proxy", 1);
  app2.use(session2(sessionSettings));
  app2.use(passport.initialize());
  app2.use(passport.session());
  passport.use(
    new LocalStrategy(async (username, password, done) => {
      try {
        const user = await storage.getUserByUsername(username);
        if (!user) {
          return done(null, false, { message: "Usuario no encontrado" });
        }
        if (!await comparePasswords(password, user.password)) {
          return done(null, false, { message: "Contrase\xF1a incorrecta" });
        }
        console.log(`[AUTH] Checking user: ${username}`, {
          id: user.id,
          isActive: user.isActive,
          allKeys: Object.keys(user)
        });
        if (!user.isActive) {
          console.log(`[AUTH] Login denied for deactivated user: ${username}`);
          return done(null, false, { message: "Tu cuenta est\xE1 desactivada. Contacta al administrador." });
        }
        console.log(`[AUTH] Login successful for user: ${username} (Active: ${user.isActive})`);
        return done(null, user);
      } catch (error) {
        console.error(`[AUTH] Error during login for ${username}:`, error);
        return done(error);
      }
    })
  );
  passport.serializeUser((user, done) => done(null, user.id));
  passport.deserializeUser(async (id, done) => {
    try {
      const user = await storage.getUser(id);
      if (user && !user.isActive) {
        console.log(`[AUTH] Session rejected for deactivated user ID: ${id}`);
        return done(null, false);
      }
      done(null, user);
    } catch (error) {
      console.error(`[AUTH] Error during deserializeUser for ID ${id}:`, error);
      done(error);
    }
  });
  app2.post("/api/register", async (req, res, next) => {
    try {
      const { username, password, name, area, adminPassword } = req.body;
      const existingUser = await storage.getUserByUsername(username);
      if (existingUser) {
        return res.status(400).json({ message: "Usuario ya existe" });
      }
      if (area !== "admin") {
        const adminUsers = await storage.getAllAdminUsers();
        if (!adminUsers || adminUsers.length === 0 || !adminPassword) {
          return res.status(400).json({ message: "Se requiere clave de admin" });
        }
        let isAdminPasswordValid = false;
        for (const adminUser of adminUsers) {
          const isValid = await comparePasswords(adminPassword, adminUser.password);
          if (isValid) {
            isAdminPasswordValid = true;
            break;
          }
        }
        if (!isAdminPasswordValid) {
          return res.status(400).json({ message: "Contrase\xF1a no valida" });
        }
      }
      const user = await storage.createUser({
        username,
        password: await hashPassword(password),
        name,
        area
      });
      req.login(user, (err) => {
        if (err) return next(err);
        res.status(201).json(user);
      });
    } catch (error) {
      next(error);
    }
  });
  app2.post("/api/login", (req, res, next) => {
    passport.authenticate("local", (err, user, info) => {
      if (err) {
        return res.status(500).json({ message: "Error interno del servidor" });
      }
      if (!user) {
        const message = info?.message || "Credenciales incorrectas";
        return res.status(401).json({ message });
      }
      req.login(user, (err2) => {
        if (err2) {
          return res.status(500).json({ message: "Error al iniciar sesi\xF3n" });
        }
        res.status(200).json(user);
      });
    })(req, res, next);
  });
  app2.post("/api/logout", (req, res, next) => {
    req.logout((err) => {
      if (err) return next(err);
      res.sendStatus(200);
    });
  });
  app2.get("/api/user", (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    console.log(`[AUTH] Sending user data for /api/user:`, {
      id: req.user.id,
      username: req.user.username,
      isActive: req.user.isActive
    });
    res.json(req.user);
  });
  app2.post("/api/admin/reset-password", async (req, res) => {
    try {
      if (!req.isAuthenticated() || req.user?.area !== "admin") {
        return res.status(403).json({ message: "Clave admin requerida" });
      }
      const { userId, newPassword } = req.body;
      const hashedPassword = await hashPassword(newPassword);
      await storage.resetUserPassword(userId, hashedPassword);
      res.json({ message: "Se restablecio la contrase\xF1a" });
    } catch (error) {
      res.status(500).json({ message: "No se restablecio la contrase\xF1a" });
    }
  });
}
var scryptAsync;
var init_auth = __esm({
  "server/auth.ts"() {
    "use strict";
    init_storage();
    init_db();
    scryptAsync = promisify(scrypt);
  }
});

// server/index.ts
import express3 from "express";

// server/routes.ts
init_auth();
init_storage();
init_db();
init_schema();
init_auth();
import { Router } from "express";
import { createServer } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { eq as eq3, desc as desc2, and as and2, ne as ne2, isNull as isNull2 } from "drizzle-orm";

// server/services/backup-service.ts
init_db();
init_schema();
import cron from "node-cron";
import { spawn } from "child_process";
import path from "path";
import fs from "fs";
import { eq as eq2 } from "drizzle-orm";
var HOME_DIR = process.env.HOME || "/home/victor";
var BACKUP_DIR = path.join(HOME_DIR, "Documentos", "Backups_Jasana");
if (!fs.existsSync(BACKUP_DIR)) {
  try {
    fs.mkdirSync(BACKUP_DIR, { recursive: true });
    console.log(`[BACKUP SERVICE] Directorio de respaldos creado en: ${BACKUP_DIR}`);
  } catch (error) {
    console.error(`[BACKUP SERVICE] Error al crear el directorio en Documentos, usando fallback: ${error}`);
  }
}
var BackupService = class {
  currentJob = null;
  async init() {
    console.log("[BACKUP SERVICE] Iniciando servicio de respaldos autom\xE1ticos...");
    await this.reschedule();
  }
  async reschedule() {
    if (this.currentJob) {
      this.currentJob.stop();
      this.currentJob = null;
    }
    try {
      const config = await this.getConfig();
      if (!config || !config.enabled) {
        console.log("[BACKUP SERVICE] Respaldos autom\xE1ticos desactivados.");
        return;
      }
      const cronExpression = this.getCronExpression(config);
      console.log(`[BACKUP SERVICE] Programando respaldo: ${cronExpression} (${config.frequency})`);
      this.currentJob = cron.schedule(cronExpression, async () => {
        try {
          await this.runBackup();
        } catch (error) {
          console.error("[BACKUP SERVICE] Error en la ejecuci\xF3n programada:", error);
        }
      });
    } catch (error) {
      console.error("[BACKUP SERVICE] Error al configurar el cron:", error);
    }
  }
  async getConfig() {
    try {
      const [setting] = await db.select().from(systemSettings).where(eq2(systemSettings.key, "backup_config"));
      if (!setting) return null;
      return JSON.parse(setting.value);
    } catch (error) {
      console.error("[BACKUP SERVICE] Error al obtener configuraci\xF3n de la DB:", error);
      return null;
    }
  }
  getCronExpression(config) {
    const { minute = 0, hour = 3, frequency, dayOfWeek, dayOfMonth } = config;
    if (frequency === "daily") {
      return `${minute} ${hour} * * *`;
    } else if (frequency === "weekly") {
      return `${minute} ${hour} * * ${dayOfWeek ?? 0}`;
    } else if (frequency === "monthly") {
      return `${minute} ${hour} ${dayOfMonth ?? 1} * *`;
    }
    return `${minute} ${hour} * * *`;
  }
  async runBackup() {
    console.log("[BACKUP SERVICE] Iniciando respaldo autom\xE1tico...");
    const timestamp2 = (/* @__PURE__ */ new Date()).toISOString().replace(/[:.]/g, "-").split("T")[0];
    const filename = `auto-backup-${timestamp2}-${Date.now()}.backup`;
    const filepath = path.join(BACKUP_DIR, filename);
    const connectionString2 = process.env.DATABASE_URL || "postgresql://postgres:12345@localhost:5432/jasanaordenes";
    return new Promise((resolve, reject) => {
      const pgDump = spawn("pg_dump", ["-F", "c", "-f", filepath, "-d", connectionString2]);
      pgDump.on("close", (code) => {
        if (code === 0) {
          console.log(`[BACKUP SERVICE] Respaldo completado: ${filename}`);
          this.cleanupOldBackups().then(() => resolve(true));
        } else {
          console.error(`[BACKUP SERVICE] pg_dump fall\xF3 con c\xF3digo ${code}`);
          reject(new Error(`pg_dump failed with code ${code}`));
        }
      });
      pgDump.on("error", (err) => {
        console.error("[BACKUP SERVICE] Error fatal ejecutando pg_dump:", err);
        reject(err);
      });
    });
  }
  async cleanupOldBackups() {
    try {
      const config = await this.getConfig();
      const keepLast = config?.keepLast || 10;
      const files = fs.readdirSync(BACKUP_DIR).filter((f) => f.startsWith("auto-backup-")).map((f) => ({ name: f, time: fs.statSync(path.join(BACKUP_DIR, f)).mtime.getTime() })).sort((a, b) => b.time - a.time);
      if (files.length > keepLast) {
        files.slice(keepLast).forEach((f) => {
          fs.unlinkSync(path.join(BACKUP_DIR, f.name));
          console.log(`[BACKUP SERVICE] Depurado respaldo antiguo: ${f.name}`);
        });
      }
    } catch (error) {
      console.error("[BACKUP SERVICE] Error al limpiar archivos antiguos:", error);
    }
  }
  async listBackups() {
    if (!fs.existsSync(BACKUP_DIR)) return [];
    return fs.readdirSync(BACKUP_DIR).filter((f) => f.startsWith("auto-backup-")).map((f) => {
      const stats = fs.statSync(path.join(BACKUP_DIR, f));
      return {
        filename: f,
        size: stats.size,
        createdAt: stats.mtime
      };
    }).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }
  getBackupPath(filename) {
    const safeName = path.basename(filename);
    const filepath = path.join(BACKUP_DIR, safeName);
    if (fs.existsSync(filepath)) return filepath;
    return null;
  }
};
var backupService = new BackupService();

// server/routes.ts
import path3 from "path";
import fs3 from "fs";
import express from "express";

// server/upload.ts
import multer from "multer";
import path2 from "path";
import fs2 from "fs";
var uploadsDir = path2.join(process.cwd(), "uploads");
if (!fs2.existsSync(uploadsDir)) {
  fs2.mkdirSync(uploadsDir, { recursive: true });
}
var storage2 = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, uploadsDir);
  },
  filename: function(req, file, cb) {
    const timestamp2 = Date.now();
    const randomNum = Math.floor(Math.random() * 1e9);
    const extension = path2.extname(file.originalname);
    const baseName = path2.basename(file.originalname, extension);
    cb(null, `${file.fieldname}-${timestamp2}-${randomNum}${extension}`);
  }
});
var fileFilter = (req, file, cb) => {
  const allowedMimes = [
    "application/pdf",
    "image/jpeg",
    "image/jpg",
    "image/png",
    "application/xml",
    "text/xml"
  ];
  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Tipo de archivo no permitido. Solo se permiten archivos PDF, XML, JPG, PNG y JPEG."), false);
  }
};
var backupFileFilter = (req, file, cb) => {
  const allowedMimes = [
    "application/json",
    "text/plain",
    // Para archivos .json que algunos navegadores detectan como text/plain
    "application/octet-stream",
    "application/x-tar",
    "application/sql",
    "application/x-sql"
  ];
  const fileExtension = file.originalname.toLowerCase().split(".").pop();
  const allowedExtensions = ["json", "backup", "sql", "tar", "dump"];
  if (allowedMimes.includes(file.mimetype) || allowedExtensions.includes(fileExtension)) {
    cb(null, true);
  } else {
    cb(new Error("Formato de archivo no permitido. Extensiones v\xE1lidas: .json, .backup, .sql, .tar, .dump"), false);
  }
};
var upload = multer({
  storage: storage2,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024,
    // 10MB límite
    files: 5
    // máximo 5 archivos
  }
});
var uploadBackup = multer({
  storage: storage2,
  // Usar disco en lugar de memoria por los archivos de BD pesados
  fileFilter: backupFileFilter,
  limits: {
    fileSize: 500 * 1024 * 1024,
    // 500MB límite para archivos de respaldo
    files: 1
    // solo 1 archivo
  }
});
var handleMulterError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({ message: "El archivo es demasiado grande. Excede el l\xEDmite permitido." });
    }
    if (err.code === "LIMIT_FILE_COUNT") {
      return res.status(400).json({ message: "Demasiados archivos. M\xE1ximo 5 archivos" });
    }
  }
  if (err && err.message.includes("Formato de archivo no permitido")) {
    return res.status(400).json({ message: err.message });
  }
  if (err && err.message.includes("Solo se permiten archivos .json")) {
    return res.status(400).json({ message: err.message });
  }
  if (err) {
    console.error("Upload error:", err);
    return res.status(400).json({ message: "Error al subir archivo" });
  }
  next();
};

// server/routes.ts
import ExcelJS2 from "exceljs";
function registerRoutes(app2) {
  setupAuth(app2);
  app2.post("/api/public/pg-restore-init", uploadBackup.single("backup"), handleMulterError, async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No se proporcion\xF3 archivo de respaldo" });
      }
      const connectionString2 = process.env.DATABASE_URL || "postgresql://postgres:12345@localhost:5432/jasanaordenes";
      const createDbFirst = req.body.createDb === "true";
      const { spawn: spawn2, exec } = await import("child_process");
      const { promisify: promisify2 } = await import("util");
      const execAsync = promisify2(exec);
      const filePath = req.file.path;
      const fileExtension = req.file.originalname.toLowerCase().split(".").pop();
      if (createDbFirst) {
        try {
          const baseUrl = connectionString2.substring(0, connectionString2.lastIndexOf("/"));
          const defaultDbUrl = `${baseUrl}/postgres`;
          const dbName = connectionString2.substring(connectionString2.lastIndexOf("/") + 1);
          console.log(`Intentando crear la base de datos ${dbName}...`);
          await execAsync(`psql -d "${defaultDbUrl}" -c "CREATE DATABASE \\"${dbName}\\";"`);
          console.log("Base de datos creada o ya exist\xEDa.");
        } catch (e) {
          console.log("Error al crear BD (quiz\xE1s ya existe):", e.message);
        }
      }
      console.log("Restaurando BD desde archivo inicial:", filePath, "Extension:", fileExtension);
      let childProcess;
      if (fileExtension === "sql") {
        childProcess = spawn2("psql", ["-d", connectionString2, "-f", filePath]);
      } else {
        childProcess = spawn2("pg_restore", ["-c", "--if-exists", "-1", "-d", connectionString2, filePath]);
      }
      childProcess.stderr.on("data", (data) => {
        console.log(`Restore Init stderr: ${data}`);
      });
      childProcess.on("error", (err) => {
        console.error("Error fatal al ejecutar psql/pg_restore para restore-init:", err);
        fs3.unlink(filePath, (unlinkErr) => {
          if (unlinkErr) console.error("Error al eliminar archivo temporal de restore init en fallback de error:", unlinkErr);
        });
        if (!res.headersSent) {
          res.status(500).json({
            message: `Error al restaurar la base de datos: ${err.message}. Aseg\xFArese de que PostgreSQL est\xE9 instalado y en la variable de entorno PATH.`
          });
        }
      });
      childProcess.on("close", (code) => {
        fs3.unlink(filePath, (err) => {
          if (err) console.error("Error al eliminar archivo temporal de restore init:", err);
        });
        if (code === 0) {
          if (!res.headersSent) {
            res.json({ message: "Base de datos restaurada exitosamente desde modo rescate" });
          }
        } else {
          console.error(`Restore init process exited with code ${code}`);
          if (!res.headersSent) {
            res.status(500).json({ message: `Error durante la restauraci\xF3n. C\xF3digo de salida: ${code}` });
          }
        }
      });
    } catch (error) {
      console.error("PG Restore Init error:", error);
      res.status(500).json({ message: "Error al restaurar la base de datos: " + error.message });
    }
  });
  app2.use("/uploads", express.static(path3.join(process.cwd(), "uploads")));
  app2.post("/api/admin/upload-image", authenticateToken, upload.single("image"), handleMulterError, async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No se subi\xF3 ninguna imagen" });
      }
      res.json({ url: `/uploads/${req.file.filename}` });
    } catch (error) {
      console.error("Error uploading image:", error);
      res.status(500).json({ error: "Error al subir la imagen" });
    }
  });
  registerNotificationRoutes(app2);
  registerRepositionRoutes(app2);
  registerAdminRoutes(app2);
  registerDashboardRoutes(app2);
  registerReportsRoutes(app2);
  registerAgendaRoutes(app2);
  registerAlmacenRoutes(app2);
  registerSettingsRoutes(app2);
  registerMetricsRoutes(app2);
  const httpServer = configureWebSocket(app2);
  return httpServer;
}
function registerNotificationRoutes(app2) {
  const router = Router();
  router.get("/", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Autenticaci\xF3n requerida" });
    try {
      const user = req.user;
      const notifications2 = await storage.getUserNotifications(user.id);
      console.log(`Fetched ${notifications2.length} notifications for user ${user.id} (${user.area})`);
      res.json(notifications2);
    } catch (error) {
      console.error("Get notifications error:", error);
      res.status(500).json({ message: "Error al obtener notificaciones" });
    }
  });
  router.post("/:id/read", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Autenticaci\xF3n requerida" });
    try {
      await storage.markNotificationRead(parseInt(req.params.id));
      res.json({ message: "Notificaci\xF3n marcada como le\xEDda" });
    } catch (error) {
      console.error("Mark notification read error:", error);
      res.status(500).json({ message: "Error al marcar la notificaci\xF3n" });
    }
  });
  router.post("/clear-all", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Autenticaci\xF3n requerida" });
    try {
      const user = req.user;
      await storage.clearAllUserNotifications(user.id);
      res.json({ message: "Todas las notificaciones han sido limpiadas" });
    } catch (error) {
      console.error("Clear all notifications error:", error);
      res.status(500).json({ message: "Error al limpiar las notificaciones" });
    }
  });
  app2.use("/api/notifications", router);
}
function registerAdminRoutes(app2) {
  const router = Router();
  router.use((req, res, next) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Autenticaci\xF3n requerida" });
    const user = req.user;
    if (user.area !== "admin" && user.area !== "envios") {
      return res.status(403).json({ message: "Se requiere acceso de administrador o env\xEDos" });
    }
    next();
  });
  router.get("/users", async (req, res) => {
    if (req.user?.area !== "admin") return res.status(403).json({ message: "Se requiere acceso de administrador" });
    try {
      const users2 = await storage.getAllUsers();
      res.json(users2);
    } catch (error) {
      console.error("Get users error:", error);
      res.status(500).json({ message: "Error al obtener usuarios" });
    }
  });
  router.delete("/users/:id", async (req, res) => {
    if (req.user?.area !== "admin") return res.status(403).json({ message: "Se requiere acceso de administrador" });
    try {
      const result = await storage.deleteUserById(req.params.id);
      if (result) {
        return res.status(200).json({ message: "Usuario eliminado correctamente" });
      } else {
        return res.status(404).json({ message: "Usuario no encontrado" });
      }
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: "Error al eliminar el usuario" });
    }
  });
  router.post("/reset-password", async (req, res) => {
    if (req.user?.area !== "admin") return res.status(403).json({ message: "Se requiere acceso de administrador" });
    try {
      const { userId, newPassword } = req.body;
      if (!userId || !newPassword) return res.status(400).json({ message: "Faltan campos requeridos" });
      const { hashPassword: hashPassword2 } = await Promise.resolve().then(() => (init_auth(), auth_exports));
      const hashedPassword = await hashPassword2(newPassword);
      await storage.resetUserPassword(userId, hashedPassword);
      res.json({ message: "Contrase\xF1a restablecida correctamente" });
    } catch (error) {
      console.error("Reset password error:", error);
      res.status(500).json({ message: "Error al restablecer la contrase\xF1a" });
    }
  });
  router.post("/users", async (req, res) => {
    if (req.user?.area !== "admin") return res.status(403).json({ message: "Se requiere acceso de administrador" });
    try {
      const { name, username, area, password } = req.body;
      console.log("Create user request:", { name, username, area, hasPassword: !!password });
      if (!name || !username || !area || !password) {
        console.log("Missing required fields");
        return res.status(400).json({ message: "Todos los campos son requeridos" });
      }
      const existingUser = await storage.getUserByUsername(username);
      if (existingUser) {
        console.log("Username already exists");
        return res.status(400).json({ message: "El nombre de usuario ya est\xE1 en uso" });
      }
      const { hashPassword: hashPassword2 } = await Promise.resolve().then(() => (init_auth(), auth_exports));
      const hashedPassword = await hashPassword2(password);
      const userData = {
        name: name.trim(),
        username: username.trim(),
        area,
        password: hashedPassword
      };
      const user = await storage.createUser(userData);
      console.log("User created successfully:", user.id);
      res.status(201).json({ message: "Usuario creado correctamente", user });
    } catch (error) {
      console.error("Create user error:", error);
      res.status(500).json({ message: "Error al crear el usuario", error: error.message });
    }
  });
  router.post("/clear-database", async (req, res) => {
    if (req.user?.area !== "admin") return res.status(403).json({ message: "Se requiere acceso de administrador" });
    try {
      const { deleteUsers } = req.body;
      console.log("Clear database request with deleteUsers:", deleteUsers);
      await storage.clearEntireDatabase(deleteUsers);
      res.json({ message: "Base de datos limpiada correctamente" });
    } catch (error) {
      console.error("Clear database error:", error);
      res.status(500).json({ message: "Error al limpiar la base de datos" });
    }
  });
  router.post("/reset-user-sequence", async (req, res) => {
    if (req.user?.area !== "admin") return res.status(403).json({ message: "Se requiere acceso de administrador" });
    try {
      await storage.resetUserSequence();
      res.json({ message: "Secuencia de usuarios reiniciada correctamente" });
    } catch (error) {
      console.error("Reset user sequence error:", error);
      res.status(500).json({ message: "Error al reiniciar secuencia de usuarios" });
    }
  });
  router.post("/fix-sequences", async (req, res) => {
    if (req.user?.area !== "admin" && req.user?.area !== "envios") {
      return res.status(403).json({ message: "Se requiere acceso de administrador o env\xEDos" });
    }
    try {
      console.log("Fixing all database sequences...");
      await storage.fixAllSequences();
      res.json({ message: "Secuencias de base de datos reparadas correctamente" });
    } catch (error) {
      console.error("Fix sequences error:", error);
      res.status(500).json({ message: "Error al reparar secuencias" });
    }
  });
  router.get("/sequences/:table", async (req, res) => {
    try {
      const { table } = req.params;
      const allowedTables = ["users", "orders", "order_pieces", "order_history", "repositions", "reposition_pieces", "reposition_products", "reposition_history", "notifications", "documents"];
      if (!allowedTables.includes(table)) {
        return res.status(400).json({ message: "Tabla no permitida para gesti\xF3n de secuencias" });
      }
      const data = await storage.getSequenceData(table);
      if (!data) {
        return res.status(404).json({ message: "No se pudo obtener informaci\xF3n de la secuencia" });
      }
      res.json(data);
    } catch (error) {
      console.error("Get sequence error:", error);
      res.status(500).json({ message: "Error al obtener informaci\xF3n de secuencia" });
    }
  });
  router.post("/sequences", async (req, res) => {
    try {
      const { table, value } = req.body;
      if (!table || value === void 0) {
        return res.status(400).json({ message: "Tabla y valor son requeridos" });
      }
      const allowedTables = ["users", "orders", "order_pieces", "order_history", "repositions", "reposition_pieces", "reposition_products", "reposition_history", "notifications", "documents"];
      if (!allowedTables.includes(table)) {
        return res.status(400).json({ message: "Tabla no permitida para gesti\xF3n de secuencias" });
      }
      const numValue = parseInt(value);
      if (isNaN(numValue) || numValue < 1) {
        return res.status(400).json({ message: "El valor debe ser un n\xFAmero entero positivo" });
      }
      await storage.setSequenceValue(table, numValue);
      res.json({ message: `Secuencia de ${table} actualizada correctamente a ${numValue}` });
    } catch (error) {
      console.error("Set sequence error:", error);
      res.status(500).json({ message: "Error al actualizar secuencia" });
    }
  });
  router.get("/backup-users", async (req, res) => {
    if (req.user?.area !== "admin") return res.status(403).json({ message: "Se requiere acceso de administrador" });
    try {
      const backup = await storage.backupUsers();
      res.setHeader("Content-Type", "application/json");
      res.setHeader("Content-Disposition", `attachment; filename="backup-usuarios-${(/* @__PURE__ */ new Date()).toISOString().split("T")[0]}.json"`);
      res.json(backup);
    } catch (error) {
      console.error("Backup users error:", error);
      res.status(500).json({ message: "Error al generar respaldo de usuarios" });
    }
  });
  router.post("/restore-users", uploadBackup.single("backup"), handleMulterError, async (req, res) => {
    if (req.user?.area !== "admin") return res.status(403).json({ message: "Se requiere acceso de administrador" });
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No se proporcion\xF3 archivo de respaldo" });
      }
      const fileExtension = req.file.originalname.toLowerCase().split(".").pop();
      if (fileExtension !== "json") {
        return res.status(400).json({ message: "Solo se permiten archivos .json para restaurar usuarios" });
      }
      const backupData = JSON.parse(req.file.buffer.toString("utf8"));
      const result = await storage.restoreUsers(backupData);
      res.json(result);
    } catch (error) {
      console.error("Restore users error:", error);
      res.status(500).json({ message: "Error al restaurar usuarios: " + error.message });
    }
  });
  router.get("/backup-complete-system", async (req, res) => {
    if (req.user?.area !== "admin") return res.status(403).json({ message: "Se requiere acceso de administrador" });
    try {
      const backup = await storage.backupCompleteSystem();
      res.setHeader("Content-Type", "application/json");
      res.setHeader("Content-Disposition", `attachment; filename="backup-completo-jasana-${(/* @__PURE__ */ new Date()).toISOString().split("T")[0]}.json"`);
      res.json(backup);
    } catch (error) {
      console.error("Backup complete system error:", error);
      res.status(500).json({ message: "Error al generar respaldo completo del sistema" });
    }
  });
  router.post("/restore-complete-system", uploadBackup.single("backup"), handleMulterError, async (req, res) => {
    if (req.user?.area !== "admin") return res.status(403).json({ message: "Se requiere acceso de administrador" });
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No se proporcion\xF3 archivo de respaldo" });
      }
      console.log("Archivo recibido:", req.file.originalname, "Tama\xF1o:", req.file.size);
      let backupContent;
      let backupData;
      try {
        backupContent = req.file.buffer.toString("utf-8");
        console.log("Contenido le\xEDdo, primeros 200 caracteres:", backupContent.substring(0, 200));
      } catch (error) {
        return res.status(400).json({ message: "Error al leer el archivo de respaldo" });
      }
      try {
        backupData = JSON.parse(backupContent);
        console.log("JSON parseado exitosamente");
      } catch (error) {
        return res.status(400).json({ message: "El archivo no contiene JSON v\xE1lido" });
      }
      await storage.restoreCompleteSystem(backupData);
      res.json({
        message: "Sistema restaurado exitosamente",
        timestamp: (/* @__PURE__ */ new Date()).toISOString()
      });
    } catch (error) {
      console.error("Error en restauraci\xF3n completa:", error);
      let statusCode = 500;
      if (error.message.includes("Formato de respaldo inv\xE1lido")) {
        statusCode = 400;
      }
      res.status(statusCode).json({
        message: error.message || "Error al restaurar el sistema completo"
      });
    }
  });
  router.get("/pg-backup", async (req, res) => {
    if (req.user?.area !== "admin") return res.status(403).json({ message: "Se requiere acceso de administrador" });
    try {
      const format = req.query.format || "custom";
      let pgFormat = "c";
      let extension = "backup";
      let mimeType = "application/octet-stream";
      if (format === "plain") {
        pgFormat = "p";
        extension = "sql";
        mimeType = "application/sql";
      } else if (format === "tar") {
        pgFormat = "t";
        extension = "tar";
        mimeType = "application/x-tar";
      }
      const filename = `jasana-db-${format}-${(/* @__PURE__ */ new Date()).toISOString().split("T")[0]}.${extension}`;
      res.setHeader("Content-Type", mimeType);
      res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
      const connectionString2 = process.env.DATABASE_URL || "postgresql://postgres:12345@localhost:5432/jasanaordenes";
      const { spawn: spawn2 } = await import("child_process");
      const pgDump = spawn2("pg_dump", ["-F", pgFormat, "-d", connectionString2]);
      pgDump.stdout.pipe(res);
      pgDump.stderr.on("data", (data) => {
        console.error(`pg_dump stderr: ${data}`);
      });
      pgDump.on("error", (err) => {
        console.error("Error fatal al ejecutar pg_dump para backup:", err);
        if (!res.headersSent) {
          res.status(500).json({
            message: `Error al generar el respaldo: ${err.message}. Aseg\xFArese de que PostgreSQL est\xE9 instalado y en la variable de entorno PATH.`
          });
        }
      });
      pgDump.on("close", (code) => {
        if (code !== 0) {
          console.error(`pg_dump process exited with code ${code}`);
          if (!res.headersSent) {
            res.status(500).json({ message: "Error al generar el respaldo de la base de datos" });
          }
        }
      });
    } catch (error) {
      console.error("PG Backup error:", error);
      if (!res.headersSent) {
        res.status(500).json({ message: "Error al generar el respaldo: " + error.message });
      }
    }
  });
  router.post("/pg-restore", uploadBackup.single("backup"), handleMulterError, async (req, res) => {
    if (req.user?.area !== "admin") return res.status(403).json({ message: "Se requiere acceso de administrador" });
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No se proporcion\xF3 archivo de respaldo" });
      }
      const connectionString2 = process.env.DATABASE_URL || "postgresql://postgres:12345@localhost:5432/jasanaordenes";
      const { spawn: spawn2 } = await import("child_process");
      const filePath = req.file.path;
      const fileExtension = req.file.originalname.toLowerCase().split(".").pop();
      console.log("Restaurando BD desde archivo:", filePath, "Extension:", fileExtension);
      let childProcess;
      if (fileExtension === "sql") {
        childProcess = spawn2("psql", ["-d", connectionString2, "-f", filePath]);
      } else {
        childProcess = spawn2("pg_restore", ["-c", "--if-exists", "-1", "-d", connectionString2, filePath]);
      }
      childProcess.stderr.on("data", (data) => {
        console.log(`Restore stderr: ${data}`);
      });
      childProcess.on("error", (err) => {
        console.error("Error fatal al ejecutar psql/pg_restore para restore:", err);
        fs3.unlink(filePath, (unlinkErr) => {
          if (unlinkErr) console.error("Error al eliminar archivo temporal de restore en fallback de error:", unlinkErr);
        });
        if (!res.headersSent) {
          res.status(500).json({
            message: `Error al restaurar la base de datos: ${err.message}. Aseg\xFArese de que PostgreSQL est\xE9 instalado y en la variable de entorno PATH.`
          });
        }
      });
      childProcess.on("close", (code) => {
        fs3.unlink(filePath, (err) => {
          if (err) console.error("Error al eliminar archivo temporal de restore:", err);
        });
        if (code === 0) {
          if (!res.headersSent) {
            res.json({ message: "Base de datos restaurada exitosamente" });
          }
        } else {
          console.error(`Restore process exited with code ${code}`);
          if (!res.headersSent) {
            res.status(500).json({ message: `Error durante la restauraci\xF3n. C\xF3digo de salida: ${code}` });
          }
        }
      });
    } catch (error) {
      console.error("PG Restore error:", error);
      res.status(500).json({ message: "Error al restaurar la base de datos: " + error.message });
    }
  });
  router.get("/backup-config", async (req, res) => {
    if (req.user?.area !== "admin") return res.status(403).json({ message: "Se requiere acceso de administrador" });
    try {
      const [setting] = await db.select().from(systemSettings).where(eq3(systemSettings.key, "backup_config"));
      res.json(setting?.value || { enabled: false, frequency: "daily", hour: 3, minute: 0, keepLast: 10 });
    } catch (error) {
      console.error("Get backup config error:", error);
      res.status(500).json({ message: "Error al obtener configuraci\xF3n de respaldos" });
    }
  });
  router.post("/backup-config", async (req, res) => {
    if (req.user?.area !== "admin") return res.status(403).json({ message: "Se requiere acceso de administrador" });
    try {
      const config = req.body;
      const [existing] = await db.select().from(systemSettings).where(eq3(systemSettings.key, "backup_config"));
      if (existing) {
        await db.update(systemSettings).set({ value: config }).where(eq3(systemSettings.key, "backup_config"));
      } else {
        await db.insert(systemSettings).values({ key: "backup_config", value: config });
      }
      await backupService.reschedule();
      res.json({ message: "Configuraci\xF3n de respaldos actualizada correctamente" });
    } catch (error) {
      console.error("Save backup config error:", error);
      res.status(500).json({ message: "Error al guardar configuraci\xF3n de respaldos" });
    }
  });
  router.get("/backups/auto", async (req, res) => {
    if (req.user?.area !== "admin") return res.status(403).json({ message: "Se requiere acceso de administrador" });
    try {
      const backups = await backupService.listBackups();
      res.json(backups);
    } catch (error) {
      console.error("List backups error:", error);
      res.status(500).json({ message: "Error al listar respaldos autom\xE1ticos" });
    }
  });
  router.get("/backups/auto/:filename", async (req, res) => {
    if (req.user?.area !== "admin") return res.status(403).json({ message: "Se requiere acceso de administrador" });
    try {
      const { filename } = req.params;
      const filepath = backupService.getBackupPath(filename);
      if (!filepath) return res.status(404).json({ message: "Archivo no encontrado" });
      res.download(filepath);
    } catch (error) {
      console.error("Download backup error:", error);
      res.status(500).json({ message: "Error al descargar respaldo" });
    }
  });
  router.put("/users/:id", async (req, res) => {
    if (req.user?.area !== "admin") return res.status(403).json({ message: "Se requiere acceso de administrador" });
    try {
      const userId = parseInt(req.params.id);
      const { name, username, area, newPassword } = req.body;
      console.log("Update user request:", { userId, name, username, area, hasPassword: !!newPassword });
      if (isNaN(userId)) {
        return res.status(400).json({ message: "ID de usuario inv\xE1lido" });
      }
      const currentUser = await storage.getUser(userId);
      if (!currentUser) {
        return res.status(404).json({ message: "Usuario no encontrado" });
      }
      if (username && username !== currentUser.username) {
        const existingUser = await storage.getUserByUsername(username);
        if (existingUser && existingUser.id !== userId) {
          return res.status(400).json({ message: "El nombre de usuario ya est\xE1 en uso" });
        }
      }
      const updateData = {
        name: name || currentUser.name,
        username: username || currentUser.username,
        area: area || currentUser.area,
        isActive: req.body.isActive !== void 0 ? req.body.isActive : currentUser.isActive
      };
      if (newPassword && newPassword.trim() !== "") {
        const { hashPassword: hashPassword2 } = await Promise.resolve().then(() => (init_auth(), auth_exports));
        const hashedPassword = await hashPassword2(newPassword);
        updateData.password = hashedPassword;
        console.log("Password will be updated");
      }
      await storage.updateUser(userId, updateData);
      console.log("User updated successfully");
      res.json({ message: "Usuario actualizado correctamente" });
    } catch (error) {
      console.error("Update user error:", error);
      res.status(500).json({ message: "Error al actualizar el usuario", error: error.message });
    }
  });
  router.get("/db-stats", async (req, res) => {
    if (req.user?.area !== "admin") return res.status(403).json({ message: "Se requiere acceso de administrador" });
    try {
      const result = await pool.query("SELECT pg_size_pretty(pg_database_size(current_database())) as size");
      res.json({ size: result.rows[0].size });
    } catch (error) {
      console.error("Get db stats error:", error);
      res.status(500).json({ message: "Error al obtener estad\xEDsticas de la base de datos" });
    }
  });
  app2.use("/api/admin", router);
}
function registerDashboardRoutes(app2) {
  app2.get("/api/dashboard/stats", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Autenticaci\xF3n requerida" });
    try {
      const user = req.user;
      const allRepositions = await storage.getAllRepositions(false);
      const userAreaRepositions = await storage.getRepositions(user.area, user.area);
      const pendingTransfers = await storage.getPendingRepositionTransfers(user.area);
      const stats = {
        activeOrders: allRepositions.filter((r) => r.status !== "completado" && r.status !== "cancelado").length,
        myAreaOrders: userAreaRepositions.filter((r) => r.status !== "completado" && r.status !== "cancelado").length,
        pendingTransfers: pendingTransfers.length,
        completedToday: allRepositions.filter(
          (r) => r.status === "completado" && r.completedAt && new Date(r.completedAt).toDateString() === (/* @__PURE__ */ new Date()).toDateString()
        ).length
      };
      res.json(stats);
    } catch (error) {
      console.error("Get dashboard stats error:", error);
      res.status(500).json({ message: "Error al obtener estad\xEDsticas del tablero" });
    }
  });
  app2.get("/api/dashboard/recent-activity", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Autenticaci\xF3n requerida" });
    try {
      const user = req.user;
      let repositionsQuery = db.select({
        id: repositions.id,
        folio: repositions.folio,
        type: repositions.type,
        status: repositions.status,
        currentArea: repositions.currentArea,
        createdAt: repositions.createdAt,
        solicitanteNombre: repositions.solicitanteNombre,
        modeloPrenda: repositions.modeloPrenda,
        urgencia: repositions.urgencia
      }).from(repositions).where(ne2(repositions.status, "eliminado")).orderBy(desc2(repositions.createdAt)).limit(3);
      const recentRepositions = await repositionsQuery;
      res.json({
        repositions: recentRepositions
      });
    } catch (error) {
      console.error("Get recent activity error:", error);
      res.status(500).json({ message: "Error al obtener actividad reciente" });
    }
  });
}
function configureWebSocket(app2) {
  const httpServer = createServer(app2);
  const wss = new WebSocketServer({ server: httpServer, path: "/ws" });
  const broadcastToAll = (notification) => {
    console.log("Enviando notificaci\xF3n a todos los usuarios conectados:", notification);
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        try {
          client.send(JSON.stringify({
            type: "notification",
            data: notification
          }));
        } catch (error) {
          console.error("Error al enviar notificaci\xF3n WebSocket:", error);
        }
      }
    });
  };
  wss.on("connection", (ws) => {
    console.log("Nueva conexi\xF3n WebSocket establecida");
    ws.on("message", (message) => {
      try {
        const data = JSON.parse(message.toString());
        console.log("Mensaje WebSocket recibido:", data);
        broadcastToAll(data);
      } catch (error) {
        console.error("Error al procesar mensaje WebSocket:", error);
      }
    });
    ws.on("close", () => {
      console.log("Conexi\xF3n WebSocket cerrada");
    });
    ws.on("error", (error) => {
      console.error("Error en conexi\xF3n WebSocket:", error);
    });
    ws.send(JSON.stringify({
      type: "connection",
      data: { message: "Conectado exitosamente al sistema de notificaciones" }
    }));
  });
  httpServer.wss = wss;
  httpServer.broadcast = broadcastToAll;
  app2.set("httpServer", httpServer);
  return httpServer;
}
function registerRepositionRoutes(app2) {
  const router = Router();
  router.post("/", authenticateToken, upload.array("documents", 5), handleMulterError, async (req, res) => {
    try {
      const user = req.user;
      const allowedAreas = ["corte", "bordado", "ensamble", "plancha", "calidad", "envios", "admin", "maquilas", "patronaje"];
      if (!allowedAreas.includes(user.area)) {
        return res.status(403).json({ message: "Su \xE1rea no tiene permisos para crear reposiciones" });
      }
      let repositionData;
      if (req.body.repositionData) {
        repositionData = JSON.parse(req.body.repositionData);
      } else {
        repositionData = req.body;
      }
      const { pieces, productos, telaContraste, ...mainData } = repositionData;
      if (mainData.type === "reproceso") {
        if (!mainData.volverHacer || !mainData.materialesImplicados) {
          return res.status(400).json({ message: "Los campos 'volverHacer' y 'materialesImplicados' son requeridos para reprocesos" });
        }
      }
      const files = req.files;
      const now = /* @__PURE__ */ new Date();
      const month = String(now.getMonth() + 1).padStart(2, "0");
      const year = String(now.getFullYear()).slice(-2);
      const counter = await storage.getNextRepositionCounter();
      const folio = `JN-REQ-${month}-${year}-${String(counter).padStart(3, "0")}`;
      const reposition = await storage.createReposition({
        ...mainData,
        folio,
        currentArea: user.area,
        solicitanteArea: user.area,
        productos,
        telaContraste
      }, pieces || [], user.id);
      if (files && files.length > 0) {
        for (const file of files) {
          await storage.saveRepositionDocument({
            repositionId: reposition.id,
            filename: file.filename,
            originalName: file.originalname,
            size: file.size,
            path: file.path,
            uploadedBy: user.id
          });
        }
      }
      const autoApprove = await storage.getSystemSetting("reposition_auto_approve");
      let finalReposition = reposition;
      if (autoApprove === "true") {
        console.log("Auto-approving reposition:", reposition.id);
        const approved = await storage.approveReposition(
          reposition.id,
          "aprobado",
          user.id,
          // Using the creator ID as approver if auto-approved, or we might want a system ID? Using creator for now or Admin if possible.
          "Aprobaci\xF3n autom\xE1tica por sistema"
        );
        finalReposition = approved;
      } else {
        finalReposition = reposition;
      }
      res.status(201).json(finalReposition);
    } catch (error) {
      console.error("Create reposition error:", error);
      res.status(400).json({ message: "Error al crear la solicitud de reposici\xF3n" });
    }
  });
  router.get("/", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Autenticaci\xF3n requerida" });
    try {
      const user = req.user;
      const area = req.query.area;
      let repositions2;
      if (user.area === "dise\xF1o" || user.area === "almacen") {
        console.log(`User is from ${user.area} area, filtering approved repositions`);
        repositions2 = await storage.getRepositions(void 0, "dise\xF1o");
      } else if (user.area === "admin" || user.area === "envios") {
        if (area && area !== "all") {
          repositions2 = await storage.getRepositionsByArea(area, user.id);
        } else {
          repositions2 = await storage.getAllRepositions(false);
        }
      } else if (area && area !== "all") {
        repositions2 = await storage.getRepositionsByArea(area, user.id);
      } else {
        repositions2 = await storage.getRepositionsByArea(user.area, user.id);
      }
      res.json(repositions2);
    } catch (error) {
      console.error("Get repositions error:", error);
      res.status(500).json({ message: "Error al cargar las reposiciones" });
    }
  });
  router.get("/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Autenticaci\xF3n requerida" });
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "ID de reposici\xF3n inv\xE1lido" });
      }
      const reposition = await storage.getRepositionById(id);
      if (!reposition) {
        return res.status(404).json({ message: "Reposici\xF3n no encontrada" });
      }
      res.json(reposition);
    } catch (error) {
      console.error("Get reposition error:", error);
      res.status(500).json({ message: "Error al obtener la reposici\xF3n" });
    }
  });
  router.get("/:id/pieces", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Autenticaci\xF3n requerida" });
    try {
      const repositionId = parseInt(req.params.id);
      if (isNaN(repositionId)) {
        return res.status(400).json({ message: "ID de reposici\xF3n inv\xE1lido" });
      }
      const pieces = await storage.getRepositionPieces(repositionId);
      console.log("Pieces from endpoint:", pieces);
      res.json(pieces);
    } catch (error) {
      console.error("Get reposition pieces error:", error);
      res.status(500).json({ message: "Error al obtener piezas de la reposici\xF3n" });
    }
  });
  router.post("/:id/transfer", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Autenticaci\xF3n requerida" });
    try {
      const user = req.user;
      const repositionId = parseInt(req.params.id);
      if (isNaN(repositionId)) {
        return res.status(400).json({ message: "ID de reposici\xF3n inv\xE1lido" });
      }
      const { toArea, notes, consumoTela } = req.body;
      const reposition = await storage.getRepositionById(repositionId);
      if (!reposition) {
        return res.status(404).json({ message: "Reposici\xF3n no encontrada" });
      }
      if (reposition.status !== "aprobado") {
        return res.status(400).json({ message: "Solo se pueden transferir reposiciones aprobadas" });
      }
      const recentTransferCheck = await storage.hasRecentTransfer(repositionId, user.area);
      if (recentTransferCheck.hasRecent) {
        console.log(`Transfer blocked for reposition ${repositionId} from area ${user.area}, remaining time: ${recentTransferCheck.remainingTime} minutes`);
        return res.status(429).json({
          message: `\u23F1\uFE0F Debes esperar ${recentTransferCheck.remainingTime} minuto(s) antes de poder transferir nuevamente. Hay una transferencia pendiente de procesamiento desde tu \xE1rea.`,
          remainingTime: recentTransferCheck.remainingTime,
          type: "rate_limit"
        });
      }
      let shouldRequireTime = false;
      if (reposition.solicitanteArea !== user.area) {
        shouldRequireTime = true;
      } else {
        const history = await storage.getRepositionHistory(repositionId);
        const transfersToCreatorArea = history.filter(
          (entry) => entry.action === "transfer_accepted" && entry.toArea === reposition.solicitanteArea
        ).length;
        if (transfersToCreatorArea > 0) {
          shouldRequireTime = true;
        }
      }
      if (shouldRequireTime) {
        const timer = await storage.getRepositionTimer(repositionId, user.area);
        if (!timer || !timer.manualStartTime && !timer.startTime) {
          return res.status(400).json({
            message: "Debe registrar el tiempo de trabajo antes de transferir la reposici\xF3n.",
            type: "timer_required"
          });
        }
      }
      const existingPendingTransfers = await db.select().from(repositionTransfers).where(and2(
        eq3(repositionTransfers.repositionId, repositionId),
        eq3(repositionTransfers.fromArea, user.area),
        eq3(repositionTransfers.status, "pending")
      ));
      if (existingPendingTransfers.length > 0) {
        console.log(`Found existing pending transfer for reposition ${repositionId} from area ${user.area}`);
        return res.status(429).json({
          message: `Ya existe una transferencia pendiente desde tu \xE1rea para esta reposici\xF3n. Espera a que sea procesada antes de crear una nueva.`,
          type: "pending_exists"
        });
      }
      if (user.area === "corte" && consumoTela !== void 0) {
        await storage.updateRepositionConsumo(repositionId, consumoTela);
      }
      const transfer = await storage.createRepositionTransfer({
        repositionId,
        fromArea: user.area,
        toArea,
        notes
      }, user.id);
      res.status(201).json(transfer);
    } catch (error) {
      console.error("Transfer reposition error:", error);
      res.status(400).json({ message: "Error al crear transferencia de reposici\xF3n" });
    }
  });
  router.post("/:id/approval", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Autenticaci\xF3n requerida" });
    try {
      const user = req.user;
      if (user.area !== "operaciones" && user.area !== "admin" && user.area !== "envios") {
        return res.status(403).json({ message: "Solo Operaciones, Administraci\xF3n o Env\xEDos pueden aprobar o rechazar" });
      }
      const repositionId = parseInt(req.params.id);
      if (isNaN(repositionId)) {
        return res.status(400).json({ message: "ID de reposici\xF3n inv\xE1lido" });
      }
      const { action, notes } = req.body;
      if (action === "rechazado") {
        if (!notes || notes.trim().length === 0) {
          return res.status(400).json({ message: "El motivo del rechazo es obligatorio" });
        }
        if (notes.trim().length < 10) {
          return res.status(400).json({ message: "El motivo del rechazo debe tener al menos 10 caracteres" });
        }
      }
      const result = await storage.approveReposition(repositionId, action, user.id, notes);
      res.json(result);
    } catch (error) {
      console.error("Approve reposition error:", error);
      res.status(400).json({ message: "Error al procesar la aprobaci\xF3n" });
    }
  });
  router.put("/:id", authenticateToken, upload.array("documents", 5), handleMulterError, async (req, res) => {
    try {
      const user = req.user;
      const repositionId = parseInt(req.params.id);
      console.log("Edit reposition request:", { repositionId, userId: user?.id, hasUser: !!user });
      if (isNaN(repositionId)) {
        return res.status(400).json({ message: "ID de reposici\xF3n inv\xE1lido" });
      }
      if (!user) {
        return res.status(401).json({ message: "Usuario no autenticado" });
      }
      const existingReposition = await storage.getRepositionById(repositionId);
      if (!existingReposition) {
        return res.status(404).json({ message: "Reposici\xF3n no encontrada" });
      }
      console.log("Existing reposition:", {
        id: existingReposition.id,
        status: existingReposition.status,
        createdBy: existingReposition.createdBy
      });
      const canEdit = existingReposition.status === "rechazado" && existingReposition.createdBy === user.id || (user.area === "envios" || user.area === "admin");
      if (!canEdit) {
        if (existingReposition.status !== "rechazado") {
          return res.status(400).json({ message: "Solo se pueden editar reposiciones rechazadas o si eres de env\xEDos/admin" });
        } else {
          return res.status(403).json({ message: "Solo el creador puede editar reposiciones rechazadas, o usuarios de env\xEDos/admin pueden editar cualquier reposici\xF3n" });
        }
      }
      console.log("Received reposition update request. Body keys:", Object.keys(req.body));
      let repositionData;
      try {
        if (req.body.repositionData) {
          console.log("Parsing repositionData from string...");
          repositionData = JSON.parse(req.body.repositionData);
        } else {
          console.log("Using req.body as repositionData");
          repositionData = req.body;
        }
      } catch (parseError) {
        console.error("Error parsing repository data:", parseError);
        return res.status(400).json({ message: "Datos de reposici\xF3n inv\xE1lidos" });
      }
      console.log("Parsed reposition data structure:", {
        type: repositionData.type,
        folio: repositionData.noSolicitud,
        hasProductos: !!repositionData.productos,
        productosLength: repositionData.productos?.length,
        hasPieces: !!repositionData.pieces,
        piecesLength: repositionData.pieces?.length
      });
      if (!repositionData.type) {
        console.error("Missing type in repositionData");
        return res.status(400).json({ message: "El tipo de solicitud es requerido" });
      }
      const { pieces, productos, telaContraste, ...mainData } = repositionData;
      let allPieces = [];
      if (repositionData.type === "reposici\xF3n" && productos && productos.length > 0) {
        allPieces = productos.flatMap((producto) => producto.pieces || []);
      } else if (pieces && pieces.length > 0) {
        allPieces = pieces;
      }
      console.log("All pieces to update:", allPieces.length);
      if (allPieces.length > 0) {
        console.log("Sample piece:", allPieces[0]);
      }
      const updatedReposition = await storage.updateReposition(
        repositionId,
        {
          ...mainData,
          productos,
          telaContraste
        },
        allPieces,
        user.id
      );
      const files = req.files;
      console.log("Files received:", files?.length || 0);
      if (files && files.length > 0) {
        console.log("Saving documents:", files.length);
        for (const file of files) {
          await storage.saveRepositionDocument({
            repositionId,
            filename: file.filename,
            originalName: file.originalname,
            size: file.size,
            path: file.path,
            uploadedBy: user.id
          });
        }
      }
      console.log("Reposition updated successfully");
      res.json(updatedReposition);
    } catch (error) {
      console.error("Update reposition error:", error);
      if (error instanceof Error) {
        console.error("Error name:", error.name);
        console.error("Error message:", error.message);
        console.error("Error stack:", error.stack);
      }
      const errorMessage = error instanceof Error ? error.message : "Error al actualizar la reposici\xF3n";
      res.status(500).json({ message: errorMessage });
    }
  });
  router.post("/transfers/:id/process", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Autenticaci\xF3n requerida" });
    try {
      const user = req.user;
      const transferId = parseInt(req.params.id);
      if (isNaN(transferId)) {
        return res.status(400).json({ message: "ID de transferencia inv\xE1lido" });
      }
      const { action, reason } = req.body;
      if (action === "rejected") {
        if (!reason || reason.trim().length === 0) {
          return res.status(400).json({ message: "El motivo del rechazo es obligatorio" });
        }
        if (reason.trim().length < 5) {
          return res.status(400).json({ message: "El motivo debe tener al menos 5 caracteres" });
        }
      }
      const result = await storage.processRepositionTransfer(transferId, action, user.id, reason?.trim());
      res.json(result);
    } catch (error) {
      console.error("Process transfer error:", error);
      res.status(400).json({ message: "Error al procesar la transferencia" });
    }
  });
  router.get("/:id/history", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Autenticaci\xF3n requerida" });
    try {
      const repositionId = parseInt(req.params.id);
      if (isNaN(repositionId)) {
        return res.status(400).json({ message: "ID de reposici\xF3n inv\xE1lido" });
      }
      const history = await storage.getRepositionHistory(repositionId);
      res.json(history);
    } catch (error) {
      console.error("Get reposition history error:", error);
      res.status(500).json({ message: "Error al obtener historial de la reposici\xF3n" });
    }
  });
  router.get("/:id/tracking", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Autenticaci\xF3n requerida" });
    try {
      const repositionId = parseInt(req.params.id);
      console.log("Tracking request for reposition ID:", repositionId);
      if (isNaN(repositionId)) {
        console.log("Invalid reposition ID:", req.params.id);
        return res.status(400).json({ message: "ID de reposici\xF3n inv\xE1lido" });
      }
      console.log("Getting tracking data for reposition:", repositionId);
      const tracking = await storage.getRepositionTracking(repositionId);
      console.log("Tracking data retrieved:", tracking);
      res.json(tracking);
    } catch (error) {
      console.error("Get reposition tracking error:", error);
      res.status(500).json({ message: "Error al obtener seguimiento de la reposici\xF3n", error: error.message });
    }
  });
  router.post("/:id/cancel", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Autenticaci\xF3n requerida" });
    try {
      const user = req.user;
      const repositionId = parseInt(req.params.id);
      if (isNaN(repositionId)) {
        return res.status(400).json({ message: "ID de reposici\xF3n inv\xE1lido" });
      }
      const { reason } = req.body;
      if (!reason || reason.trim().length === 0) {
        return res.status(400).json({ message: "El motivo de cancelaci\xF3n es obligatorio" });
      }
      if (reason.trim().length < 10) {
        return res.status(400).json({ message: "El motivo debe tener al menos 10 caracteres" });
      }
      await storage.cancelReposition(repositionId, user.id, reason.trim());
      res.json({ message: "Reposici\xF3n cancelada correctamente" });
    } catch (error) {
      console.error("Cancel reposition error:", error);
      res.status(500).json({ message: "Error al cancelar reposici\xF3n" });
    }
  });
  router.delete("/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Autenticaci\xF3n requerida" });
    try {
      const user = req.user;
      console.log("Delete request from user:", user.area, "for reposition:", req.params.id);
      if (user.area !== "admin" && user.area !== "envios") {
        return res.status(403).json({ message: "Solo Admin o Env\xEDos pueden eliminar reposiciones" });
      }
      const repositionId = parseInt(req.params.id);
      if (isNaN(repositionId)) {
        return res.status(400).json({ message: "ID de reposici\xF3n inv\xE1lido" });
      }
      await storage.deleteReposition(repositionId, user.id);
      console.log("Reposition deleted successfully:", repositionId);
      res.json({ message: "Reposici\xF3n eliminada correctamente" });
    } catch (error) {
      console.error("Delete reposition error:", error);
      res.status(500).json({ message: "Error al eliminar reposici\xF3n" });
    }
  });
  router.post("/:id/complete", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Autenticaci\xF3n requerida" });
    try {
      const user = req.user;
      const repositionId = parseInt(req.params.id);
      if (isNaN(repositionId)) {
        return res.status(400).json({ message: "ID de reposici\xF3n inv\xE1lido" });
      }
      const { notes } = req.body;
      if (user.area === "admin" || user.area === "envios") {
        await storage.completeReposition(repositionId, user.id, notes);
        res.json({ message: "Reposici\xF3n finalizada correctamente" });
      } else {
        const autoComplete = await storage.getSystemSetting("reposition_auto_complete");
        if (autoComplete === "true") {
          await storage.completeReposition(repositionId, user.id, notes);
          res.json({ message: "Reposici\xF3n finalizada autom\xE1ticamente por configuraci\xF3n" });
        } else {
          await storage.requestCompletionApproval(repositionId, user.id, notes);
          res.json({ message: "Solicitud de finalizaci\xF3n enviada a administraci\xF3n" });
        }
      }
    } catch (error) {
      console.error("Complete reposition error:", error);
      res.status(500).json({ message: "Error al procesar solicitud de finalizaci\xF3n" });
    }
  });
  router.get("/all", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Autenticaci\xF3n requerida" });
    try {
      const user = req.user;
      if (user.area !== "admin" && user.area !== "envios") {
        return res.status(403).json({ message: "Solo administradores o env\xEDos pueden ver el historial completo" });
      }
      const { includeDeleted } = req.query;
      const repositions2 = await storage.getAllRepositions(includeDeleted === "true");
      res.json(repositions2);
    } catch (error) {
      console.error("Get all repositions error:", error);
      res.status(500).json({ message: "Error al obtener historial de reposiciones" });
    }
  });
  router.get("/notifications", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Autenticaci\xF3n requerida" });
    try {
      const user = req.user;
      const notifications2 = await storage.getUserNotifications(user.id);
      const repositionNotifications = notifications2.filter(
        (n) => !n.read && (n.type?.includes("reposition") || n.type?.includes("completion") || n.type === "new_reposition" || n.type === "reposition_transfer" || n.type === "reposition_approved" || n.type === "reposition_rejected" || n.type === "reposition_completed" || n.type === "reposition_deleted" || n.type === "completion_approval_needed")
      );
      res.json(repositionNotifications);
    } catch (error) {
      console.error("Get reposition notifications error:", error);
      res.status(500).json({ message: "Error al obtener notificaciones de reposici\xF3n" });
    }
  });
  router.get("/pending-count", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Autenticaci\xF3n requerida" });
    try {
      const user = req.user;
      if (user.area !== "admin" && user.area !== "envios" && user.area !== "operaciones") {
        return res.json({ count: 0, repositions: [] });
      }
      const repositions2 = await storage.getAllRepositions(false);
      const pendingRepositions = repositions2.filter((r) => r.status === "pendiente");
      console.log("Pending repositions found:", pendingRepositions.length);
      res.json({
        count: pendingRepositions.length,
        repositions: pendingRepositions
      });
    } catch (error) {
      console.error("Get pending repositions count error:", error);
      res.status(500).json({ message: "Error al obtener conteo de reposiciones pendientes" });
    }
  });
  router.post("/:id/read", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Autenticaci\xF3n requerida" });
    try {
      const notificationId = parseInt(req.params.id);
      if (!notificationId) {
        return res.status(400).json({ message: "ID de notificaci\xF3n inv\xE1lido" });
      }
      await storage.markNotificationRead(notificationId);
      res.json({ message: "Notificaci\xF3n marcada como le\xEDda" });
    } catch (error) {
      console.error("Mark notification read error:", error);
      res.status(500).json({ message: "Error al marcar notificaci\xF3n como le\xEDda" });
    }
  });
  router.get("/transfers/pending", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Autenticaci\xF3n requerida" });
    try {
      const user = req.user;
      const transfers = await storage.getPendingRepositionTransfers(user.area);
      res.json(transfers);
    } catch (error) {
      console.error("Get pending reposition transfers error:", error);
      res.status(500).json({ message: "Error al obtener transferencias pendientes" });
    }
  });
  router.post("/:id/timer/start", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Autenticaci\xF3n requerida" });
    try {
      const user = req.user;
      const repositionId = parseInt(req.params.id);
      const { area } = req.body;
      console.log("Timer start request:", { repositionId, userId: user.id, area, userArea: user.area });
      if (isNaN(repositionId)) {
        return res.status(400).json({ message: "ID de reposici\xF3n inv\xE1lido" });
      }
      if (!area) {
        return res.status(400).json({ message: "\xC1rea requerida" });
      }
      const reposition = await storage.getRepositionById(repositionId);
      if (!reposition || reposition.currentArea !== user.area) {
        return res.status(403).json({ message: "No tienes acceso a esta reposici\xF3n" });
      }
      if (reposition.solicitanteArea === user.area) {
        const history = await storage.getRepositionHistory(repositionId);
        const transfersToCreatorArea = history.filter(
          (entry) => entry.action === "transfer_accepted" && entry.toArea === reposition.solicitanteArea
        ).length;
        if (transfersToCreatorArea === 0) {
          return res.status(400).json({ message: "El creador de la reposici\xF3n no debe registrar tiempo en la primera ocasi\xF3n" });
        }
      }
      await storage.startRepositionTimer(repositionId, user.id, area);
      res.json({
        message: "Cron\xF3metro iniciado correctamente",
        repositionId,
        area
      });
    } catch (error) {
      console.error("Start timer error:", error);
      const errorMessage = error instanceof Error ? error.message : "Error al iniciar cron\xF3metro";
      res.status(500).json({ message: errorMessage });
    }
  });
  router.post("/:id/timer/stop", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Autenticaci\xF3n requerida" });
    try {
      const user = req.user;
      const repositionId = parseInt(req.params.id);
      if (isNaN(repositionId)) {
        return res.status(400).json({ message: "ID de reposici\xF3n inv\xE1lido" });
      }
      const reposition = await storage.getRepositionById(repositionId);
      if (!reposition || reposition.currentArea !== user.area) {
        return res.status(403).json({ message: "No tienes acceso a esta reposici\xF3n" });
      }
      if (reposition.solicitanteArea === user.area) {
        const history = await storage.getRepositionHistory(repositionId);
        const transfersToCreatorArea = history.filter(
          (entry) => entry.action === "transfer_accepted" && entry.toArea === reposition.solicitanteArea
        ).length;
        if (transfersToCreatorArea === 0) {
          return res.status(400).json({ message: "El creador de la reposici\xF3n no debe registrar tiempo en la primera ocasi\xF3n" });
        }
      }
      const timer = await storage.stopRepositionTimer(repositionId, user.area, user.id);
      res.json(timer);
    } catch (error) {
      console.error("Stop timer error:", error);
      res.status(400).json({ message: error instanceof Error ? error.message : "Error al parar el timer" });
    }
  });
  router.post("/:id/timer/manual", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Autenticaci\xF3n requerida" });
    try {
      const user = req.user;
      const repositionId = parseInt(req.params.id);
      const { startTime, endTime, startDate, endDate } = req.body;
      console.log("Manual timer request:", {
        repositionId,
        userArea: user.area,
        startTime,
        endTime,
        startDate,
        endDate
      });
      if (isNaN(repositionId)) {
        return res.status(400).json({ message: "ID de reposici\xF3n inv\xE1lido" });
      }
      const reposition = await storage.getRepositionById(repositionId);
      if (!reposition || reposition.currentArea !== user.area) {
        return res.status(403).json({ message: "No tienes acceso a esta reposici\xF3n" });
      }
      if (!startTime || !endTime || !startDate || !endDate) {
        return res.status(400).json({ message: "Hora de inicio, fin, fecha de inicio y fecha de fin son requeridas" });
      }
      const timer = await storage.setManualRepositionTime(repositionId, user.area, user.id, startTime, endTime, startDate, endDate);
      res.json(timer);
    } catch (error) {
      console.error("Set manual time error:", error);
      res.status(400).json({ message: error instanceof Error ? error.message : "Error al registrar tiempo manual" });
    }
  });
  router.get("/:id/timer", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Autenticaci\xF3n requerida" });
    try {
      const user = req.user;
      const repositionId = parseInt(req.params.id);
      if (isNaN(repositionId)) {
        return res.status(400).json({ message: "ID de reposici\xF3n inv\xE1lido" });
      }
      const timer = await storage.getRepositionTimer(repositionId, user.area);
      res.json(timer);
    } catch (error) {
      console.error("Get timer error:", error);
      res.status(500).json({ message: "Error al obtener el timer" });
    }
  });
  router.post("/:id/reactivate", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Autenticaci\xF3n requerida" });
    try {
      const user = req.user;
      if (user.area !== "admin" && user.area !== "envios") {
        return res.status(403).json({ message: "Solo Admin o Env\xEDos pueden reactivar reposiciones" });
      }
      const repositionId = parseInt(req.params.id);
      if (isNaN(repositionId)) {
        return res.status(400).json({ message: "ID de reposici\xF3n inv\xE1lido" });
      }
      const { reason } = req.body;
      if (!reason || reason.trim().length === 0) {
        return res.status(400).json({ message: "El motivo de reactivaci\xF3n es obligatorio" });
      }
      const reposition = await storage.getRepositionById(repositionId);
      if (!reposition) {
        return res.status(404).json({ message: "Reposici\xF3n no encontrada" });
      }
      console.log("Reactivation attempt for reposition:", {
        id: repositionId,
        folio: reposition.folio,
        status: reposition.status,
        completedAt: reposition.completedAt,
        completedAtType: typeof reposition.completedAt
      });
      if (reposition.status !== "completado") {
        return res.status(400).json({ message: "Solo se pueden reactivar reposiciones completadas" });
      }
      await storage.reactivateReposition(repositionId, user.id, reason.trim());
      res.json({ message: "Reposici\xF3n reactivada correctamente" });
    } catch (error) {
      console.error("Reactivate reposition error:", error);
      res.status(500).json({ message: "Error al reactivar reposici\xF3n" });
    }
  });
  router.post("/:id/documents", authenticateToken, upload.array("documents", 5), handleMulterError, async (req, res) => {
    try {
      const user = req.user;
      const repositionId = parseInt(req.params.id);
      const files = req.files;
      if (isNaN(repositionId)) {
        return res.status(400).json({ message: "ID de reposici\xF3n inv\xE1lido" });
      }
      if (!files || files.length === 0) {
        return res.status(400).json({ message: "No se han seleccionado archivos" });
      }
      const reposition = await storage.getRepositionById(repositionId);
      if (!reposition) {
        return res.status(404).json({ message: "Reposici\xF3n no encontrada" });
      }
      const savedDocuments = [];
      for (const file of files) {
        const document = await storage.saveRepositionDocument({
          repositionId,
          filename: file.filename,
          originalName: file.originalname,
          size: file.size,
          path: file.path,
          uploadedBy: user.id
        });
        savedDocuments.push(document);
      }
      res.json({
        message: `${savedDocuments.length} documento(s) a\xF1adido(s) correctamente`,
        documents: savedDocuments
      });
    } catch (error) {
      console.error("Upload documents error:", error);
      res.status(500).json({ message: "Error al subir documentos" });
    }
  });
  router.get("/:id/documents", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Autenticaci\xF3n requerida" });
    try {
      const repositionId = parseInt(req.params.id);
      if (isNaN(repositionId)) {
        return res.status(400).json({ message: "ID de reposici\xF3n inv\xE1lido" });
      }
      const documents2 = await storage.getRepositionDocuments(repositionId);
      res.json(documents2);
    } catch (error) {
      console.error("Get documents error:", error);
      res.status(500).json({ message: "Error al obtener documentos" });
    }
  });
  router.get("/:id/products", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Autenticaci\xF3n requerida" });
    try {
      const repositionId = parseInt(req.params.id);
      if (isNaN(repositionId)) {
        return res.status(400).json({ message: "ID de reposici\xF3n inv\xE1lido" });
      }
      const products = await storage.getRepositionProducts(repositionId);
      res.json(products);
    } catch (error) {
      console.error("Get products error:", error);
      res.status(500).json({ message: "Error al obtener productos" });
    }
  });
  router.post("/repair-completed", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Autenticaci\xF3n requerida" });
    try {
      const user = req.user;
      if (user.area !== "admin") {
        return res.status(403).json({ message: "Solo administradores pueden usar esta funci\xF3n de reparaci\xF3n" });
      }
      const problematicRepositions = await db.select().from(repositions).where(and2(
        eq3(repositions.status, "completado"),
        isNull2(repositions.completedAt)
      ));
      let repaired = 0;
      let failed = 0;
      for (const reposition of problematicRepositions) {
        try {
          const history = await storage.getRepositionHistory(reposition.id);
          const completedEntry = history.find((h) => h.action === "completed");
          if (completedEntry) {
            await db.update(repositions).set({ completedAt: new Date(completedEntry.createdAt) }).where(eq3(repositions.id, reposition.id));
            repaired++;
          } else {
            failed++;
          }
        } catch (error) {
          console.error(`Failed to repair reposition ${reposition.id}:`, error);
          failed++;
        }
      }
      res.json({
        message: `Reparaci\xF3n completada: ${repaired} reposiciones reparadas, ${failed} fallaron`,
        repaired,
        failed,
        total: problematicRepositions.length
      });
    } catch (error) {
      console.error("Repair repositions error:", error);
      res.status(500).json({ message: "Error al reparar reposiciones" });
    }
  });
  router.get("/history", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Autenticaci\xF3n requerida" });
    const user = req.user;
    try {
      const allRepositions = await db.select().from(repositions).where(ne2(repositions.status, "eliminado")).orderBy(desc2(repositions.createdAt));
      const now = /* @__PURE__ */ new Date();
      const filteredRepositions = allRepositions.filter((reposition) => {
        if (!reposition.completedAt) return true;
        const finalized = new Date(reposition.completedAt);
        const hoursSinceFinalized = (now.getTime() - finalized.getTime()) / (1e3 * 60 * 60);
        if (user.area === "admin" || user.area === "envios") {
          return true;
        }
        if (user.area === reposition.solicitanteArea) {
          return hoursSinceFinalized <= 24;
        }
        return hoursSinceFinalized <= 12;
      });
      res.json(filteredRepositions);
    } catch (error) {
      console.error("Error getting repositions history:", error);
      res.status(500).json({ message: "Error al obtener el historial de reposiciones" });
    }
  });
  router.post("/export", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Autenticaci\xF3n requerida" });
    try {
      const { repositions: repositions2 } = req.body;
      const workbook = new ExcelJS2.Workbook();
      const worksheet = workbook.addWorksheet("Historial de Reposiciones");
      worksheet.columns = [
        { header: "Folio", key: "folio", width: 15 },
        { header: "Cliente", key: "cliente", width: 20 },
        { header: "Modelo", key: "modelo", width: 15 },
        { header: "Tipo", key: "tipo", width: 15 },
        { header: "Piezas", key: "piezas", width: 10 },
        { header: "Motivo", key: "motivo", width: 20 },
        { header: "Descripci\xF3n", key: "descripcion", width: 30 },
        { header: "Urgencia", key: "urgencia", width: 12 },
        { header: "Estado", key: "status", width: 12 },
        { header: "\xC1rea Actual", key: "currentArea", width: 15 },
        { header: "\xC1rea Solicitante", key: "solicitanteArea", width: 15 },
        { header: "\xC1rea Causante", key: "areaCausanteDano", width: 15 },
        { header: "Fecha Creaci\xF3n", key: "createdAt", width: 20 },
        { header: "Fecha Finalizaci\xF3n", key: "finalizadoAt", width: 20 }
      ];
      repositions2.forEach((reposition) => {
        worksheet.addRow({
          folio: reposition.folio,
          cliente: reposition.cliente,
          modelo: reposition.modelo,
          tipo: reposition.tipo,
          piezas: reposition.piezas,
          motivo: reposition.motivo,
          descripcion: reposition.descripcion,
          urgencia: reposition.urgencia,
          status: reposition.status === "completado" ? "Completado" : reposition.status === "en_proceso" ? "En Proceso" : reposition.status === "pendiente" ? "Pendiente" : reposition.status === "cancelado" ? "Cancelado" : "Pausado",
          currentArea: reposition.currentArea,
          solicitanteArea: reposition.solicitanteArea,
          areaCausanteDano: reposition.areaCausanteDano || "",
          createdAt: new Date(reposition.createdAt).toLocaleString("es-ES", { timeZone: "America/Mexico_City" }),
          finalizadoAt: reposition.finalizadoAt ? new Date(reposition.finalizadoAt).toLocaleString("es-ES", { timeZone: "America/Mexico_City" }) : ""
        });
      });
      worksheet.getRow(1).font = { bold: true };
      worksheet.getRow(1).fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FFE6F3FF" }
      };
      const buffer = await workbook.xlsx.writeBuffer();
      res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
      res.setHeader("Content-Disposition", 'attachment; filename="historial-reposiciones.xlsx"');
      res.send(buffer);
    } catch (error) {
      console.error("Export error:", error);
      res.status(500).json({ message: "Error al exportar datos" });
    }
  });
  app2.use("/api/repositions", router);
}
function registerReportsRoutes(app2) {
  const router = Router();
  router.get("/data", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Autenticaci\xF3n requerida" });
    try {
      const { type, startDate, endDate, area, status, urgency } = req.query;
      const data = await storage.getReportData(
        type,
        startDate,
        endDate,
        { area, status, urgency }
      );
      res.json(data);
    } catch (error) {
      console.error("Get report data error:", error);
      res.status(500).json({ message: "Error al obtener datos del reporte" });
    }
  });
  router.get("/generate", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Autenticaci\xF3n requerida" });
    try {
      const { type, format, startDate, endDate, area, status, urgency } = req.query;
      const buffer = await storage.generateReport(
        type,
        format,
        startDate,
        endDate,
        { area, status, urgency }
      );
      const contentType = format === "excel" ? "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" : "application/pdf";
      const filename = `reporte-${type}-${(/* @__PURE__ */ new Date()).toISOString().split("T")[0]}.${format === "excel" ? "xlsx" : "pdf"}`;
      res.setHeader("Content-Type", contentType);
      res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
      res.send(buffer);
    } catch (error) {
      console.error("Generate report error:", error);
      res.status(500).json({ message: "Error al generar reporte" });
    }
  });
  router.post("/onedrive", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Autenticaci\xF3n requerida" });
    try {
      const { type, startDate, endDate, area, status, urgency } = req.query;
      const result = await storage.saveReportToOneDrive(
        type,
        startDate,
        endDate,
        { area, status, urgency }
      );
      res.json(result);
    } catch (error) {
      console.error("Save to OneDrive error:", error);
      res.status(500).json({ message: "Error al guardar en OneDrive" });
    }
  });
  app2.use("/api/reports", router);
}
function registerAgendaRoutes(app2) {
  const router = Router();
  router.get("/", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Autenticaci\xF3n requerida" });
    try {
      const user = req.user;
      const events = await storage.getAgendaEvents(user);
      res.json(events);
    } catch (error) {
      console.error("Get agenda events error:", error);
      res.status(500).json({ message: "Error al obtener tareas de la agenda" });
    }
  });
  router.post("/", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Autenticaci\xF3n requerida" });
    try {
      const user = req.user;
      if (user.area !== "admin" && user.area !== "envios") {
        return res.status(403).json({ message: "Solo Admin y Env\xEDos pueden crear tareas" });
      }
      const { assignedToArea, title, description, date, time, priority, status } = req.body;
      const event = await storage.createAgendaEvent({
        createdBy: user.id,
        assignedToArea,
        title,
        description,
        date,
        time,
        priority,
        status
      });
      res.status(201).json(event);
    } catch (error) {
      console.error("Create agenda event error:", error);
      res.status(400).json({ message: "Error al crear tarea de la agenda" });
    }
  });
  router.put("/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Autenticaci\xF3n requerida" });
    try {
      const user = req.user;
      const eventId = parseInt(req.params.id);
      if (isNaN(eventId)) {
        return res.status(400).json({ message: "ID de tarea inv\xE1lido" });
      }
      const { assignedToArea, title, description, date, time, priority, status } = req.body;
      if (user.area !== "admin" && user.area !== "envios") {
        const event = await storage.updateTaskStatus(eventId, user.area, status);
        res.json(event);
      } else {
        const event = await storage.updateAgendaEvent(eventId, {
          assignedToArea,
          title,
          description,
          date,
          time,
          priority,
          status
        });
        res.json(event);
      }
    } catch (error) {
      console.error("Update agenda event error:", error);
      res.status(500).json({ message: "Error al actualizar tarea de la agenda" });
    }
  });
  router.delete("/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Autenticaci\xF3n requerida" });
    try {
      const user = req.user;
      if (user.area !== "admin" && user.area !== "envios") {
        return res.status(403).json({ message: "Solo Admin y Env\xEDos pueden eliminar tareas" });
      }
      const eventId = parseInt(req.params.id);
      if (isNaN(eventId)) {
        return res.status(400).json({ message: "ID de tarea inv\xE1lido" });
      }
      await storage.deleteAgendaEvent(eventId);
      res.json({ message: "Tarea eliminada correctamente" });
    } catch (error) {
      console.error("Delete agenda event error:", error);
      res.status(500).json({ message: "Error al eliminar tarea" });
    }
  });
  app2.use("/api/agenda", router);
}
function registerAlmacenRoutes(app2) {
  const router = Router();
  router.use((req, res, next) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Autenticaci\xF3n requerida" });
    const user = req.user;
    if (user.area !== "almacen") return res.status(403).json({ message: "Acceso restringido al \xE1rea de almac\xE9n" });
    next();
  });
  router.get("/repositions", async (req, res) => {
    try {
      const repositions2 = await storage.getAllRepositionsForAlmacen();
      res.json(repositions2);
    } catch (error) {
      console.error("Get repositions for almacen error:", error);
      res.status(500).json({ message: "Error al obtener reposiciones" });
    }
  });
  router.post("/repositions/:id/pause", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Autenticaci\xF3n requerida" });
    try {
      const user = req.user;
      const repositionId = parseInt(req.params.id);
      const { reason } = req.body;
      if (isNaN(repositionId)) {
        return res.status(400).json({ message: "ID de reposici\xF3n inv\xE1lido" });
      }
      if (!reason || reason.trim().length === 0) {
        return res.status(400).json({ message: "El motivo de pausa es obligatorio" });
      }
      await storage.pauseReposition(repositionId, reason.trim(), user.id);
      const httpServer = req.app.get("httpServer");
      if (httpServer && httpServer.wss) {
        const notification = {
          type: "notification",
          data: {
            type: "reposition_paused",
            message: `Reposici\xF3n pausada por almac\xE9n`,
            repositionId
          }
        };
        httpServer.wss.clients.forEach((client) => {
          if (client.readyState === 1) {
            client.send(JSON.stringify(notification));
          }
        });
      }
      res.json({ message: "Reposici\xF3n pausada correctamente" });
    } catch (error) {
      console.error("Pause reposition error:", error);
      res.status(500).json({ message: "Error al pausar reposici\xF3n" });
    }
  });
  router.post("/repositions/:id/resume", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Autenticaci\xF3n requerida" });
    try {
      const user = req.user;
      const repositionId = parseInt(req.params.id);
      if (isNaN(repositionId)) {
        return res.status(400).json({ message: "ID de reposici\xF3n inv\xE1lido" });
      }
      await storage.resumeReposition(repositionId, user.id);
      const httpServer = req.app.get("httpServer");
      if (httpServer && httpServer.wss) {
        const notification = {
          type: "notification",
          data: {
            type: "reposition_resumed",
            message: `Reposici\xF3n reanudada por almac\xE9n`,
            repositionId
          }
        };
        httpServer.wss.clients.forEach((client) => {
          if (client.readyState === 1) {
            client.send(JSON.stringify(notification));
          }
        });
      }
      res.json({ message: "Reposici\xF3n reanudada correctamente" });
    } catch (error) {
      console.error("Resume reposition error:", error);
      res.status(500).json({ message: "Error al reanudar reposici\xF3n" });
    }
  });
  app2.use("/api/almacen", router);
}
function registerMetricsRoutes(app2) {
  const router = Router();
  router.use((req, res, next) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Autenticaci\xF3n requerida" });
    }
    const user = req.user;
    if (user.area !== "admin") {
      return res.status(403).json({ message: "Acceso restringido a administradores" });
    }
    next();
  });
  router.get("/monthly", async (req, res) => {
    try {
      const { month, year } = req.query;
      console.log("Getting monthly metrics for:", month, year);
      const metrics = await storage.getMonthlyMetrics(parseInt(month), parseInt(year));
      console.log("Monthly metrics result:", metrics);
      res.json(metrics);
    } catch (error) {
      console.error("Get monthly metrics error:", error);
      res.status(500).json({ message: "Error al obtener m\xE9tricas mensuales" });
    }
  });
  router.get("/overall", async (req, res) => {
    try {
      console.log("Getting overall metrics");
      const metrics = await storage.getOverallMetrics();
      console.log("Overall metrics result:", metrics);
      res.json(metrics);
    } catch (error) {
      console.error("Get overall metrics error:", error);
      res.status(500).json({ message: "Error al obtener m\xE9tricas generales" });
    }
  });
  router.get("/requests", async (req, res) => {
    try {
      console.log("Getting request analysis");
      const analysis = await storage.getRequestAnalysis();
      console.log("Request analysis result:", analysis);
      res.json(analysis);
    } catch (error) {
      console.error("Get request analysis error:", error);
      res.status(500).json({ message: "Error al obtener an\xE1lisis de solicitudes" });
    }
  });
  router.get("/export/:type", async (req, res) => {
    try {
      const { type } = req.params;
      const { month, year } = req.query;
      let buffer;
      let filename;
      switch (type) {
        case "monthly":
          buffer = await storage.exportMonthlyMetrics(parseInt(month), parseInt(year));
          filename = `metricas-mensuales-${month}-${year}.xlsx`;
          break;
        case "overall":
          buffer = await storage.exportOverallMetrics();
          filename = `metricas-generales-${(/* @__PURE__ */ new Date()).toISOString().split("T")[0]}.xlsx`;
          break;
        case "requests":
          buffer = await storage.exportRequestAnalysis();
          filename = `analisis-solicitudes-${(/* @__PURE__ */ new Date()).toISOString().split("T")[0]}.xlsx`;
          break;
        case "causativeArea":
          buffer = await storage.exportCausativeAreaMetrics(parseInt(month), parseInt(year));
          filename = `metricas-causativeArea-${month}-${year}.xlsx`;
          break;
        default:
          return res.status(400).json({ message: "Tipo de exportaci\xF3n inv\xE1lido" });
      }
      res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
      res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
      res.send(buffer);
    } catch (error) {
      console.error("Export metrics error:", error);
      res.status(500).json({ message: "Error al exportar m\xE9tricas" });
    }
  });
  app2.use("/api/metrics", router);
  app2.get("/api/files/:filename", authenticateToken, async (req, res) => {
    try {
      const { filename } = req.params;
      const filePath = path3.join(process.cwd(), "uploads", filename);
      if (!fs3.existsSync(filePath)) {
        return res.status(404).json({ error: "Archivo no encontrado" });
      }
      res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
      res.download(filePath, (err) => {
        if (err) {
          console.error("Error sending file:", err);
          if (!res.headersSent) {
            res.status(500).json({ error: "Error al descargar el archivo" });
          }
        }
      });
    } catch (error) {
      console.error("Error downloading file:", error);
      res.status(500).json({ error: "Error al descargar el archivo" });
    }
  });
}
function registerSettingsRoutes(app2) {
  const router = Router();
  router.get("/:key", async (req, res) => {
    try {
      const key = req.params.key;
      const publicKeys = ["maintenance_mode", "maintenance_duration", "maintenance_start_time"];
      if (!req.isAuthenticated() && !publicKeys.includes(key)) {
        return res.status(401).json({ message: "Autenticaci\xF3n requerida" });
      }
      const value = await storage.getSystemSetting(key);
      console.log(`DEBUG: GET setting ${key} = ${value}`);
      res.json({ key, value: value || null });
    } catch (error) {
      console.error("Get setting error:", error);
      res.status(500).json({ message: "Error al obtener configuraci\xF3n" });
    }
  });
  router.use((req, res, next) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Autenticaci\xF3n requerida" });
    next();
  });
  router.post("/", async (req, res) => {
    try {
      const user = req.user;
      if (user.area !== "admin" && user.area !== "envios") {
        return res.status(403).json({ message: "No autorizado para cambiar configuraciones" });
      }
      const { key, value } = req.body;
      console.log(`DEBUG: SET setting ${key} = ${value} (User: ${user.id})`);
      if (!key) {
        return res.status(400).json({ message: "Clave de configuraci\xF3n requerida" });
      }
      await storage.setSystemSetting(key, String(value), user.id);
      if (key === "maintenance_mode") {
        const wss = global.wss;
        if (wss) {
          wss.clients.forEach((client) => {
            if (client.readyState === 1) {
              client.send(JSON.stringify({
                type: "maintenance",
                enabled: value === "true" || value === true
              }));
            }
          });
          console.log(`Mantenimiento ${value === "true" || value === true ? "activado" : "desactivado"} y notificado por WebSocket`);
        }
      }
      res.json({ message: "Configuraci\xF3n actualizada" });
    } catch (error) {
      console.error("Set setting error:", error);
      res.status(500).json({ message: "Error al actualizar configuraci\xF3n" });
    }
  });
  app2.use("/api/settings", router);
}

// server/vite.ts
import express2 from "express";
import fs4 from "fs";
import path5 from "path";
import { createServer as createViteServer, createLogger } from "vite";

// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path4 from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";
var vite_config_default = defineConfig({
  plugins: [
    react(),
    runtimeErrorOverlay(),
    ...process.env.NODE_ENV !== "production" && process.env.REPL_ID !== void 0 ? [
      await import("@replit/vite-plugin-cartographer").then(
        (m) => m.cartographer()
      )
    ] : []
  ],
  resolve: {
    alias: {
      "@": path4.resolve(import.meta.dirname, "client", "src"),
      "@shared": path4.resolve(import.meta.dirname, "shared"),
      "@assets": path4.resolve(import.meta.dirname, "attached_assets")
    }
  },
  root: path4.resolve(import.meta.dirname, "client"),
  build: {
    outDir: path4.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true
  },
  server: {
    fs: {
      strict: true,
      deny: ["**/.*"]
    }
  }
});

// server/vite.ts
import { nanoid } from "nanoid";
var viteLogger = createLogger();
function log(message, source = "express") {
  const formattedTime = (/* @__PURE__ */ new Date()).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true
  });
  console.log(`${formattedTime} [${source}] ${message}`);
}
async function setupVite(app2, server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true
  };
  const vite = await createViteServer({
    ...vite_config_default,
    configFile: false,
    customLogger: {
      ...viteLogger,
      error: (msg, options) => {
        viteLogger.error(msg, options);
        process.exit(1);
      }
    },
    server: serverOptions,
    appType: "custom"
  });
  app2.use(vite.middlewares);
  app2.use("*", async (req, res, next) => {
    const url = req.originalUrl;
    try {
      const clientTemplate = path5.resolve(
        import.meta.dirname,
        "..",
        "client",
        "index.html"
      );
      let template = await fs4.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e);
      next(e);
    }
  });
  return vite;
}
function serveStatic(app2) {
  const distPath = path5.resolve(import.meta.dirname, "public");
  if (!fs4.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }
  app2.use(express2.static(distPath));
  app2.use("*", (_req, res) => {
    res.sendFile(path5.resolve(distPath, "index.html"));
  });
}

// server/middlewares/camelCaseMiddleware.ts
import camelcaseKeys from "camelcase-keys";
function camelCaseResponseMiddleware(req, res, next) {
  const oldJson = res.json;
  res.json = function(data) {
    const camelCasedData = camelcaseKeys(data, { deep: true });
    return oldJson.call(this, camelCasedData);
  };
  next();
}

// server/index.ts
import { WebSocketServer as WebSocketServer2 } from "ws";
var app = express3();
app.use(express3.json({ limit: "50mb" }));
app.use(express3.urlencoded({ extended: true, limit: "50mb" }));
app.use((req, res, next) => {
  if (req.path.startsWith("/api/orders") && req.method === "POST") {
    console.log("=== REQUEST MIDDLEWARE DEBUG ===");
    console.log("Path:", req.path);
    console.log("Content-Type:", req.get("content-type"));
    console.log("Body keys:", Object.keys(req.body));
    console.log("Body:", req.body);
    console.log("=== END MIDDLEWARE DEBUG ===");
  }
  next();
});
app.use(camelCaseResponseMiddleware);
app.use((req, res, next) => {
  const start = Date.now();
  const path6 = req.path;
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path6.startsWith("/api")) {
      if (duration > 100) {
        log(`${req.method} ${path6} ${res.statusCode} in ${duration}ms`);
      }
    }
  });
  next();
});
if (!global.serverStarted) {
  global.serverStarted = true;
  (async () => {
    const server = await registerRoutes(app);
    await backupService.init();
    if (!global.wss) {
      global.wss = new WebSocketServer2({ noServer: true });
      global.wss.on("connection", (ws) => {
        console.log("Nueva conexi\xF3n WebSocket establecida");
        ws.on("message", (message) => {
          try {
            const data = JSON.parse(message.toString());
            console.log("Mensaje WebSocket recibido:", data);
          } catch (error) {
            console.error("Error al procesar mensaje WebSocket:", error);
          }
        });
        ws.on("close", () => {
          console.log("Conexi\xF3n WebSocket cerrada");
        });
        ws.on("error", (error) => {
          console.error("Error en WebSocket:", error);
        });
      });
    }
    if (!global.upgradeListenerAdded) {
      server.removeAllListeners("upgrade");
      server.on("upgrade", (req, socket, head) => {
        if (req.url === "/ws") {
          if (!socket.destroyed) {
            global.wss.handleUpgrade(req, socket, head, (ws) => {
              global.wss.emit("connection", ws, req);
            });
          }
        } else {
          socket.destroy();
        }
      });
      global.upgradeListenerAdded = true;
    }
    if (process.env.NODE_ENV === "development") {
      await setupVite(app, server);
    } else {
      serveStatic(app);
    }
    app.use((req, res, next) => {
      const error = new Error(`Not Found - ${req.originalUrl}`);
      res.status(404);
      next(error);
    });
    app.use((err, req, res, next) => {
      const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
      res.status(statusCode).json({
        message: err.message,
        stack: process.env.NODE_ENV === "production" ? null : err.stack
      });
    });
    const port = process.env.PORT || 5e3;
    server.listen({
      port,
      host: "0.0.0.0"
    }, () => {
      log(`Servidor activo en http://0.0.0.0:${port}`);
    });
  })();
} else {
  console.log("Servidor ya est\xE1 iniciado \u2014 No se inicia otra vez");
}
