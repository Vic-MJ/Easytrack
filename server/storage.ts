import {
  users,
  notifications,
  repositions,
  repositionPieces,
  repositionProducts,
  repositionTimers,
  repositionTransfers,
  repositionHistory,
  repositionMaterials,
  repositionContrastFabrics,
  adminPasswords,
  agendaEvents,
  documents,
  type User,
  type InsertUser,
  type Notification,
  type InsertNotification,
  type Reposition,
  type InsertReposition,
  type RepositionPiece,
  type InsertRepositionPiece,
  type RepositionTimer as SharedRepositionTimer,
  type InsertRepositionTimer,
  type RepositionTransfer,
  type InsertRepositionTransfer,
  type RepositionHistory,
  type AdminPassword,
  type InsertAdminPassword,
  type AgendaEvent,
  type InsertAgendaEvent,
  type Area,
  type RepositionType,
  type RepositionStatus,
  systemSettings,
  type SystemSetting
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, or, ne, isNotNull, isNull, count, gte, lte, sql, asc } from 'drizzle-orm';
import bcrypt from "bcrypt";
import ExcelJS from 'exceljs';
import session from "express-session";
import connectPg from "connect-pg-simple";
import { pool } from "./db";



// Función helper para crear timestamp con zona horaria de México


const PostgresSessionStore = connectPg(session);

// Función para enviar notificaciones por WebSocket
function broadcastNotification(notification: any) {
  const wss = (global as any).wss;
  if (wss) {
    wss.clients.forEach((client: any) => {
      if (client.readyState === 1) { // WebSocket.OPEN
        client.send(JSON.stringify({
          type: 'notification',
          data: notification
        }));
      }
    });
    console.log('Notificación enviada por WebSocket:', notification.title);
  } else {
    console.log('WebSocket no disponible para enviar notificación');
  }
}

export interface IStorage {
  // Métodos de métricas
  getMonthlyMetrics(month: number, year: number): Promise<any>;
  getOverallMetrics(): Promise<any>;
  getRequestAnalysis(): Promise<any>;
  exportMonthlyMetrics(month: number, year: number): Promise<Buffer>;
  exportOverallMetrics(): Promise<Buffer>;
  exportRequestAnalysis(): Promise<Buffer>;
  exportCausativeAreaMetrics(month: number, year: number): Promise<Buffer>;

  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  getAdminUser(): Promise<User | undefined>;
  resetUserPassword(userId: number, hashedPassword: string): Promise<void>;
  getAllAdminUsers(): Promise<User[]>;




  createNotification(notification: InsertNotification): Promise<Notification>;
  getUserNotifications(userId: number): Promise<Notification[]>;
  markNotificationRead(notificationId: number): Promise<void>;
  clearAllUserNotifications(userId: number): Promise<void>;

  sessionStore: any;

  createReposition(reposition: InsertReposition & { folio: string }, pieces: InsertRepositionPiece[], createdBy: number): Promise<Reposition>;
  getRepositions(area?: Area, userArea?: Area): Promise<Reposition[]>;
  getRepositionsByArea(area: Area, userId?: number): Promise<Reposition[]>;
  getRepositionById(id: number): Promise<Reposition | undefined>;
  getNextRepositionCounter(): Promise<number>;
  approveReposition(repositionId: number, action: RepositionStatus, userId: number, notes?: string): Promise<Reposition>;

  createRepositionTransfer(transfer: InsertRepositionTransfer, createdBy: number): Promise<RepositionTransfer>;
  processRepositionTransfer(transferId: number, action: 'accepted' | 'rejected', userId: number, reason?: string): Promise<RepositionTransfer>;
  getRepositionHistory(repositionId: number): Promise<any>;
  getRepositionTracking(repositionId: number): Promise<any>;

  deleteReposition(repositionId: number, userId: number, reason?: string): Promise<void>;
  completeReposition(repositionId: number, userId: number, notes?: string): Promise<void>;
  requestCompletionApproval(repositionId: number, userId: number, notes?: string): Promise<void>;
  getAllRepositions(includeDeleted?: boolean): Promise<Reposition[]>;
  getRecentRepositions(area?: Area, limit?: number): Promise<Reposition[]>;

  getReportData(type: string, startDate: string, endDate: string, filters: any): Promise<any>;
  generateReport(type: string, format: string, startDate: string, endDate: string, filters: any): Promise<Buffer>;
  saveReportToOneDrive(type: string, startDate: string, endDate: string, filters: any): Promise<any>;

  createAdminPassword(password: string, createdBy: number): Promise<AdminPassword>;
  verifyAdminPassword(password: string): Promise<boolean>;

  // Agenda Events
  getUserAgendaEvents(userId: number): Promise<any[]>;
  createAgendaEvent(eventData: {
    userId: number;
    title: string;
    description: string;
    date: string;
    time: string;
    priority: 'alta' | 'media' | 'baja';
    status: 'pendiente' | 'completado' | 'cancelado';
  }): Promise<any>;
  updateAgendaEvent(
    eventId: number,
    userId: number,
    eventData: {
      title: string;
      description: string;
      date: string;
      time: string;
      priority: 'alta' | 'media' | 'baja';
      status: 'pendiente' | 'completado' | 'cancelado';
    }
  ): Promise<any>;
  deleteAgendaEvent(eventId: number, userId: number): Promise<void>;

  getPendingRepositionTransfers(userArea: Area): Promise<RepositionTransfer[]>;

  // Timer methods
  startRepositionTimer(repositionId: number, userId: number, area: string): Promise<SharedRepositionTimer>;
  stopRepositionTimer(repositionId: number, area: Area, userId: number): Promise<{ elapsedTime: string }>;
  getRepositionTimers(repositionId: number): Promise<LocalRepositionTimer[]>;
  setManualRepositionTime(repositionId: number, area: string, userId: number, startTime: string, endTime: string, date: string, endDate: string): Promise<any>;
  getRepositionTimer(repositionId: number, area: Area): Promise<SharedRepositionTimer | null>;

  updateUser(userId: number, updateData: any): Promise<void>;

  getRepositionPieces(repositionId: number): Promise<any[]>;
  clearEntireDatabase(deleteUsers?: boolean): Promise<void>;
  resetUserSequence(): Promise<void>;
  backupUsers(): Promise<any>;
  restoreUsers(backupData: any): Promise<any>;
  updateReposition(repositionId: number, data: any, pieces: any[], userId: number): Promise<any>;
  getRepositionProducts(repositionId: number): Promise<any[]>;
  reactivateReposition(repositionId: number, userId: number, reason: string): Promise<void>;

  // Backup and Restore methods
  backupCompleteSystem(): Promise<any>;
  restoreCompleteSystem(backupData: any): Promise<any>;
  fixAllSequences(): Promise<void>;
  getSequenceData(table: string): Promise<{ lastValue: number, nextValue: number } | null>;
  setSequenceValue(table: string, value: number): Promise<void>;

  // System Settings
  getSystemSetting(key: string): Promise<string | undefined>;
  setSystemSetting(key: string, value: string, userId: number): Promise<void>;
}

export interface LocalRepositionTimer {
  id: number;
  repositionId: number;
  userId: number;
  area: Area;
  startTime: Date;
  endTime: Date | null;
  elapsedTime: string;
}

export class DatabaseStorage implements IStorage {


  async getAllUsers(): Promise<User[]> {
    return await db.select().from(users).orderBy(asc(users.id));
  }

  async deleteUserById(userId: string): Promise<boolean> {
    const result = await db.delete(users)
      .where(eq(users.id, Number(userId)))
      .returning()
      .catch(() => []);
    return result.length > 0;
  }

  sessionStore: session.Store;

  constructor() {
    this.sessionStore = new PostgresSessionStore({
      pool,
      createTableIfMissing: true
    });
  }

  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    if (user) {
      console.log(`[STORAGE] Fetched user ${id}:`, { username: user.username, isActive: user.isActive });
    }
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    if (user) {
      console.log(`[STORAGE] Fetched user by username ${username}:`, { id: user.id, isActive: user.isActive });
    }
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async getAdminUser(): Promise<User | undefined> {
    const adminUsers = await db.select().from(users).where(eq(users.area, 'admin')).limit(1);
    return adminUsers[0] || undefined;
  }

  async getAllAdminUsers(): Promise<User[]> {
    return await db.select().from(users).where(eq(users.area, 'admin'));
  }

  async resetUserPassword(userId: number, hashedPassword: string): Promise<void> {
    await db.update(users)
      .set({ password: hashedPassword })
      .where(eq(users.id, userId));
  }



  async createNotification(notification: InsertNotification): Promise<Notification> {
    let newNotification;
    try {
      [newNotification] = await db
        .insert(notifications)
        .values(notification)
        .returning();
    } catch (error: any) {
      // Si el error es por llave duplicada en ID (secuencia desincronizada)
      if (error.code === '23505' && error.constraint === 'notifications_pkey') {
        console.log('Detectado error de secuencia en ID de notificaciones. Intentando corregir...');

        // Corregir la secuencia: setval al máximo ID actual
        await db.execute(sql`SELECT setval('notifications_id_seq', (SELECT MAX(id) FROM notifications))`);

        console.log('Secuencia de notificaciones corregida. Reintentando inserción...');

        // Reintentar la inserción
        [newNotification] = await db
          .insert(notifications)
          .values(notification)
          .returning();
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

  async getUserNotifications(userId: number): Promise<Notification[]> {
    const userNotifications = await db.select().from(notifications)
      .where(eq(notifications.userId, userId))
      .orderBy(desc(notifications.createdAt));

    console.log(`getUserNotifications: Found ${userNotifications.length} notifications for user ${userId}`);

    return userNotifications;
  }

  async markNotificationRead(notificationId: number): Promise<void> {
    await db.update(notifications)
      .set({ read: true })
      .where(eq(notifications.id, notificationId));
  }

  async clearAllUserNotifications(userId: number): Promise<void> {
    await db.update(notifications)
      .set({ read: true })
      .where(eq(notifications.userId, userId));
  }



  async getRepositions(area?: Area, userArea?: Area | 'admin' | 'envios' | 'diseño'): Promise<Reposition[]> {
    console.log(`Getting repositions for area: ${area}, userArea: ${userArea}`);

    let query = db.select().from(repositions);

    if (userArea === 'diseño') {
      // Diseño puede ver todas las reposiciones aprobadas
      query = (query as any).where(
        and(
          eq(repositions.status, 'aprobado' as RepositionStatus),
          ne(repositions.status, 'eliminado' as RepositionStatus)
        )
      );
      console.log('Applied diseño filter: aprobado status only');
    } else if (userArea !== 'admin' && userArea !== 'envios') {
      // Otras áreas no pueden ver reposiciones eliminadas, completadas ni canceladas
      query = (query as any).where(
        and(
          ne(repositions.status, 'eliminado' as RepositionStatus),
          ne(repositions.status, 'completado' as RepositionStatus),
          ne(repositions.status, 'cancelado' as RepositionStatus)
        )
      );
      console.log('Applied non-admin filter: excluding eliminated, completed, and cancelled');
    } else {
      console.log('No status filters applied (admin/envios area)');
    }

    const results = await (query as any).orderBy(desc(repositions.createdAt));
    console.log(`Found ${results.length} repositions for user area ${userArea}`);

    if (results.length > 0) {
      console.log('Sample results:', results.slice(0, 3).map((r: any) => ({
        folio: r.folio,
        status: r.status,
        type: r.type
      })));
    }

    return results;
  }

  async getRepositionsByArea(area: Area, userId?: number): Promise<Reposition[]> {
    let whereCondition;

    // Solo admin y envíos pueden ver reposiciones canceladas
    const excludeStatuses = area === 'admin' || area === 'envios'
      ? [ne(repositions.status, 'eliminado' as RepositionStatus)]
      : [
        ne(repositions.status, 'eliminado' as RepositionStatus),
        ne(repositions.status, 'completado' as RepositionStatus),
        ne(repositions.status, 'cancelado' as RepositionStatus)
      ];

    if (userId) {
      // Si se proporciona userId, mostrar reposiciones del área actual O creadas por el usuario
      whereCondition = and(
        or(
          eq(repositions.currentArea, area),
          eq(repositions.createdBy, userId)
        ),
        ...excludeStatuses
      );
    } else {
      // Sin userId, solo mostrar del área actual
      whereCondition = and(
        eq(repositions.currentArea, area),
        ...excludeStatuses
      );
    }

    return await db.select().from(repositions)
      .where(whereCondition)
      .orderBy(desc(repositions.createdAt));
  }

  async getRepositionById(id: number): Promise<Reposition | undefined> {
    const [reposition] = await db.select().from(repositions).where(eq(repositions.id, id));
    return reposition || undefined;
  }

  async getNextRepositionCounter(): Promise<number> {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;

    const yearStr = year.toString();
    const monthStr = String(month).padStart(2, '0');
    const monthYear = `${monthStr}-${yearStr.slice(-2)}`;

    // Ensure counter exists for this month
    await db.execute(sql`
      INSERT INTO reposition_folio_counters (month_year, current_value)
      VALUES (${monthYear}, 0)
      ON CONFLICT (month_year) DO NOTHING
    `);

    // Increment and get new value
    const result = await db.execute(sql`
      UPDATE reposition_folio_counters
      SET current_value = current_value + 1
      WHERE month_year = ${monthYear}
      RETURNING current_value
    `);

    if (result.rows.length > 0) {
      return result.rows[0].current_value as number;
    }

    // Fallback if something fails (shouldn't happen)
    return 1;
  }

  async approveReposition(repositionId: number, action: RepositionStatus, userId: number, notes?: string): Promise<Reposition> {
    const [reposition] = await db.update(repositions)
      .set({
        status: action,
        approvedBy: userId,
        approvedAt: new Date(),
        rejectionReason: action === 'rechazado' ? notes : null,
        // NO cambiar área automáticamente, mantener en área actual
      })
      .where(eq(repositions.id, repositionId))
      .returning();

    await this.addRepositionHistory(
      repositionId,
      action === 'aprobado' ? 'approved' : 'rejected',
      `Reposición ${action === 'aprobado' ? 'aprobada' : 'rechazada'}${notes ? `: ${notes}` : ''}`,
      userId,
    );

    // Notificar al solicitante original
    await this.createNotification({
      userId: reposition.createdBy,
      type: action === 'aprobado' ? 'reposition_approved' : 'reposition_rejected',
      title: action === 'aprobado' ? 'Reposición Aprobada' : 'Reposición Rechazada',
      message: `Tu reposición ${reposition.folio} ha sido ${action === 'aprobado' ? 'aprobada' : 'rechazada'}${notes ? `: ${notes}` : ''}`,
      repositionId: repositionId,
    });

    return reposition;
  }

  async createRepositionTransfer(transfer: InsertRepositionTransfer, createdBy: number): Promise<RepositionTransfer> {
    const [repositionTransfer] = await db.insert(repositionTransfers)
      .values({
        ...transfer,
        createdBy,
        createdAt: new Date()
      })
      .returning();

    await this.addRepositionHistory(
      transfer.repositionId, 'transfer_requested', `Transfer requested from ${transfer.fromArea} to ${transfer.toArea}`,
      createdBy,
      transfer.fromArea,
      transfer.toArea
    );

    // Obtener la reposición para el folio
    const reposition = await this.getRepositionById(transfer.repositionId);

    // Notificar a usuarios del área de destino
    const targetAreaUsers = await db.select().from(users)
      .where(eq(users.area, transfer.toArea));

    for (const user of targetAreaUsers) {
      await this.createNotification({
        userId: user.id,
        type: 'reposition_transfer',
        title: 'Nueva Transferencia de Reposición',
        message: `Se ha solicitado transferir la reposición ${reposition?.folio} de ${transfer.fromArea} a ${transfer.toArea}`,
        repositionId: transfer.repositionId,
      });
    }

    return repositionTransfer;
  }

  async processRepositionTransfer(transferId: number, action: 'accepted' | 'rejected', userId: number, reason?: string): Promise<RepositionTransfer> {
    const updateData: any = {
      status: action,
      processedBy: userId,
      processedAt: new Date()
    };

    // Si es un rechazo, guardar la razón en las notas
    if (action === 'rejected' && reason) {
      updateData.notes = reason;
    }

    const [transfer] = await db.update(repositionTransfers)
      .set(updateData)
      .where(eq(repositionTransfers.id, transferId))
      .returning();

    if (action === 'accepted') {
      await db.update(repositions)
        .set({ currentArea: transfer.toArea })
        .where(eq(repositions.id, transfer.repositionId));
    }

    const historyDescription = action === 'accepted'
      ? `Transfer ${action} from ${transfer.fromArea} to ${transfer.toArea}`
      : `Transfer ${action} from ${transfer.fromArea} to ${transfer.toArea}${reason ? ` - Motivo: ${reason}` : ''}`;

    await this.addRepositionHistory(
      transfer.repositionId,
      `transfer_${action}`,
      historyDescription,
      userId,
      transfer.fromArea,
      transfer.toArea
    );

    // Obtener la reposición para el folio
    const reposition = await this.getRepositionById(transfer.repositionId);

    // Notificar al solicitante original
    await this.createNotification({
      userId: transfer.createdBy,
      type: 'transfer_processed',
      title: `Transferencia ${action === 'accepted' ? 'Aceptada' : 'Rechazada'}`,
      message: `La transferencia de la reposición ${reposition?.folio} ha sido ${action === 'accepted' ? 'aceptada' : 'rechazada'}`,
      repositionId: transfer.repositionId,
    });

    // Si fue RECHAZADA, notificar a TODOS los usuarios del área de ORIGEN (quienes intentaron enviarla)
    if (action === 'rejected') {
      const originAreaUsers = await db.select().from(users)
        .where(eq(users.area, transfer.fromArea));

      for (const user of originAreaUsers) {
        // Evitar doble notificación si el creador está en el área de origen (ya notificado arriba)
        if (user.id !== transfer.createdBy) {
          await this.createNotification({
            userId: user.id,
            type: 'transfer_processed', // Usamos el mismo tipo para mantener consistencia
            title: 'Transferencia Rechazada',
            message: `La transferencia de la reposición ${reposition?.folio} hacia ${transfer.toArea} ha sido rechazada.${reason ? ` Motivo: ${reason}` : ''}`,
            repositionId: transfer.repositionId,
          });
        }
      }
    }

    // Si fue aceptada, notificar a usuarios del área de destino
    if (action === 'accepted') {
      const targetAreaUsers = await db.select().from(users)
        .where(eq(users.area, transfer.toArea));

      for (const user of targetAreaUsers) {
        if (user.id !== userId) { // No notificar al que procesó
          await this.createNotification({
            userId: user.id,
            type: 'reposition_received',
            title: 'Nueva Reposición Recibida',
            message: `La reposición ${reposition?.folio} ha llegado a tu área`,
            repositionId: reposition?.id,
          });
        }
      }
    }

    return transfer;
  }

  async getRepositionHistory(repositionId: number): Promise<any[]> {
    const historyEntries = await db.select({
      id: repositionHistory.id,
      action: repositionHistory.action,
      description: repositionHistory.description,
      fromArea: repositionHistory.fromArea,
      toArea: repositionHistory.toArea,
      createdAt: repositionHistory.createdAt,
      userName: users.name,
    })
      .from(repositionHistory)
      .leftJoin(users, eq(repositionHistory.userId, users.id))
      .where(eq(repositionHistory.repositionId, repositionId))
      .orderBy(desc(repositionHistory.createdAt));

    return historyEntries.map(entry => ({
      id: entry.id,
      action: entry.action,
      description: entry.description,
      fromArea: entry.fromArea || undefined,
      toArea: entry.toArea || undefined,
      createdAt: entry.createdAt.toISOString(),
      userName: entry.userName || 'Usuario desconocido'
    }));
  }

  async createAdminPassword(password: string, createdBy: number): Promise<AdminPassword> {
    const [adminPassword] = await db.insert(adminPasswords)
      .values({
        password,
        createdBy,
      })
      .returning();

    return adminPassword;
  }

  async verifyAdminPassword(password: string): Promise<boolean> {
    const [adminPassword] = await db.select().from(adminPasswords)
      .where(and(eq(adminPasswords.password, password), eq(adminPasswords.isActive, true)))
      .orderBy(desc(adminPasswords.createdAt));

    return !!adminPassword;
  }

  async updateRepositionConsumo(repositionId: number, consumoTela: number): Promise<void> {
    await db.update(repositions)
      .set({ consumoTela })
      .where(eq(repositions.id, repositionId));
  }

  async cancelReposition(repositionId: number, userId: number, reason: string): Promise<void> {
    console.log('Cancelling reposition:', repositionId, 'by user:', userId, 'reason:', reason);

    // Obtener la reposición antes de cancelarla
    const reposition = await this.getRepositionById(repositionId);
    if (!reposition) {
      throw new Error('Reposición no encontrada');
    }

    console.log('Found reposition:', reposition.folio);

    await db.update(repositions)
      .set({
        status: 'cancelado' as RepositionStatus,
        completedAt: new Date(),
      })
      .where(eq(repositions.id, repositionId));

    console.log('Updated reposition status to cancelado');

    await this.addRepositionHistory(
      repositionId,
      'canceled',
      `Reposición cancelada. Motivo: ${reason}`,
      userId,
    );

    console.log('Added history entry');

    // Crear notificación para el solicitante si no es la misma persona
    if (reposition.createdBy !== userId) {
      await this.createNotification({
        userId: reposition.createdBy,
        type: 'reposition_canceled',
        title: 'Reposición Cancelada',
        message: `La reposición ${reposition.folio} ha sido cancelada. Motivo: ${reason}`,
        repositionId: repositionId,
      });
      console.log('Created notification for user:', reposition.createdBy);
    }
  }

  async deleteReposition(repositionId: number, userId: number): Promise<void> {
    console.log('Permanently deleting reposition:', repositionId, 'requested by user:', userId);

    const reposition = await this.getRepositionById(repositionId);
    if (!reposition) {
      throw new Error('Reposición no encontrada');
    }

    // Manual cleanup of related tables to ensure hard delete

    // Notifications (Likely no FK constraint to cascade)
    await db.delete(notifications).where(eq(notifications.repositionId, repositionId));

    // Child tables (Explicit deletes to be safe)
    await db.delete(repositionPieces).where(eq(repositionPieces.repositionId, repositionId));
    await db.delete(repositionProducts).where(eq(repositionProducts.repositionId, repositionId));
    await db.delete(repositionMaterials).where(eq(repositionMaterials.repositionId, repositionId));
    await db.delete(repositionContrastFabrics).where(eq(repositionContrastFabrics.repositionId, repositionId));
    await db.delete(documents).where(eq(documents.repositionId, repositionId));

    // History, Timers, Transfers
    await db.delete(repositionHistory).where(eq(repositionHistory.repositionId, repositionId));
    await db.delete(repositionTimers).where(eq(repositionTimers.repositionId, repositionId));
    await db.delete(repositionTransfers).where(eq(repositionTransfers.repositionId, repositionId));

    // Finally delete the reposition
    await db.delete(repositions).where(eq(repositions.id, repositionId));

    console.log(`Reposition ${reposition.folio} (ID: ${repositionId}) permanently deleted.`);
  }

  async completeReposition(repositionId: number, userId: number, notes?: string): Promise<void> {
    const now = new Date();

    console.log('Completing reposition:', {
      repositionId,
      userId,
      completedAt: now,
      notes
    });

    await db.update(repositions)
      .set({
        status: 'completado' as RepositionStatus,
        completedAt: now,
        approvedBy: userId
      })
      .where(eq(repositions.id, repositionId));

    // Verificar que se actualizó correctamente
    const updatedReposition = await this.getRepositionById(repositionId);
    console.log('Reposition after completion update:', {
      id: updatedReposition?.id,
      status: updatedReposition?.status,
      completedAt: updatedReposition?.completedAt,
      approvedBy: updatedReposition?.approvedBy
    });

    await this.addRepositionHistory(
      repositionId,
      'completed',
      `Reposición finalizada${notes ? ` - ${notes}` : ''}`,
      userId
    );

    // Crear notificación para el solicitante
    const reposition = await this.getRepositionById(repositionId);
    if (reposition && reposition.createdBy !== userId) {
      await this.createNotification({
        userId: reposition.createdBy,
        type: 'reposition_completed',
        title: 'Reposición Completada',
        message: `La reposición ${reposition.folio} ha sido completada${notes ? `: ${notes}` : ''}`,
        repositionId: repositionId,
      });
    }
  }

  async requestCompletionApproval(repositionId: number, userId: number, notes?: string): Promise<void> {
    await this.addRepositionHistory(
      repositionId,
      'completion_requested',
      `Solicitud de finalización enviada${notes ? `: ${notes}` : ''}`,
      userId,
    );

    // Crear notificaciones para admin, envíos y operaciones
    const adminUsers = await db.select().from(users)
      .where(eq(users.area, 'admin'));

    const enviosUsers = await db.select().from(users)
      .where(eq(users.area, 'envios'));

    const operacionesUsers = await db.select().from(users)
      .where(eq(users.area, 'operaciones'));

    const allTargetUsers = [...adminUsers, ...enviosUsers, ...operacionesUsers];

    const reposition = await this.getRepositionById(repositionId);
    if (reposition) {
      for (const targetUser of allTargetUsers) {
        await this.createNotification({
          userId: targetUser.id,
          type: 'completion_approval_needed',
          title: 'Solicitud de Finalización',
          message: `Se solicita aprobación para finalizar la reposición ${reposition.folio}${notes ? `: ${notes}` : ''}`,
          repositionId: repositionId
        });
      }
    }
  }

  async getPendingRepositionsCount(): Promise<number> {
    const repositions = await this.getAllRepositions(false);
    return repositions.filter(r => r.status === 'pendiente').length;
  }

  async getAllRepositions(includeDeleted: boolean = false): Promise<Reposition[]> {
    let query;

    if (!includeDeleted) {
      query = db.select().from(repositions).where(ne(repositions.status, 'eliminado' as RepositionStatus));
    } else {
      query = db.select().from(repositions);
    }

    return await query.orderBy(desc(repositions.createdAt));
  }


  async getRecentRepositions(area?: Area, limit: number = 10): Promise<Reposition[]> {
    let whereCondition: any = ne(repositions.status, 'eliminado' as RepositionStatus);

    if (area && area !== 'admin') {
      whereCondition = and(
        ne(repositions.status, 'eliminado' as RepositionStatus),
        eq(repositions.currentArea, area)
      );
    }

    return await db.select().from(repositions)
      .where(whereCondition)
      .orderBy(desc(repositions.createdAt))
      .limit(limit);
  }

  async getRepositionTracking(repositionId: number): Promise<any> {
    console.log('Getting tracking for reposition ID:', repositionId);

    const reposition = await this.getRepositionById(repositionId);
    if (!reposition) {
      console.log('Reposicion not found for ID:', repositionId);
      throw new Error('Reposición no encontrada');
    }

    console.log('Found reposition:', reposition.folio);
    const history = await this.getRepositionHistory(repositionId);
    console.log('History entries:', history.length);

    // Obtener transferencias con información de usuarios
    const transfersFromDB = await db.query.repositionTransfers.findMany({
      where: eq(repositionTransfers.repositionId, repositionId),
      orderBy: desc(repositionTransfers.createdAt),
      with: {
        creator: true,
        processor: true
      }
    });

    console.log('Transfers found:', transfersFromDB.length);

    // Obtener tiempos por área - query básico sin select específico
    let timersFromDB: any[] = [];
    try {
      timersFromDB = await db.select().from(repositionTimers)
        .where(eq(repositionTimers.repositionId, repositionId));
    } catch (timerError) {
      console.error('Error fetching timers:', timerError);
      timersFromDB = [];
    }

    console.log('Timers found:', timersFromDB.length);

    // Solo mostrar áreas que tienen tiempos registrados o el área actual
    const areasWithTimers = timersFromDB.map(t => t.area);
    const allRelevantAreas = Array.from(new Set([...areasWithTimers, reposition.currentArea]));

    // Ordenar las áreas según el flujo estándar
    const areaOrder = ['patronaje', 'corte', 'bordado', 'ensamble', 'plancha', 'calidad'];
    const sortedAreas = allRelevantAreas.sort((a, b) => {
      const indexA = areaOrder.indexOf(a);
      const indexB = areaOrder.indexOf(b);
      return indexA - indexB;
    });

    console.log('Relevant areas for this reposition:', sortedAreas);

    // Crear pasos del proceso solo para áreas relevantes
    const stepsFromAreas = sortedAreas.map((area, index) => {
      const areaTimer = timersFromDB.find(t => t.area === area);
      let status: 'completed' | 'current' | 'pending' = 'pending';

      // Determinar status basado en si hay timer registrado y área actual
      if (areaTimer && areaTimer.manualStartTime && areaTimer.manualEndTime) {
        status = 'completed';
      } else if (area === reposition.currentArea && reposition.status !== 'completado') {
        status = 'current';
      } else if (reposition.status === 'completado') {
        status = 'completed';
      }

      let timeSpent = undefined;
      let timeInMinutes = 0;

      // Solo calcular si tenemos tanto tiempo de inicio como de fin
      if (areaTimer && areaTimer.manualStartTime && areaTimer.manualEndTime) {
        // Usar elapsedMinutes del timer si está disponible y es válido
        if (areaTimer.elapsedMinutes && !isNaN(areaTimer.elapsedMinutes) && areaTimer.elapsedMinutes > 0) {
          timeInMinutes = areaTimer.elapsedMinutes;
        } else {
          // Calcular manualmente
          const [startHour, startMinute] = areaTimer.manualStartTime.split(':').map(Number);
          const [endHour, endMinute] = areaTimer.manualEndTime.split(':').map(Number);

          // Validar que los números son válidos
          if (!isNaN(startHour) && !isNaN(startMinute) && !isNaN(endHour) && !isNaN(endMinute)) {
            const startTotalMinutes = startHour * 60 + startMinute;
            const endTotalMinutes = endHour * 60 + endMinute;

            timeInMinutes = endTotalMinutes - startTotalMinutes;
            if (timeInMinutes < 0) {
              timeInMinutes += 24 * 60; // Trabajo cruzó medianoche
            }
          }
        }

        // Solo asignar timeSpent si tenemos un valor válido
        if (!isNaN(timeInMinutes) && timeInMinutes > 0) {
          const hours = Math.floor(timeInMinutes / 60);
          const minutes = Math.round(timeInMinutes % 60);
          timeSpent = hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
        }
      }

      // Buscar el evento de historia más reciente para esta área
      const areaHistory = history.find(h =>
        h.toArea === area ||
        (area === 'patronaje' && h.action === 'created') ||
        h.action === 'manual_time_set' && h.description?.includes(area)
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

    // Calcular tiempos por área - incluir tiempos manuales registrados
    const areaTimesCalculated: Record<string, number> = {};

    // Primero, procesar los timers de la base de datos
    timersFromDB.forEach(timer => {
      let elapsedMinutes = 0;

      // Solo calcular si tenemos tanto tiempo de inicio como de fin
      if (timer.manualStartTime && timer.manualEndTime) {
        // Usar elapsedMinutes del timer si está disponible y es válido
        if (timer.elapsedMinutes && !isNaN(timer.elapsedMinutes) && timer.elapsedMinutes > 0) {
          elapsedMinutes = timer.elapsedMinutes;
        } else {
          // Calcular manualmente
          const [startHour, startMinute] = timer.manualStartTime.split(':').map(Number);
          const [endHour, endMinute] = timer.manualEndTime.split(':').map(Number);

          // Validar que los números son válidos
          if (!isNaN(startHour) && !isNaN(startMinute) && !isNaN(endHour) && !isNaN(endMinute)) {
            const startTotalMinutes = startHour * 60 + startMinute;
            const endTotalMinutes = endHour * 60 + endMinute;

            elapsedMinutes = endTotalMinutes - startTotalMinutes;
            if (elapsedMinutes < 0) {
              elapsedMinutes += 24 * 60; // Trabajo cruzó medianoche
            }
          }
        }

        // Solo asignar si tenemos un valor válido
        if (!isNaN(elapsedMinutes) && elapsedMinutes > 0) {
          areaTimesCalculated[timer.area] = (areaTimesCalculated[timer.area] || 0) + elapsedMinutes;
        }
      }
    });

    // Segundo, buscar tiempos manuales en el historial
    history.forEach(event => {
      if (event.description && event.description.includes('Tiempo manual registrado:')) {
        // Extraer el tiempo y área del mensaje
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

    console.log('Area times calculated:', areaTimesCalculated);

    // Calcular tiempo total
    const validTimes = Object.values(areaTimesCalculated).filter(minutes => !isNaN(minutes) && minutes > 0);
    const totalMinutesCalculated = validTimes.reduce((sum, minutes) => sum + minutes, 0);
    const totalHours = Math.floor(totalMinutesCalculated / 60);
    const remainingMinutes = Math.round(totalMinutesCalculated % 60);
    const totalTimeFormatted = totalMinutesCalculated > 0 ?
      (totalHours > 0 ? `${totalHours}h ${remainingMinutes}m` : `${remainingMinutes}m`) :
      "0m";

    // Calcular progreso basado en áreas completadas vs áreas relevantes
    const completedSteps = stepsFromAreas.filter(s => s.status === 'completed').length;
    const progress = sortedAreas.length > 0 ? Math.round((completedSteps / sortedAreas.length) * 100) : 0;

    const result = {
      reposition: {
        folio: reposition.folio,
        status: reposition.status,
        currentArea: reposition.currentArea,
        progress
      },
      steps: stepsFromAreas,
      history,
      transfers: transfersFromDB.map(t => ({
        id: t.id,
        fromArea: t.fromArea,
        toArea: t.toArea,
        status: t.status || 'pending',
        notes: t.notes || '',
        createdAt: t.createdAt,
        processedAt: t.processedAt || null,
        transferredBy: t.creator ? t.creator.name : 'Usuario Desconocido',
        processedBy: t.processor ? t.processor.name : null
      })),
      totalTime: {
        formatted: totalTimeFormatted,
        minutes: totalMinutesCalculated
      },
      areaTimes: areaTimesCalculated
    };

    console.log('Returning tracking data:', JSON.stringify(result, null, 2));
    return result;
  }



  async getPendingRepositionTransfers(userArea: Area): Promise<RepositionTransfer[]> {
    return await db.select().from(repositionTransfers)
      .where(and(
        eq(repositionTransfers.toArea, userArea),
        eq(repositionTransfers.status, 'pending')
      ))
      .orderBy(desc(repositionTransfers.createdAt));
  }

  async hasRecentTransfer(repositionId: number, fromArea: Area): Promise<{ hasRecent: boolean, remainingTime?: number }> {
    // Primero verificar si hay alguna transferencia pendiente de esta área para esta reposición
    const pendingTransfer = await db.select().from(repositionTransfers)
      .where(and(
        eq(repositionTransfers.repositionId, repositionId),
        eq(repositionTransfers.fromArea, fromArea),
        eq(repositionTransfers.status, 'pending')
      ))
      .limit(1);

    if (pendingTransfer.length > 0) {
      // Si hay una transferencia pendiente, calcular el tiempo restante basado en cuando fue creada
      const transferTime = new Date(pendingTransfer[0].createdAt);
      const now = new Date();
      const timeDiffMs = now.getTime() - transferTime.getTime();
      const fiveMinutesMs = 5 * 60 * 1000;
      const remainingMs = fiveMinutesMs - timeDiffMs;

      if (remainingMs > 0) {
        const remainingMinutes = Math.ceil(remainingMs / (60 * 1000));
        return {
          hasRecent: true,
          remainingTime: Math.max(1, remainingMinutes)
        };
      }
    }

    // También verificar transferencias recientes (últimos 5 minutos) independientemente del estado
    const fiveMinutesAgo = new Date();
    fiveMinutesAgo.setMinutes(fiveMinutesAgo.getMinutes() - 5);

    const recentTransfer = await db.select().from(repositionTransfers)
      .where(and(
        eq(repositionTransfers.repositionId, repositionId),
        eq(repositionTransfers.fromArea, fromArea),
        gte(repositionTransfers.createdAt, fiveMinutesAgo)
      ))
      .orderBy(desc(repositionTransfers.createdAt))
      .limit(1);

    if (recentTransfer.length > 0) {
      const transferTime = new Date(recentTransfer[0].createdAt);
      const now = new Date();
      const timeDiffMs = now.getTime() - transferTime.getTime();
      const remainingMs = (5 * 60 * 1000) - timeDiffMs;

      if (remainingMs > 0) {
        const remainingMinutes = Math.ceil(remainingMs / (60 * 1000));
        return {
          hasRecent: true,
          remainingTime: Math.max(1, remainingMinutes)
        };
      }
    }

    return { hasRecent: false };
  }


  // Agenda Events
  async getAgendaEvents(user: any): Promise<any[]> {
    // Admin y Envíos ven todas las tareas, otras áreas solo las asignadas a ellas
    if (user.area === 'admin' || user.area === 'envios') {
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
      })
        .from(agendaEvents)
        .leftJoin(users, eq(agendaEvents.createdBy, users.id))
        .orderBy(asc(agendaEvents.date), asc(agendaEvents.time));
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
      })
        .from(agendaEvents)
        .leftJoin(users, eq(agendaEvents.createdBy, users.id))
        .where(eq(agendaEvents.assignedToArea, user.area as Area))
        .orderBy(asc(agendaEvents.date), asc(agendaEvents.time));
    }
  }

  async createAgendaEvent(eventData: any): Promise<any> {
    const [event] = await db
      .insert(agendaEvents)
      .values(eventData)
      .returning();

    return event;
  }

  async updateAgendaEvent(eventId: number, eventData: any): Promise<any> {
    const [event] = await db
      .update(agendaEvents)
      .set(eventData)
      .where(eq(agendaEvents.id, eventId))
      .returning();

    if (!event) {
      throw new Error("Tarea no encontrada");
    }

    return event;
  }

  async updateTaskStatus(eventId: number, userArea: string, status: string): Promise<any> {
    const [event] = await db.update(agendaEvents)
      .set({ status, updatedAt: new Date() })
      .where(and(
        eq(agendaEvents.id, eventId),
        eq(agendaEvents.assignedToArea, userArea as Area)
      ))
      .returning();

    if (!event) {
      throw new Error("Tarea no encontrada o no asignada a tu área");
    }

    return event;
  }

  async deleteAgendaEvent(eventId: number): Promise<void> {
    const result = await db
      .delete(agendaEvents)
      .where(eq(agendaEvents.id, eventId));

    if (result.rowCount === 0) {
      throw new Error("Tarea no encontrada");
    }
  }


  async generateReport(
    type: string,
    format: string,
    startDate: string,
    endDate: string,
    filters: { area?: string; status?: string; urgency?: string }
  ): Promise<Buffer> {
    throw new Error("Method not implemented.");
  }
  async saveReportToOneDrive(type: string, startDate: string, endDate: string, filters: any): Promise<any> {
    throw new Error("Method not implemented.");
  }

  async startRepositionTimer(repositionId: number, userId: number, area: string): Promise<any> {
    console.log('Starting timer for reposition:', repositionId, 'user:', userId, 'area:', area);

    // Verificar que la reposición existe y está aprobada
    const reposition = await this.getRepositionById(repositionId);
    if (!reposition) {
      throw new Error('Reposición no encontrada');
    }

    if (reposition.status !== 'aprobado') {
      throw new Error('Solo se puede iniciar el cronómetro en reposiciones aprobadas');
    }

    // Verificar si el usuario es el creador original de la reposición
    if (reposition.createdBy === userId) {
      throw new Error('El creador de la reposición no debe registrar tiempo');
    }

    // Verificar si ya hay un timer activo para esta reposición y área
    const existingTimer = await db.select()
      .from(repositionTimers)
      .where(and(
        eq(repositionTimers.repositionId, repositionId),
        eq(repositionTimers.area, area as Area),
        isNull(repositionTimers.endTime)
      ))
      .limit(1);

    if (existingTimer.length > 0) {
      throw new Error('Ya hay un cronómetro activo para esta área en esta reposición');
    }

    // Crear nuevo timer
    const newTimer = await db.insert(repositionTimers)
      .values({
        repositionId,
        area: area as Area,
        userId,
        startTime: new Date()
      })
      .returning();

    // Agregar entrada al historial
    await this.addRepositionHistory(
      repositionId,
      'timer_started',
      `Cronómetro iniciado en área ${area}`,
      userId
    );

    console.log('Timer started successfully:', newTimer[0]);
    return newTimer[0];
  }

  async stopRepositionTimer(repositionId: number, area: Area, userId: number): Promise<{ elapsedTime: string }> {
    // Buscar el timer activo para esta reposición
    const [activeTimer] = await db.select().from(repositionTimers)
      .where(and(
        eq(repositionTimers.repositionId, repositionId),
        eq(repositionTimers.isRunning, true)
      ))
      .orderBy(desc(repositionTimers.startTime));

    if (!activeTimer) {
      throw new Error('No hay cronómetro activo para esta reposición');
    }

    const endTime = new Date();
    const startTime = new Date(activeTimer.startTime!);
    const elapsedMilliseconds = endTime.getTime() - startTime.getTime();
    const elapsedMinutes = Math.floor(elapsedMilliseconds / (1000 * 60));

    //// Formatear tiempo transcurrido
    const hours = Math.floor(elapsedMinutes / 60);
    const minutes = elapsedMinutes % 60;
    const elapsedTimeFormatted = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:00`;

    // Actualizar el timer
    await db.update(repositionTimers)
      .set({
        endTime,
        elapsedMinutes,
        isRunning: false,
      })
      .where(eq(repositionTimers.id, activeTimer.id));

    // Obtener información del usuario
    const user = await this.getUser(userId);

    // Registrar en el historial
    await db.insert
      (repositionHistory).values({
        repositionId,
        action: 'timer_stopped',
        description: `Cronómetro detenido por ${user?.name || 'Usuario'} en área ${area}. Tiempo transcurrido: ${elapsedTimeFormatted}`,
        userId,
      });

    console.log(`Timer stopped for reposition ${repositionId} by user ${userId} in area ${area}. Elapsed: ${elapsedTimeFormatted}`);

    return { elapsedTime: elapsedTimeFormatted };
  }

  async getRepositionTimers(repositionId: number): Promise<LocalRepositionTimer[]> {
    // Implement timer retrieval logic here
    console.log(`Retrieving timers for reposition ${repositionId}`);
    const timers = await db.select().from(repositionTimers)
      .where(eq(repositionTimers.repositionId, repositionId));

    const localTimers: LocalRepositionTimer[] = timers.map(timer => {
      const startTime = timer.startTime ? new Date(timer.startTime) : null;
      const endTime = timer.endTime ? new Date(timer.endTime) : null;

      let elapsedMinutes = timer.elapsedMinutes || 0;
      if (startTime && endTime) {
        elapsedMinutes = (endTime.getTime() - startTime.getTime()) / (1000 * 60);
      }
      const hours = Math.floor(elapsedMinutes / 60);
      const minutes = Math.floor(elapsedMinutes % 60);
      const elapsedTime = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:00`;

      return {
        id: timer.id,
        repositionId: timer.repositionId,
        userId: timer.userId,
        area: timer.area,
        startTime: startTime!,
        endTime: endTime,
        elapsedTime,
      };
    });
    return localTimers;
  }

  async getReportData(type: string, startDate: string, endDate: string, filters: any): Promise<any> {
    // Implement report data retrieval logic here
    throw new Error("Method not implemented.");
  }

  async getUserAgendaEvents(userId: number): Promise<any[]> {
    // Implement user agenda events retrieval logic here
    throw new Error("Method not implemented.");
  }

  async setManualRepositionTime(
    repositionId: number,
    area: string,
    userId: number,
    startTime: string,
    endTime: string,
    startDate: string,
    endDate: string
  ): Promise<any> {
    console.log('Setting manual time for reposition:', repositionId, 'area:', area, 'user:', userId);

    // Verificar que la reposición existe
    const reposition = await this.getRepositionById(repositionId);
    if (!reposition) {
      throw new Error('Reposición no encontrada');
    }

    // Validar que las fechas y horas sean válidas
    if (!startTime || !endTime || !startDate || !endDate) {
      throw new Error('Todos los campos de fecha y hora son requeridos');
    }

    // Convertir strings a Date objects usando las fechas correctas
    // Para manejar zonas horarias, vamos a crear las fechas como objetos Date locales
    const startDateTime = new Date(`${startDate}T${startTime}:00`);
    const endDateTime = new Date(`${endDate}T${endTime}:00`);

    console.log('Start DateTime:', startDateTime);
    console.log('End DateTime:', endDateTime);
    console.log('Start Date String:', `${startDate}T${startTime}:00`);
    console.log('End Date String:', `${endDate}T${endTime}:00`);

    if (startDateTime >= endDateTime) {
      throw new Error('La hora de inicio debe ser anterior a la hora de fin');
    }

    // Calcular duración en minutos
    const durationMs = endDateTime.getTime() - startDateTime.getTime();
    const durationMinutes = Math.round(durationMs / (1000 * 60));

    console.log('Duration in minutes:', durationMinutes);

    // Validar que la duración sea positiva y razonable (máximo 24 horas)
    if (durationMinutes <= 0) {
      throw new Error('La duración debe ser positiva');
    }

    if (durationMinutes > 24 * 60) {
      throw new Error('La duración no puede exceder 24 horas');
    }

    // Verificar si ya existe un timer para esta reposición y área
    const existingTimer = await db.select()
      .from(repositionTimers)
      .where(and(
        eq(repositionTimers.repositionId, repositionId),
        eq(repositionTimers.area, area as any)
      ))
      .limit(1);

    if (existingTimer.length > 0) {
      // Actualizar timer existente
      await db.update(repositionTimers)
        .set({
          manualStartTime: startTime,
          manualEndTime: endTime,
          startTime: startDateTime,
          endTime: endDateTime,
          elapsedMinutes: durationMinutes,
          isRunning: false,
          userId: userId,
          manualDate: startDate
        })
        .where(eq(repositionTimers.id, existingTimer[0].id));

      console.log('Updated existing timer with manual time');
    } else {
      // Crear nuevo timer
      await db.insert(repositionTimers).values({
        repositionId,
        area: area as any,
        userId,
        startTime: startDateTime,
        endTime: endDateTime,
        elapsedMinutes: durationMinutes,
        isRunning: false,
        manualStartTime: startTime,
        manualEndTime: endTime,
        manualDate: startDate
      });

      console.log('Created new timer with manual time');
    }

    // Agregar entrada al historial
    await this.addRepositionHistory(
      repositionId,
      'timer_manual',
      `Tiempo manual: ${Math.floor(durationMinutes / 60)}h ${durationMinutes % 60}m`,
      userId
    );

    const hours = Math.floor(durationMinutes / 60);
    const minutes = durationMinutes % 60;
    const elapsedTime = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:00`;

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

  async getRepositionTimer(repositionId: number, area: Area): Promise<SharedRepositionTimer | null> {
    const [timer] = await db.select().from(repositionTimers)
      .where(and(
        eq(repositionTimers.repositionId, repositionId),
        eq(repositionTimers.area, area)
      )).limit(1);

    return timer || null;
  }



  // Funciones para gestión de materiales
  async updateRepositionMaterialStatus(repositionId: number, materialStatus: string, missingMaterials?: string, notes?: string): Promise<void> {
    const existingMaterial = await db.select().from(repositionMaterials)
      .where(eq(repositionMaterials.repositionId, repositionId))
      .limit(1);

    if (existingMaterial.length > 0) {
      await db.update(repositionMaterials)
        .set({
          materialStatus: materialStatus as any,
          missingMaterials,
          notes,
          updatedAt: new Date()
        })
        .where(eq(repositionMaterials.repositionId, repositionId));
    } else {
      await db.insert(repositionMaterials).values({
        repositionId,
        materialStatus: materialStatus as any,
        missingMaterials,
        notes
      });
    }

    // Registrar en historial
    await this.addRepositionHistory(
      repositionId,
      'material_status_updated',
      `Estado de materiales actualizado: ${materialStatus}${missingMaterials ? ` - Faltantes: ${missingMaterials}` : ''}`,
      1 // Esto debería ser el ID del usuario actual
    );
  }

  async pauseReposition(repositionId: number, reason: string, userId: number): Promise<void> {
    const existingMaterial = await db.select().from(repositionMaterials)
      .where(eq(repositionMaterials.repositionId, repositionId))
      .limit(1);

    if (existingMaterial.length > 0) {
      await db.update(repositionMaterials)
        .set({
          isPaused: true,
          pauseReason: reason,
          pausedBy: userId,
          pausedAt: new Date(),
          updatedAt: new Date()
        })
        .where(eq(repositionMaterials.repositionId, repositionId));
    } else {
      await db.insert(repositionMaterials).values({
        repositionId,
        isPaused: true,
        pauseReason: reason,
        pausedBy: userId,
        pausedAt: new Date()
      });
    }

    // Registrar en historial
    await this.addRepositionHistory(
      repositionId,
      'paused',
      `Reposición pausada por almacén. Motivo: ${reason}`,
      userId
    );

    // Notificar a áreas relevantes
    const areaUsers = await db.select().from(users)
      .where(or(
        eq(users.area, 'admin'),
        eq(users.area, 'operaciones'),
        eq(users.area, 'envios')
      ));

    for (const user of areaUsers) {
      await this.createNotification({
        userId: user.id,
        type: 'reposition_paused',
        title: 'Reposición Pausada',
        message: `La reposición ha sido pausada por almacén. Motivo: ${reason}`,
        repositionId
      });
    }
  }

  async resumeReposition(repositionId: number, userId: number): Promise<void> {
    await db.transaction(async (tx) => {
      // Update the reposition material status
      await tx.update(repositionMaterials)
        .set({
          isPaused: false,
          resumedBy: userId,
          resumedAt: new Date(),
          updatedAt: new Date()
        })
        .where(eq(repositionMaterials.repositionId, repositionId));

      // Add history entry
      await tx.insert(repositionHistory).values({
        repositionId,
        action: 'resumed',
        description: 'Reposición reanudada por almacén',
        userId,
      });
    });
  }

  async reactivateReposition(repositionId: number, userId: number, reason: string): Promise<void> {
    await db.transaction(async (tx) => {
      // Get the current reposition
      const [reposition] = await tx.select().from(repositions)
        .where(eq(repositions.id, repositionId))
        .limit(1);

      if (!reposition) {
        throw new Error('Reposición no encontrada');
      }

      // Update reposition status back to 'aprobado' and remove completion date
      await tx.update(repositions)
        .set({
          status: 'aprobado',
          completedAt: null
        })
        .where(eq(repositions.id, repositionId));

      // Add history entry with Mexico timestamp
      await tx.insert(repositionHistory).values({
        repositionId,
        action: 'reactivated',
        description: `Reposición reactivada - Motivo: ${reason}`,
        userId,
        createdAt: new Date()
      });

      // Create notification for the creator
      const usersToSend = await tx.select().from(users)
        .where(eq(users.area, reposition.solicitanteArea));

      for (const user of usersToSend) {
        await tx.insert(notifications).values({
          userId: user.id,
          type: 'reposition_reactivated',
          title: 'Reposición Reactivada',
          message: `La reposición ${reposition.folio} ha sido reactivada y está nuevamente en proceso`,
          repositionId,
          createdAt: new Date()
        });
      }
    });
  }

  async getRepositionMaterialStatus(repositionId: number): Promise<any> {
    const material = await db.select().from(repositionMaterials)
      .where(eq(repositionMaterials.repositionId, repositionId))
      .limit(1);

    return material[0] || null;
  }



  async saveRepositionDocument(documentData: {
    repositionId: number;
    filename: string;
    originalName: string;
    size: number;
    path: string;
    uploadedBy: number;
  }): Promise<any> {
    const allowedExtensions = ['.pdf', '.xml', '.jpg', '.jpeg', '.png'];
    const fileExtension = documentData.originalName.toLowerCase().split('.').pop();

    if (!fileExtension || !allowedExtensions.includes(`.${fileExtension}`)) {
      throw new Error('Tipo de archivo no permitido. Solo se permiten archivos PDF, XML, JPG, PNG y JPEG.');
    }

    let document;
    try {
      [document] = await db.insert(documents)
        .values({
          filename: documentData.filename,
          originalName: documentData.originalName,
          size: documentData.size,
          path: documentData.path,
          repositionId: documentData.repositionId,
          uploadedBy: documentData.uploadedBy,
        })
        .returning();
    } catch (error: any) {
      if (error.code === '23505' && error.constraint === 'documents_pkey') {
        console.log('Error secuencia documents. Corrigiendo...');
        await db.execute(sql`SELECT setval('documents_id_seq', (SELECT MAX(id) FROM documents))`);
        [document] = await db.insert(documents)
          .values({
            filename: documentData.filename,
            originalName: documentData.originalName,
            size: documentData.size,
            path: documentData.path,
            repositionId: documentData.repositionId,
            uploadedBy: documentData.uploadedBy,
          })
          .returning();
      } else {
        throw error;
      }
    }

    return document;
  }


  async getRepositionDocuments(repositionId: number): Promise<any[]> {
    const docs = await db.select({
      id: documents.id,
      filename: documents.filename,
      originalName: documents.originalName,
      size: documents.size,
      uploadedBy: documents.uploadedBy,
      createdAt: documents.createdAt,
      uploaderName: users.name
    })
      .from(documents)
      .leftJoin(users, eq(documents.uploadedBy, users.id))
      .where(eq(documents.repositionId, repositionId))
      .orderBy(documents.createdAt);

    return docs;
  }

  async getRepositionPieces(repositionId: number): Promise<any[]> {
    const pieces = await db.select({
      id: repositionPieces.id,
      repositionProductId: repositionPieces.repositionProductId,
      talla: repositionPieces.talla,
      cantidad: repositionPieces.cantidad,
      unit: repositionPieces.unit,
      folioOriginal: repositionPieces.folioOriginal
    })
      .from(repositionPieces)
      .where(eq(repositionPieces.repositionId, repositionId))
      .orderBy(repositionPieces.id);

    console.log('Pieces from database:', pieces);
    return pieces;
  }

  async getAllRepositionsForAlmacen(): Promise<any[]> {
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
    })
      .from(repositions)
      .leftJoin(repositionMaterials, eq(repositions.id, repositionMaterials.repositionId))
      .where(and(
        ne(repositions.status, 'eliminado' as RepositionStatus),
        ne(repositions.status, 'completado' as RepositionStatus)
      ))
      .orderBy(desc(repositions.createdAt));

    return result;
  }

  async createReposition(data: InsertReposition & { folio: string, productos?: any[], telaContraste?: any[], volverHacer?: string, materialesImplicados?: string, observaciones?: string }, pieces: InsertRepositionPiece[], createdBy: number): Promise<Reposition> {
    const { productos, telaContraste, ...mainRepositionData } = data;

    // Para reposiciones, usar los datos del primer producto si existe
    // Para reposiciones y reprocesos, usar los datos del primer producto si existe
    let repositionData = { ...mainRepositionData };

    // Fix typo: 'repocision' -> 'reposición' and include 'reproceso' logic
    if ((data.type === 'reposición' || data.type === 'reproceso') && productos && productos.length > 0) {
      const firstProduct = productos[0];
      repositionData = {
        ...repositionData,
        modeloPrenda: firstProduct.modeloPrenda || '',
        tela: firstProduct.tela || (data.type === 'reproceso' ? 'N/A' : ''),
        color: firstProduct.color || (data.type === 'reproceso' ? 'N/A' : ''),
        tipoPieza: firstProduct.tipoPieza || (data.type === 'reproceso' ? 'N/A' : ''),
        consumoTela: firstProduct.consumoTela || 0
      };
    } else if (data.type === 'reproceso' && !productos?.length) {
      // Fallback si no hay productos pero es reproceso (aunque el frontend debería enviarlos)
      repositionData = {
        ...repositionData,
        modeloPrenda: repositionData.modeloPrenda || '',
        tela: repositionData.tela || 'N/A',
        color: repositionData.color || 'N/A',
        tipoPieza: repositionData.tipoPieza || 'N/A',
        consumoTela: 0
      };
    }

    let reposition;
    try {
      [reposition] = await db.insert(repositions)
        .values({
          ...repositionData,
          createdBy,
          volverHacer: data.volverHacer,
          descripcionSuceso: data.descripcionSuceso,
          materialesImplicados: data.materialesImplicados,
          observaciones: data.observaciones,
          createdAt: new Date()
        })
        .returning();
    } catch (error: any) {
      // Si el error es por llave duplicada en ID (secuencia desincronizada)
      if (error.code === '23505' && error.constraint === 'repositions_pkey') {
        console.log('Detectado error de secuencia en ID de reposiciones. Intentando corregir...');

        // Corregir la secuencia: setval al máximo ID actual
        await db.execute(sql`SELECT setval('repositions_id_seq', (SELECT MAX(id) FROM repositions))`);

        console.log('Secuencia corregida. Reintentando inserción...');

        // Reintentar la inserción
        [reposition] = await db.insert(repositions)
          .values({
            ...repositionData,
            createdBy,
            volverHacer: data.volverHacer,
            descripcionSuceso: data.descripcionSuceso,
            materialesImplicados: data.materialesImplicados,
            observaciones: data.observaciones,
            createdAt: new Date()
          })
          .returning();
      } else {
        throw error;
      }
    }

    // Guardar productos y sus piezas asociadas
    if (productos && productos.length > 0) {
      try {
        const productPromises = productos.map(async (producto) => {
          // 1. Insertar el producto
          let newProduct;
          try {
            [newProduct] = await db.insert(repositionProducts)
              .values({
                repositionId: reposition.id,
                modeloPrenda: producto.modeloPrenda,
                tela: producto.tela,
                color: producto.color,
                tipoPieza: producto.tipoPieza,
                consumoTela: producto.consumoTela || 0
              })
              .returning();
          } catch (err: any) {
            if (err.code === '23505' && err.constraint === 'reposition_products_pkey') {
              console.log('Error secuencia reposition_products. Corrigiendo...');
              await db.execute(sql`SELECT setval('reposition_products_id_seq', (SELECT MAX(id) FROM reposition_products))`);
              [newProduct] = await db.insert(repositionProducts)
                .values({
                  repositionId: reposition.id,
                  modeloPrenda: producto.modeloPrenda,
                  tela: producto.tela,
                  color: producto.color,
                  tipoPieza: producto.tipoPieza,
                  consumoTela: producto.consumoTela || 0
                })
                .returning();
            } else {
              throw err;
            }
          }

          // 2. Insertar las piezas asociadas a este producto
          if (producto.pieces && producto.pieces.length > 0) {
            try {
              await db.insert(repositionPieces)
                .values(producto.pieces.map((piece: any) => ({
                  repositionId: reposition.id,
                  repositionProductId: newProduct.id, // Vincular con el producto específico
                  talla: piece.talla,
                  cantidad: typeof piece.cantidad === 'string' ? parseInt(piece.cantidad, 10) : piece.cantidad,
                  unit: piece.unit || 'piezas',
                  folioOriginal: piece.folioOriginal
                })));
            } catch (err: any) {
              if (err.code === '23505' && err.constraint === 'reposition_pieces_pkey') {
                console.log('Error secuencia reposition_pieces. Corrigiendo...');
                await db.execute(sql`SELECT setval('reposition_pieces_id_seq', (SELECT MAX(id) FROM reposition_pieces))`);
                await db.insert(repositionPieces)
                  .values(producto.pieces.map((piece: any) => ({
                    repositionId: reposition.id,
                    repositionProductId: newProduct.id, // Vincular con el producto específico
                    talla: piece.talla,
                    cantidad: typeof piece.cantidad === 'string' ? parseInt(piece.cantidad, 10) : piece.cantidad,
                    unit: piece.unit || 'piezas',
                    folioOriginal: piece.folioOriginal
                  })));
              } else {
                throw err;
              }
            }
          }
        });

        await Promise.all(productPromises);
      } catch (error: any) {
        console.error('Error al guardar productos y piezas:', error);
        throw error;
      }
    } else if (pieces.length > 0) {
      // En caso de que no haya productos definidos (retrocompatibilidad o estructura antigua)
      try {
        await db.insert(repositionPieces)
          .values(pieces.map(piece => ({
            ...piece,
            repositionId: reposition.id,
            cantidad: typeof piece.cantidad === 'string' ? parseInt(piece.cantidad, 10) : piece.cantidad
          })));
      } catch (error: any) {
        if (error.code === '23505' && error.constraint === 'reposition_pieces_pkey') {
          console.log('Error secuencia reposition_pieces. Corrigiendo...');
          await db.execute(sql`SELECT setval('reposition_pieces_id_seq', (SELECT MAX(id) FROM reposition_pieces))`);
          await db.insert(repositionPieces)
            .values(pieces.map(piece => ({
              ...piece,
              repositionId: reposition.id,
              cantidad: typeof piece.cantidad === 'string' ? parseInt(piece.cantidad, 10) : piece.cantidad
            })));
        } else throw error;
      }
    }

    // Guardar telas de contraste si existen
    if (telaContraste && telaContraste.length > 0) {
      try {
        await db.insert(repositionContrastFabrics)
          .values(telaContraste.map((tela: any) => ({
            repositionId: reposition.id,
            ubicacion: tela.ubicacion,
            tela: tela.tela,
            color: tela.color,
            consumo: tela.consumo || 0
          })));
      } catch (error: any) {
        if (error.code === '23505' && error.constraint === 'reposition_contrast_fabrics_pkey') {
          console.log('Error secuencia reposition_contrast_fabrics. Corrigiendo...');
          await db.execute(sql`SELECT setval('reposition_contrast_fabrics_id_seq', (SELECT MAX(id) FROM reposition_contrast_fabrics))`);
          await db.insert(repositionContrastFabrics)
            .values(telaContraste.map((tela: any) => ({
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
      'created',
      `Reposición ${reposition.type} creada`,
      createdBy,
    );

    // Notificar a admin, operaciones y envíos sobre nueva reposición
    const adminUsers = await db.select().from(users)
      .where(eq(users.area, 'admin'));

    const operacionesUsers = await db.select().from(users)
      .where(eq(users.area, 'operaciones'));

    const enviosUsers = await db.select().from(users)
      .where(eq(users.area, 'envios'));

    const allTargetUsers = [...adminUsers, ...operacionesUsers, ...enviosUsers];

    for (const targetUser of allTargetUsers) {
      await this.createNotification({
        userId: targetUser.id,
        type: 'new_reposition',
        title: 'Nueva Solicitud de Reposición',
        message: `Se ha creado una nueva solicitud de ${data.type}: ${data.folio}`,
        repositionId: reposition.id,
      });
    }

    return reposition;
  }





  async fixAllSequences(): Promise<void> {
    const tables = [
      'users',
      'notifications',
      'repositions',
      'reposition_pieces',
      'reposition_products',
      'reposition_contrast_fabrics',
      'reposition_timers',
      'reposition_transfers',
      'reposition_history',
      'admin_passwords',
      'reposition_materials',
      'documents',
      'agenda_events'
    ];

    console.log('Starting global sequence repair...');

    for (const table of tables) {
      try {
        // Construct sequence name - assumes standard naming convention tablename_id_seq
        const seqName = `${table}_id_seq`;

        // Check if sequence exists and update it to max(id)
        // We use COALESCE(MAX(id), 0) + 1 to handle empty tables safely
        // The setval 3rd arg 'false' means nextval will return the value we set, 
        // essentially setting the *next* value to be used. 
        // But standard approach is usually setval(seq, max(id)).

        // Using a safe approach: setval to max(id)
        const query = sql`SELECT setval('${sql.raw(seqName)}', COALESCE((SELECT MAX(id) FROM ${sql.raw(table)}), 1))`;

        await db.execute(query);
        console.log(`Fixed sequence for table: ${table}`);
      } catch (error: any) {
        console.error(`Error fixing sequence for table ${table}:`, error);
        // Continue with other tables even if one fails
      }
    }

    // Fix Reposition Folio Counter (JN-REQ-MM-YY-XXX)
    try {
      const now = new Date();
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const year = String(now.getFullYear()).slice(-2);
      const monthYear = `${month}-${year}`;
      const pattern = `JN-REQ-${monthYear}-%`;

      console.log(`Verifying reposition sequence for ${monthYear}...`);

      // Extract the numeric part (last sequence of digits)
      const maxResult = await db.execute(sql`
        SELECT MAX(CAST(SUBSTRING(folio FROM '[0-9]+$') AS INTEGER)) as max_val 
        FROM repositions 
        WHERE folio LIKE ${pattern}
      `);

      if (maxResult.rows.length > 0) {
        const maxVal = maxResult.rows[0].max_val as number;
        // If we found a max value, ensure the counter matches it
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
    } catch (error: any) {
      console.error('Error fixing reposition sequence:', error);
    }

    console.log('Global sequence repair completed.');
    console.log('Global sequence repair completed.');
  }

  async getSequenceData(table: string): Promise<{ lastValue: number; nextValue: number; } | null> {
    try {
      if (table === 'repositions') {
        const now = new Date();
        const year = now.getFullYear();
        const month = now.getMonth() + 1;
        const monthYear = `${String(month).padStart(2, '0')}-${year.toString().slice(-2)}`;

        const result = await db.execute(sql`SELECT current_value FROM reposition_folio_counters WHERE month_year = ${monthYear}`);

        if (result.rows.length === 0) {
          return { lastValue: 0, nextValue: 1 };
        }

        const lastValue = result.rows[0].current_value as number;
        return { lastValue, nextValue: lastValue + 1 };
      }

      const seqName = `${table}_id_seq`;

      // Get last value (current sequence state)
      const result = await db.execute(sql`SELECT last_value, is_called FROM ${sql.raw(seqName)}`);

      if (result.rows.length === 0) return null;

      const lastValue = parseInt(result.rows[0].last_value as string);
      const isCalled = result.rows[0].is_called;

      // If is_called is false, next value is last_value
      // If is_called is true, next value is last_value + 1
      const nextValue = isCalled ? lastValue + 1 : lastValue;

      return { lastValue, nextValue };
    } catch (error: any) {
      console.error(`Error getting sequence data for table ${table}:`, error);
      return null;
    }
  }

  async setSequenceValue(table: string, value: number): Promise<void> {
    try {
      if (table === 'repositions') {
        const now = new Date();
        const year = now.getFullYear();
        const month = now.getMonth() + 1;
        const monthYear = `${String(month).padStart(2, '0')}-${year.toString().slice(-2)}`;

        // Ensure row exists
        await db.execute(sql`
          INSERT INTO reposition_folio_counters (month_year, current_value)
          VALUES (${monthYear}, 0)
          ON CONFLICT (month_year) DO NOTHING
        `);

        // Set value. Since getNext increments first, we set it to value - 1
        // If user wants next to be 7, we set current to 6.
        // getNextRepositionCounter: sets current = 6 + 1 = 7, returns 7. Correct.
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

      // Set the sequence value. 
      // We start with 'false' for is_called so the NEXT call to nextval() returns exactly this value.
      // This is what the user wants: "I want the next 007 to be 007" -> nextval() should return 7.
      await db.execute(sql`SELECT setval('${sql.raw(seqName)}', ${value}, false)`);

      console.log(`Sequence for ${table} set to ${value} (next value will be ${value})`);
    } catch (error: any) {
      console.error(`Error setting sequence value for table ${table}:`, error);
      throw error;
    }
  }

  async updateUser(userId: number, updateData: any): Promise<void> {
    try {
      // Verificar que el usuario existe
      const existingUser = await this.getUser(userId);
      if (!existingUser) {
        throw new Error('Usuario no encontrado');
      }

      // Preparar datos para actualización
      const updateFields: any = {
        name: updateData.name,
        username: updateData.username,
        area: updateData.area,
      };

      if (updateData.isActive !== undefined) {
        updateFields.isActive = updateData.isActive;
      }

      // Solo incluir password si se proporciona
      if (updateData.password) {
        updateFields.password = updateData.password;
      }

      await db.update(users)
        .set(updateFields)
        .where(eq(users.id, userId));

      console.log(`User ${userId} updated successfully`);
    } catch (error: any) {
      console.error('Error updating user:', error);
      throw error;
    }
  }

  async addRepositionHistory(
    repositionId: number,
    action: string,
    description: string,
    userId: number,
    fromArea?: Area,
    toArea?: Area
  ): Promise<void> {
    try {
      await db.insert(repositionHistory).values({
        repositionId,
        action,
        description,
        userId,
        fromArea,
        toArea,
        createdAt: new Date()
      });
    } catch (error: any) {
      // Si el error es por llave duplicada en ID (secuencia desincronizada)
      if (error.code === '23505' && error.constraint === 'reposition_history_pkey') {
        console.log('Detectado error de secuencia en ID de historial de reposiciones. Intentando corregir...');

        // Corregir la secuencia: setval al máximo ID actual
        await db.execute(sql`SELECT setval('reposition_history_id_seq', (SELECT MAX(id) FROM reposition_history))`);

        console.log('Secuencia de historial corregida. Reintentando inserción...');

        // Reintentar la inserción
        await db.insert(repositionHistory).values({
          repositionId,
          action,
          description,
          userId,
          fromArea,
          toArea,
          createdAt: new Date()
        });
      } else {
        throw error;
      }
    }
  }


  // Métricas
  async getMonthlyMetrics(month: number, year: number): Promise<any> {
    console.log(`Getting monthly metrics for ${month}/${year}`);

    // Ajustar la fecha para considerar la zona horaria de México
    const startDate = new Date(year, month, 1);
    startDate.setHours(6, 0, 0, 0); // UTC+6 para México

    const endDate = new Date(year, month + 1, 0);
    endDate.setHours(29, 59, 59, 999); // Fin del día en UTC

    console.log('Date range:', startDate.toISOString(), 'to', endDate.toISOString());

    try {
      // Reposiciones del mes por área y tipo
      const repositionsQuery = await db.select({
        area: repositions.solicitanteArea,
        type: repositions.type,
        count: sql<number>`COUNT(*)::int`
      })
        .from(repositions)
        .where(and(
          gte(repositions.createdAt, startDate),
          lte(repositions.createdAt, endDate),
          ne(repositions.status, 'eliminado' as RepositionStatus)
        ))
        .groupBy(repositions.solicitanteArea, repositions.type);

      console.log('Repositions query result:', repositionsQuery);

      const totalRepositions = repositionsQuery.reduce((sum, item) => sum + item.count, 0);
      console.log('Total repositions:', totalRepositions);

      // Si no hay reposiciones, retornar datos vacíos
      if (totalRepositions === 0) {
        return {
          byArea: [],
          byAreaAndType: [],
          byCause: [],
          total: 0
        };
      }

      // Agrupar por área sumando todos los tipos
      const areaMap = new Map<string, { count: number, reposiciones: number, reprocesos: number }>();

      repositionsQuery.forEach(item => {
        const area = item.area || 'Sin área';
        if (!areaMap.has(area)) {
          areaMap.set(area, { count: 0, reposiciones: 0, reprocesos: 0 });
        }
        const areaData = areaMap.get(area)!;
        areaData.count += item.count;

        if ((item.type as string) === 'repocision' || item.type === 'reposición') {
          areaData.reposiciones += item.count;
        } else if (item.type === 'reproceso') {
          areaData.reprocesos += item.count;
        }
      });

      // Calcular piezas por área usando un join directo sin contar repositions.id en el SELECT
      const byArea = await Promise.all(Array.from(areaMap.entries()).map(async ([area, data]) => {
        try {
          // Contar piezas directamente sin referencias a repositions.id en el SELECT
          const areaPiecesQuery = await db.select({
            totalPieces: sql<number>`COUNT(${repositionPieces.id})::int`
          })
            .from(repositionPieces)
            .innerJoin(repositions, eq(repositionPieces.repositionId, repositions.id))
            .where(and(
              eq(repositions.solicitanteArea, area as Area),
              gte(repositions.createdAt, startDate),
              lte(repositions.createdAt, endDate),
              ne(repositions.status, 'eliminado')
            ));

          const pieces = areaPiecesQuery[0]?.totalPieces || 0;
          const percentage = totalRepositions > 0 ? Math.round((data.count / totalRepositions) * 100) : 0;

          return {
            area,
            count: data.count,
            reposiciones: data.reposiciones,
            reprocesos: data.reprocesos,
            pieces,
            percentage
          };
        } catch (error: any) {
          console.error(`Error calculating pieces for area ${area}:`, error); return {
            area,
            count: data.count,
            reposiciones: data.reposiciones,
            reprocesos: data.reprocesos,
            pieces: 0,
            percentage: totalRepositions > 0 ? Math.round((data.count / totalRepositions) * 100) : 0
          };
        }
      }));

      // Datos detallados por área y tipo para gráficos específicos
      const byAreaAndType = repositionsQuery.map(item => ({
        area: item.area || 'Sin área',
        type: item.type,
        count: item.count,
        percentage: totalRepositions > 0 ? Math.round((item.count / totalRepositions) * 100) : 0
      }));

      // Causas de daño del mes
      const causesQuery = await db.select({
        cause: repositions.tipoAccidente,
        count: sql<number>`COUNT(*)::int`
      })
        .from(repositions)
        .where(and(
          gte(repositions.createdAt, startDate),
          lte(repositions.createdAt, endDate),
          ne(repositions.status, 'eliminado' as RepositionStatus),
          isNotNull(repositions.tipoAccidente)
        ))
        .groupBy(repositions.tipoAccidente);

      const totalCauses = causesQuery.reduce((sum, item) => sum + item.count, 0);
      const byCause = causesQuery.map(item => ({
        cause: item.cause || 'Sin especificar',
        count: item.count,
        percentage: totalCauses > 0 ? Math.round((item.count / totalCauses) * 100) : 0
      }));

      // Agrupar por área causante del daño
      const byCausativeAreaQuery = await db.select({
        area: repositions.areaCausanteDano,
        type: repositions.type,
        count: sql<number>`COUNT(*)::int`
      })
        .from(repositions)
        .where(and(
          gte(repositions.createdAt, startDate),
          lte(repositions.createdAt, endDate),
          ne(repositions.status, 'eliminado' as RepositionStatus),
          isNotNull(repositions.areaCausanteDano)
        ))
        .groupBy(repositions.areaCausanteDano, repositions.type);

      const causativeAreaMap = new Map<string, { count: number, reposiciones: number, reprocesos: number }>();

      byCausativeAreaQuery.forEach(item => {
        const area = item.area || 'Sin área';
        if (!causativeAreaMap.has(area)) {
          causativeAreaMap.set(area, { count: 0, reposiciones: 0, reprocesos: 0 });
        }
        const areaData = causativeAreaMap.get(area)!;
        areaData.count += item.count;

        if ((item.type as string) === 'repocision' || item.type === 'reposición') {
          areaData.reposiciones += item.count;
        } else if (item.type === 'reproceso') {
          areaData.reprocesos += item.count;
        }
      });

      const totalCausativeArea = Array.from(causativeAreaMap.values()).reduce((sum, data) => sum + data.count, 0);

      const byCausativeArea = Array.from(causativeAreaMap.entries()).map(([area, data]) => {
        const percentage = totalCausativeArea > 0 ? Math.round((data.count / totalCausativeArea) * 100) : 0;
        return {
          area,
          count: data.count,
          reposiciones: data.reposiciones,
          reprocesos: data.reprocesos,
          percentage
        };
      });

      // Metricas agregadas para el mes
      const totalReposicionesCount = repositionsQuery
        .filter(item => (item.type as string) === 'repocision' || item.type === 'reposición')
        .reduce((sum, item) => sum + item.count, 0);

      const totalReprocesos = repositionsQuery
        .filter(item => item.type === 'reproceso')
        .reduce((sum, item) => sum + item.count, 0);

      const totalPieces = byArea.reduce((sum, item) => sum + item.pieces, 0);

      let mostActiveArea = 'N/A';
      if (byArea.length > 0) {
        const sortedAreas = [...byArea].sort((a, b) => b.count - a.count);
        mostActiveArea = sortedAreas[0].area;
      }

      console.log('Final metrics result:', {
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
    } catch (error: any) {
      console.error('Get monthly metrics error:', error);
      throw new Error('Error al obtener métricas mensuales: ' + error.message);
    }
  }

  async getOverallMetrics(): Promise<any> {
    console.log('Getting overall metrics...');

    // Total de reposiciones
    const totalRepositionsQuery = await db.select({ count: sql<number>`COUNT(*)::int` })
      .from(repositions)
      .where(ne(repositions.status, 'eliminado' as RepositionStatus));

    const totalRepositions = totalRepositionsQuery[0]?.count || 0;
    console.log('Total repositions:', totalRepositions);

    // Total de piezas
    const totalPiecesQuery = await db.select({ count: sql<number>`COUNT(*)::int` })
      .from(repositionPieces)
      .innerJoin(repositions, eq(repositionPieces.repositionId, repositions.id))
      .where(ne(repositions.status, 'eliminado' as RepositionStatus));

    const totalPieces = totalPiecesQuery[0]?.count || 0;
    console.log('Total pieces:', totalPieces);

    // Área más activa
    let mostActiveArea = 'N/A';
    if (totalRepositions > 0) {
      const mostActiveAreaQuery = await db.select({
        area: repositions.solicitanteArea,
        count: sql<number>`COUNT(*)::int`
      })
        .from(repositions)
        .where(and(
          ne(repositions.status, 'eliminado' as RepositionStatus),
          isNotNull(repositions.solicitanteArea)
        ))
        .groupBy(repositions.solicitanteArea)
        .orderBy(desc(sql<number>`COUNT(*)::int`))
        .limit(1);

      mostActiveArea = mostActiveAreaQuery[0]?.area || 'N/A';
    }
    console.log('Most active area:', mostActiveArea);

    // Promedio mensual (últimos 12 meses)
    const twelveMonthsAgo = new Date();
    twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);

    const monthlyAvgQuery = await db.select({ count: sql<number>`COUNT(*)::int` })
      .from(repositions)
      .where(and(
        gte(repositions.createdAt, twelveMonthsAgo),
        ne(repositions.status, 'eliminado' as RepositionStatus)
      ));

    const monthlyAverage = Math.round((monthlyAvgQuery[0]?.count || 0) / 12);
    console.log('Monthly average:', monthlyAverage);

    const result = {
      totalRepositions,
      totalPieces,
      mostActiveArea,
      monthlyAverage
    };

    console.log('Overall metrics result:', result);
    return result;
  }

  async getRequestAnalysis(): Promise<any> {
    console.log('Getting request analysis...');

    // Obtener todas las reposiciones agrupadas por número de solicitud
    const requestsQuery = await db.select({
      noSolicitud: repositions.noSolicitud,
      type: repositions.type,
      count: sql<number>`COUNT(*)::int`
    })
      .from(repositions)
      .where(and(
        ne(repositions.status, 'eliminado' as RepositionStatus),
        isNotNull(repositions.noSolicitud)
      ))
      .groupBy(repositions.noSolicitud, repositions.type);

    console.log('Requests query result:', requestsQuery);

    // Procesar los datos para obtener reposiciones y reprocesos por solicitud
    const requestsMap = new Map();

    requestsQuery.forEach(item => {
      const key = item.noSolicitud;
      if (!requestsMap.has(key)) {
        requestsMap.set(key, { reposiciones: 0, reprocesos: 0 });
      }

      const data = requestsMap.get(key);
      if ((item.type as string) === 'repocision' || item.type === 'reposición') {
        data.reposiciones += item.count;
      } else if (item.type === 'reproceso') {
        data.reprocesos += item.count;
      }
    });

    console.log('Requests map:', requestsMap);

    // Convertir a array y calcular totales
    const topRequests = Array.from(requestsMap.entries())
      .map(([noSolicitud, data]: [string, any]) => ({
        noSolicitud,
        reposiciones: data.reposiciones,
        reprocesos: data.reprocesos,
        total: data.reposiciones + data.reprocesos
      }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 10);

    const totalRequestsWithRepositions = requestsMap.size;
    const allRepositionsCount = requestsQuery.reduce((sum, item) => sum + item.count, 0);
    const averageRepositionsPerRequest = totalRequestsWithRepositions > 0
      ? Math.round(allRepositionsCount / totalRequestsWithRepositions * 100) / 100
      : 0;

    const mostProblematicRequest = topRequests[0]?.noSolicitud || 'N/A';

    const result = {
      totalRequestsWithRepositions,
      averageRepositionsPerRequest,
      mostProblematicRequest,
      topRequests
    };

    console.log('Request analysis result:', result);
    return result;
  }

  async exportMonthlyMetrics(month: number, year: number): Promise<Buffer> {
    const workbook = new ExcelJS.Workbook();
    const metrics = await this.getMonthlyMetrics(month, year);

    // Hoja 1: Reposiciones por área solicitante
    const worksheet1 = workbook.addWorksheet('Por Área Solicitante');
    worksheet1.columns = [
      { header: 'Área', key: 'area', width: 15 },
      { header: 'Total', key: 'count', width: 15 },
      { header: 'Reposiciones', key: 'reposiciones', width: 15 },
      { header: 'Reprocesos', key: 'reprocesos', width: 15 },
      { header: 'Piezas', key: 'pieces', width: 15 },
      { header: 'Porcentaje del Total', key: 'percentage', width: 18 }
    ];

    metrics.byArea.forEach((item: any) => {
      worksheet1.addRow({
        area: item.area,
        count: item.count,
        reposiciones: item.reposiciones || 0,
        reprocesos: item.reprocesos || 0,
        pieces: item.pieces,
        percentage: `${item.percentage}%`
      });
    });

    // Hoja 2: Causas de daño
    const worksheet2 = workbook.addWorksheet('Causas de Daño');
    worksheet2.columns = [
      { header: 'Causa', key: 'cause', width: 30 },
      { header: 'Cantidad', key: 'count', width: 15 },
      { header: 'Porcentaje', key: 'percentage', width: 15 }
    ];

    metrics.byCause.forEach((item: any) => {
      worksheet2.addRow(item);
    });

    // Hoja 3: Reposiciones por área causante del daño
    const worksheet3 = workbook.addWorksheet('Por Área Causante');
    worksheet3.columns = [
      { header: 'Área Causante', key: 'area', width: 20 },
      { header: 'Total', key: 'count', width: 15 },
      { header: 'Reposiciones', key: 'reposiciones', width: 15 },
      { header: 'Reprocesos', key: 'reprocesos', width: 15 },
      { header: 'Porcentaje del Total', key: 'percentage', width: 18 }
    ];

    if (metrics.byCausativeArea) {
      metrics.byCausativeArea.forEach((item: any) => {
        worksheet3.addRow({
          area: item.area,
          count: item.count,
          reposiciones: item.reposiciones || 0,
          reprocesos: item.reprocesos || 0,
          percentage: `${item.percentage}%`
        });
      });
    }

    // Estilo para headers
    [worksheet1, worksheet2, worksheet3].forEach(ws => {
      ws.getRow(1).font = { bold: true };
      ws.getRow(1).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFE6E6E6' }
      };
    });

    const buffer = await workbook.xlsx.writeBuffer();
    return Buffer.from(buffer);
  }

  async exportCausativeAreaMetrics(month: number, year: number): Promise<Buffer> {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Por Área Causante');
    const metrics = await this.getMonthlyMetrics(month, year);

    // Headers
    worksheet.columns = [
      { header: 'Área Causante', key: 'area', width: 25 },
      { header: 'Total', key: 'count', width: 15 },
      { header: 'Reposiciones', key: 'reposiciones', width: 15 },
      { header: 'Reprocesos', key: 'reprocesos', width: 15 },
      { header: 'Porcentaje', key: 'percentage', width: 18 }
    ];

    if (metrics.byCausativeArea) {
      metrics.byCausativeArea.forEach((item: any) => {
        worksheet.addRow({
          area: item.area,
          count: item.count,
          reposiciones: item.reposiciones || 0,
          reprocesos: item.reprocesos || 0,
          percentage: `${item.percentage}%`
        });
      });
    }

    // Style headers
    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE6E6E6' }
    };

    // Add borders
    worksheet.eachRow((row, rowNumber) => {
      row.eachCell((cell) => {
        cell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' }
        };
      });
    });

    const buffer = await workbook.xlsx.writeBuffer();
    return Buffer.from(buffer);
  }

  async exportOverallMetrics(): Promise<Buffer> {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Métricas Generales');
    const metrics = await this.getOverallMetrics();

    worksheet.columns = [
      { header: 'Métrica', key: 'metric', width: 25 },
      { header: 'Valor', key: 'value', width: 15 }
    ];

    worksheet.addRow({ metric: 'Total Reposiciones', value: metrics.totalRepositions });
    worksheet.addRow({ metric: 'Total Piezas', value: metrics.totalPieces });
    worksheet.addRow({ metric: 'Área Más Activa', value: metrics.mostActiveArea });
    worksheet.addRow({ metric: 'Promedio Mensual', value: metrics.monthlyAverage });

    // Style headers
    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE6E6E6' }
    };

    const buffer = await workbook.xlsx.writeBuffer();
    return Buffer.from(buffer);
  }

  async exportRequestAnalysis(): Promise<Buffer> {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Análisis de Solicitudes');

    // Headers
    worksheet.columns = [
      { header: 'No. Solicitud', key: 'noSolicitud', width: 15 },
      { header: 'Total Reposiciones', key: 'total', width: 18 },
      { header: 'Reposiciones', key: 'reposiciones', width: 15 },
      { header: 'Reprocesos', key: 'reprocesos', width: 15 },
    ];

    const analysis = await this.getRequestAnalysis();
    analysis.topRequests.forEach((request: any) => {
      worksheet.addRow(request);
    });

    // Style headers
    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE6E6E6' }
    };

    // Aplicar bordes a todas las celdas
    worksheet.eachRow((row, rowNumber) => {
      row.eachCell((cell) => {
        cell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' }
        };
      });
    });

    const buffer = await workbook.xlsx.writeBuffer();
    return Buffer.from(buffer);
  }

  async clearEntireDatabase(deleteUsers: boolean = false): Promise<void> {
    console.log('Starting complete database clear...');

    try {
      // Eliminar en orden específico debido a las dependencias de claves foráneas
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

      // Solo eliminar usuarios si está marcada la opción
      if (deleteUsers) {
        console.log('Deleting users (except admin)...');
        await db.delete(users).where(ne(users.area, 'admin'));
      }

      console.log('Database cleared successfully');
    } catch (error: any) {
      console.error('Error clearing database:', error);
      throw new Error('Error al limpiar la base de datos: ' + error.message);
    }
  }

  async backupUsers(): Promise<any> {
    try {
      const allUsers = await db.select().from(users).orderBy(asc(users.id));

      const backup = {
        version: "1.0",
        timestamp: new Date().toISOString(),
        users: allUsers.map(user => ({
          id: user.id,
          username: user.username,
          name: user.name,
          area: user.area,
          password: user.password, // Incluir password hasheado para restauración completa
          createdAt: user.createdAt
        }))
      };

      console.log(`Backup created with ${backup.users.length} users`);
      return backup;
    } catch (error: any) {
      console.error('Error creating backup:', error);
      throw new Error('Error al crear respaldo de usuarios: ' + error.message);
    }
  }

  async restoreUsers(backupData: any): Promise<any> {
    try {
      if (!backupData.users || !Array.isArray(backupData.users)) {
        throw new Error('Formato de respaldo inválido');
      }

      let created = 0;
      let updated = 0;
      let errors = 0;

      for (const userData of backupData.users) {
        try {
          // Verificar si el usuario ya existe
          const existingUser = await this.getUserByUsername(userData.username);

          if (existingUser) {
            // Actualizar usuario existente
            await db.update(users)
              .set({
                name: userData.name,
                area: userData.area,
                password: userData.password
              })
              .where(eq(users.id, existingUser.id));
            updated++;
          } else {
            // Crear nuevo usuario
            await db.insert(users).values({
              username: userData.username,
              name: userData.name,
              area: userData.area,
              password: userData.password,
              createdAt: userData.createdAt ? new Date(userData.createdAt) : new Date()
            });
            created++;
          }


        } catch (userError) {
          console.error(`Error processing user ${userData.username}:`, userError);
          errors++;
        }
      }

      const result = {
        message: `Restauración completada: ${created} usuarios creados, ${updated} usuarios actualizados`,
        created,
        updated,
        errors
      };

      console.log('Restore completed:', result);
      return result;
    } catch (error: any) {
      console.error('Error restoring users:', error);
      throw new Error('Error al restaurar usuarios: ' + error.message);
    }
  }
  async resetUserSequence(): Promise<void> {
    try {
      await db.execute(sql`ALTER SEQUENCE users_id_seq RESTART WITH 1;`);
      console.log('User ID sequence reset successfully');
    } catch (error: any) {
      console.error('Error resetting user ID sequence:', error);
      throw new Error('Error al reiniciar la secuencia de ID de usuario: ' + error.message);
    }
  }

  async updateReposition(
    repositionId: number,
    updateData: any,
    pieces: any[],
    userId: number
  ): Promise<any> {
    console.log('Updating reposition:', { repositionId, updateData, pieces: pieces.length });

    // Get existing reposition to preserve certain fields
    const existingReposition = await db.select().from(repositions)
      .where(eq(repositions.id, repositionId))
      .limit(1);

    if (existingReposition.length === 0) {
      throw new Error('Reposición no encontrada');
    }

    const existing = existingReposition[0];

    // Preserve critical fields that should not change during edit
    const preservedFields = {
      folio: existing.folio,
      solicitanteNombre: existing.solicitanteNombre,
      solicitanteArea: existing.solicitanteArea, // PRESERVE ORIGINAL CREATOR AREA
      fechaSolicitud: existing.fechaSolicitud,
      createdBy: existing.createdBy,
      createdAt: existing.createdAt,
    };

    // Remove fields that should be preserved from updateData
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

    // Update main reposition data
    const [updatedReposition] = await db.update(repositions)
      .set({
        ...safeUpdateData,
        ...preservedFields, // Apply preserved fields
        status: 'pendiente' as RepositionStatus, // Reset to pending when edited
      })
      .where(eq(repositions.id, repositionId))
      .returning();

    console.log('Main reposition data updated');

    // Delete existing pieces and products
    await db.delete(repositionPieces)
      .where(eq(repositionPieces.repositionId, repositionId));

    await db.delete(repositionProducts)
      .where(eq(repositionProducts.repositionId, repositionId));

    // Delete existing contrast fabrics
    await db.delete(repositionContrastFabrics)
      .where(eq(repositionContrastFabrics.repositionId, repositionId));

    console.log('Existing pieces, products, and contrast fabrics deleted');

    // Insert new products if they exist
    if (productos && productos.length > 0) {
      const productValues = productos.map((producto: any) => ({
        repositionId,
        modeloPrenda: producto.modeloPrenda,
        tela: producto.tela,
        color: producto.color,
        tipoPieza: producto.tipoPieza,
        consumoTela: producto.consumoTela || 0,
      }));

      await db.insert(repositionProducts).values(productValues);
      console.log('New products inserted:', productValues.length);
    }

    // Insert new pieces
    if (pieces && pieces.length > 0) {
      const pieceValues = pieces.map((piece: any) => ({
        repositionId,
        talla: piece.talla,
        cantidad: typeof piece.cantidad === 'string' ? parseInt(piece.cantidad, 10) : piece.cantidad,
        unit: piece.unit || 'piezas',
        folioOriginal: piece.folioOriginal || null,
      }));

      await db.insert(repositionPieces).values(pieceValues);
      console.log('New pieces inserted:', pieceValues.length);
    }

    // Insert new contrast fabrics if they exist
    if (telaContraste && telaContraste.length > 0) {
      const fabricValues = telaContraste.map((tela: any) => ({
        repositionId,
        ubicacion: tela.ubicacion,
        tela: tela.tela,
        color: tela.color,
        consumo: tela.consumo || 0,
      }));

      await db.insert(repositionContrastFabrics).values(fabricValues);
      console.log('New contrast fabrics inserted:', fabricValues.length);
    }

    // Add history entry
    await this.addRepositionHistory(
      repositionId,
      'updated',
      'Reposición editada y reenviada para aprobación',
      userId
    );

    // Get the updated reposition
    const reposition = await this.getRepositionById(repositionId);
    console.log('Updated reposition retrieved:', reposition?.folio);

    // Notify approval users (admin, envios, operaciones)
    const approvalUsers = await db.select().from(users)
      .where(or(
        eq(users.area, 'admin'),
        eq(users.area, 'envios'),
        eq(users.area, 'operaciones')
      ));

    for (const user of approvalUsers) {
      await this.createNotification({
        userId: user.id,
        type: 'new_reposition',
        title: 'Reposición Reenviada',
        message: `La reposición ${reposition?.folio} ha sido editada y reenviada para aprobación`,
        repositionId: repositionId,
      });
    }

    console.log('Update reposition completed successfully');
    return updatedReposition;
  }



  async getRepositionProducts(repositionId: number): Promise<any[]> {
    return await db.select().from(repositionProducts)
      .where(eq(repositionProducts.repositionId, repositionId));
  }

  async backupCompleteSystem(): Promise<any> {
    try {
      console.log('Starting complete system backup...');

      // Fetch all tables without error catching to see real errors
      console.log('Fetching users...');
      const allUsers = await db.select().from(users).orderBy(asc(users.id));
      console.log(`Found ${allUsers.length} users`);

      console.log('Fetching notifications...');
      const allNotifications = await db.select().from(notifications).orderBy(asc(notifications.id));
      console.log(`Found ${allNotifications.length} notifications`);

      console.log('Fetching repositions...');
      const allRepositions = await db.select().from(repositions).orderBy(asc(repositions.id));
      console.log(`Found ${allRepositions.length} repositions (including all statuses)`);
      console.log('Sample repositions:', allRepositions.slice(0, 3).map(r => ({ id: r.id, folio: r.folio, status: r.status })));

      console.log('Fetching reposition pieces...');
      const allRepositionPieces = await db.select().from(repositionPieces).orderBy(asc(repositionPieces.id));
      console.log(`Found ${allRepositionPieces.length} reposition pieces`);

      console.log('Fetching reposition products...');
      const allRepositionProducts = await db.select().from(repositionProducts).orderBy(asc(repositionProducts.id));
      console.log(`Found ${allRepositionProducts.length} reposition products`);

      console.log('Fetching reposition timers...');
      const allRepositionTimers = await db.select().from(repositionTimers).orderBy(asc(repositionTimers.id));
      console.log(`Found ${allRepositionTimers.length} reposition timers`);

      console.log('Fetching reposition transfers...');
      const allRepositionTransfers = await db.select().from(repositionTransfers).orderBy(asc(repositionTransfers.id));
      console.log(`Found ${allRepositionTransfers.length} reposition transfers`);

      console.log('Fetching reposition history...');
      const allRepositionHistory = await db.select().from(repositionHistory).orderBy(asc(repositionHistory.id));
      console.log(`Found ${allRepositionHistory.length} reposition history entries`);

      console.log('Fetching reposition materials...');
      const allRepositionMaterials = await db.select().from(repositionMaterials).orderBy(asc(repositionMaterials.id));
      console.log(`Found ${allRepositionMaterials.length} reposition materials`);

      console.log('Fetching admin passwords...');
      const allAdminPasswords = await db.select().from(adminPasswords).orderBy(asc(adminPasswords.id));
      console.log(`Found ${allAdminPasswords.length} admin passwords`);

      console.log('Fetching agenda events...');
      const allAgendaEvents = await db.select().from(agendaEvents).orderBy(asc(agendaEvents.id));
      console.log(`Found ${allAgendaEvents.length} agenda events`);

      console.log('Fetching reposition contrast fabrics...');
      const allRepositionContrastFabrics = await db.select().from(repositionContrastFabrics).orderBy(asc(repositionContrastFabrics.id));
      console.log(`Found ${allRepositionContrastFabrics.length} reposition contrast fabrics`);

      console.log('Fetching documents...');
      const allDocuments = await db.select().from(documents).orderBy(asc(documents.id));
      console.log(`Found ${allDocuments.length} documents`);


      // Crear el objeto de respaldo solo con tablas de reposiciones y usuarios
      const backup = {
        version: "1.0",
        timestamp: new Date().toISOString(),
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

      console.log('Complete system backup created successfully');
      console.log('Backup stats:', backup.stats);

      // Log de verificación detallado del contenido
      console.log('=== BACKUP VERIFICATION ===');
      console.log('Tables in backup:', Object.keys(backup.tables));
      console.log('Repositions in backup:', backup.tables.repositions.length);
      if (backup.tables.repositions.length > 0) {
        console.log('Sample repositions:', backup.tables.repositions.slice(0, 3).map(r => ({
          id: r.id,
          folio: r.folio,
          status: r.status
        })));
      }
      console.log('RepositionPieces in backup:', backup.tables.repositionPieces.length);
      console.log('RepositionHistory in backup:', backup.tables.repositionHistory.length);
      console.log('RepositionTransfers in backup:', backup.tables.repositionTransfers.length);
      console.log('RepositionProducts in backup:', backup.tables.repositionProducts.length);
      console.log('RepositionTimers in backup:', backup.tables.repositionTimers.length);
      console.log('RepositionMaterials in backup:', backup.tables.repositionMaterials.length);
      console.log('=== END VERIFICATION ===');

      return backup;
    } catch (error: any) {
      console.error('Backup complete system error:', error);
      throw new Error('Error al crear respaldo completo del sistema: ' + error.message);
    }
  }

  async restoreCompleteSystem(backupData: any): Promise<any> {
    try {
      if (!backupData || typeof backupData !== 'object') {
        throw new Error('Formato de respaldo inválido - no es un objeto válido');
      }

      console.log('Backup data keys:', Object.keys(backupData));

      // Detectar el tipo de respaldo
      const isUserBackup = backupData.users && Array.isArray(backupData.users) && !backupData.tables;
      const isSystemBackup = backupData.tables && typeof backupData.tables === 'object';

      if (!isUserBackup && !isSystemBackup) {
        throw new Error(`Formato de respaldo inválido - debe ser un respaldo de usuarios o del sistema completo. Propiedades encontradas: ${Object.keys(backupData).join(', ')}`);
      }

      // Si es un respaldo de usuarios, convertirlo al formato de sistema
      if (isUserBackup) {
        console.log('Detectado respaldo de usuarios, convirtiendo a formato de sistema...');
        const originalUsers = backupData.users;
        backupData = {
          version: backupData.version || "1.0",
          timestamp: backupData.timestamp || new Date().toISOString(),
          system: "JASANA",
          tables: {
            users: originalUsers
          }
        };
        console.log('Respaldo convertido exitosamente con', originalUsers.length, 'usuarios');
      }

      // Validar que las propiedades que existen sean arrays
      if (backupData.tables) {
        const mainProperties = ['users', 'repositions', 'notifications'];
        for (const prop of mainProperties) {
          if (backupData.tables.hasOwnProperty(prop) && !Array.isArray(backupData.tables[prop])) {
            throw new Error(`Formato de respaldo inválido - tables.${prop} debe ser un array`);
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

      // Restaurar en orden dependiente de las relaciones

      // 1. Usuarios primero (sin dependencias)
      if (backupData.tables.users && Array.isArray(backupData.tables.users)) {
        console.log(`Restaurando ${backupData.tables.users.length} usuarios...`);
        for (const userData of backupData.tables.users) {
          try {
            const existingUser = await this.getUserByUsername(userData.username);
            if (!existingUser) {
              await db.insert(users).values({
                ...userData,
                createdAt: userData.createdAt ? new Date(userData.createdAt) : new Date()
              });
              restored.users++;
              console.log(`Usuario ${userData.username} restaurado exitosamente`);
            } else {
              console.log(`Usuario ${userData.username} ya existe, omitiendo`);
            }
          } catch (error: any) {
            console.error(`Error restoring user ${userData.username}:`, error);
            restored.errors++;
          }
        }
        console.log(`Usuarios procesados: ${restored.users} creados`);
      }

      // 2. Reposiciones
      if (backupData.tables.repositions && Array.isArray(backupData.tables.repositions)) {
        console.log(`Restaurando ${backupData.tables.repositions.length} reposiciones...`);

        // Log sample of repositions being restored
        if (backupData.tables.repositions.length > 0) {
          console.log('Sample repositions to restore:', backupData.tables.repositions.slice(0, 3).map((r: any) => ({
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
                fechaSolicitud: repositionData.fechaSolicitud ? new Date(repositionData.fechaSolicitud) : new Date(),
                createdAt: repositionData.createdAt ? new Date(repositionData.createdAt) : new Date(),
                completedAt: repositionData.completedAt ? new Date(repositionData.completedAt) : null,
                approvedAt: repositionData.approvedAt ? new Date(repositionData.approvedAt) : null
              };

              // Log what we're inserting
              console.log(`Inserting reposition ${repositionData.folio} with status: ${repositionData.status}`);

              await db.insert(repositions).values(insertData);
              restored.repositions++;
            } else {
              console.log(`Reposición ${repositionData.folio} ya existe, omitiendo`);
            }
          } catch (error: any) {
            console.error(`Error restoring reposition ${repositionData.folio}:`, error);
            restored.errors++;
          }
        }
        console.log(`Reposiciones procesadas: ${restored.repositions} creadas`);

        // Verify repositions were inserted
        const totalAfterRestore = await db.select({ count: sql<number>`COUNT(*)::int` }).from(repositions);
        console.log(`Total repositions in database after restore: ${totalAfterRestore[0]?.count || 0}`);
      }

      // 3. Piezas de reposiciones
      if (backupData.tables.repositionPieces && Array.isArray(backupData.tables.repositionPieces)) {
        console.log(`Restaurando ${backupData.tables.repositionPieces.length} piezas de reposiciones...`);
        for (const pieceData of backupData.tables.repositionPieces) {
          try {
            await db.insert(repositionPieces).values({
              ...pieceData,
              createdAt: pieceData.createdAt ? new Date(pieceData.createdAt) : new Date()
            }).onConflictDoNothing();
            restored.repositionPieces++;
          } catch (error: any) {
            console.error(`Error restoring reposition piece:`, error);
            restored.errors++;
          }
        }
        console.log(`Piezas de reposiciones procesadas: ${restored.repositionPieces} restauradas`);
      }

      // 4. Productos de reposiciones
      if (backupData.tables.repositionProducts && Array.isArray(backupData.tables.repositionProducts)) {
        console.log(`Restaurando ${backupData.tables.repositionProducts.length} productos de reposiciones...`);
        for (const productData of backupData.tables.repositionProducts) {
          try {
            await db.insert(repositionProducts).values({
              ...productData,
              createdAt: productData.createdAt ? new Date(productData.createdAt) : new Date()
            }).onConflictDoNothing();
            restored.repositionProducts++;
          } catch (error: any) {
            console.error(`Error restoring reposition product:`, error);
            restored.errors++;
          }
        }
        console.log(`Productos de reposiciones procesadas: ${restored.repositionProducts} restaurados`);
      }

      // 5. Transferencias de reposiciones
      if (backupData.tables.repositionTransfers && Array.isArray(backupData.tables.repositionTransfers)) {
        console.log(`Restaurando ${backupData.tables.repositionTransfers.length} transferencias de reposiciones...`);
        for (const transferData of backupData.tables.repositionTransfers) {
          try {
            await db.insert(repositionTransfers).values({
              ...transferData,
              createdAt: transferData.createdAt ? new Date(transferData.createdAt) : new Date(),
              processedAt: transferData.processedAt ? new Date(transferData.processedAt) : null
            }).onConflictDoNothing();
            restored.repositionTransfers++;
          } catch (error: any) {
            console.error(`Error restoring reposition transfer:`, error);
            restored.errors++;
          }
        }
        console.log(`Transferencias de reposiciones procesadas: ${restored.repositionTransfers} restauradas`);
      }

      // 6. Historial de reposiciones
      if (backupData.tables.repositionHistory && Array.isArray(backupData.tables.repositionHistory)) {
        console.log(`Restaurando ${backupData.tables.repositionHistory.length} entradas de historial de reposiciones...`);
        for (const historyData of backupData.tables.repositionHistory) {
          try {
            await db.insert(repositionHistory).values({
              ...historyData,
              createdAt: historyData.createdAt ? new Date(historyData.createdAt) : new Date()
            }).onConflictDoNothing();
            restored.repositionHistory++;
          } catch (error: any) {
            console.error(`Error restoring reposition history:`, error);
            restored.errors++;
          }
        }
        console.log(`Historial de reposiciones procesado: ${restored.repositionHistory} entradas restauradas`);
      }

      // 7. Notificaciones
      if (backupData.tables.notifications) {
        for (const notificationData of backupData.tables.notifications) {
          try {
            await db.insert(notifications).values({
              ...notificationData,
              createdAt: notificationData.createdAt ? new Date(notificationData.createdAt) : new Date()
            }).onConflictDoNothing();
            restored.notifications++;
          } catch (error: any) {
            console.error(`Error restoring notification:`, error);
            restored.errors++;
          }
        }
      }

      // 8. Documentos
      if (backupData.tables.documents) {
        for (const documentData of backupData.tables.documents) {
          try {
            await db.insert(documents).values({
              ...documentData,
              createdAt: documentData.createdAt ? new Date(documentData.createdAt) : new Date()
            }).onConflictDoNothing();
            restored.documents++;
          } catch (error: any) {
            console.error(`Error restoring document:`, error);
            restored.errors++;
          }
        }
      }

      // 9. Eventos de agenda
      if (backupData.tables.agendaEvents) {
        for (const eventData of backupData.tables.agendaEvents) {
          try {
            await db.insert(agendaEvents).values({
              ...eventData,
              createdAt: eventData.createdAt ? new Date(eventData.createdAt) : new Date(),
              updatedAt: eventData.updatedAt ? new Date(eventData.updatedAt) : new Date()
            }).onConflictDoNothing();
            restored.agendaEvents++;
          } catch (error: any) {
            console.error(`Error restoring agenda event:`, error);
            restored.errors++;
          }
        }
      }

      // 10. Timers de reposiciones
      if (backupData.tables.repositionTimers && Array.isArray(backupData.tables.repositionTimers)) {
        console.log(`Restaurando ${backupData.tables.repositionTimers.length} timers de reposiciones...`);
        for (const timerData of backupData.tables.repositionTimers) {
          try {
            await db.insert(repositionTimers).values({
              ...timerData,
              createdAt: timerData.createdAt ? new Date(timerData.createdAt) : new Date(),
              startTime: timerData.startTime ? new Date(timerData.startTime) : null,
              endTime: timerData.endTime ? new Date(timerData.endTime) : null
            }).onConflictDoNothing();
            restored.repositionTimers++;
          } catch (error: any) {
            console.error(`Error restoring reposition timer:`, error);
            restored.errors++;
          }
        }
        console.log(`Timers de reposiciones procesados: ${restored.repositionTimers} restaurados`);
      }

      // 11. Materiales de reposiciones
      if (backupData.tables.repositionMaterials && Array.isArray(backupData.tables.repositionMaterials)) {
        console.log(`Restaurando ${backupData.tables.repositionMaterials.length} materiales de reposiciones...`);
        for (const materialData of backupData.tables.repositionMaterials) {
          try {
            await db.insert(repositionMaterials).values({
              ...materialData,
              createdAt: materialData.createdAt ? new Date(materialData.createdAt) : new Date(),
              updatedAt: materialData.updatedAt ? new Date(materialData.updatedAt) : new Date(),
              pausedAt: materialData.pausedAt ? new Date(materialData.pausedAt) : null,
              resumedAt: materialData.resumedAt ? new Date(materialData.resumedAt) : null
            }).onConflictDoNothing();
            restored.repositionMaterials++;
          } catch (error: any) {
            console.error(`Error restoring reposition material:`, error);
            restored.errors++;
          }
        }
        console.log(`Materiales de reposiciones procesados: ${restored.repositionMaterials} restaurados`);
      }

      // 11.5 Contraste de telas de reposiciones (Nuevo)
      if (backupData.tables.repositionContrastFabrics && Array.isArray(backupData.tables.repositionContrastFabrics)) {
        console.log(`Restaurando ${backupData.tables.repositionContrastFabrics.length} contrastes de telas...`);
        for (const contrastData of backupData.tables.repositionContrastFabrics) {
          try {
            await db.insert(repositionContrastFabrics).values({
              ...contrastData,
              createdAt: contrastData.createdAt ? new Date(contrastData.createdAt) : new Date()
            }).onConflictDoNothing();
            restored.repositionContrastFabrics++;
          } catch (error: any) {
            console.error(`Error restoring reposition contrast fabric:`, error);
            restored.errors++;
          }
        }
        console.log(`Contrastes de telas procesados: ${restored.repositionContrastFabrics} restaurados`);
      }

      // 12. Contraseñas de admin
      if (backupData.tables.adminPasswords && Array.isArray(backupData.tables.adminPasswords)) {
        console.log(`Restaurando ${backupData.tables.adminPasswords.length} contraseñas de admin...`);
        for (const passwordData of backupData.tables.adminPasswords) {
          try {
            await db.insert(adminPasswords).values({
              ...passwordData,
              createdAt: passwordData.createdAt ? new Date(passwordData.createdAt) : new Date()
            }).onConflictDoNothing();
            restored.adminPasswords++;
          } catch (error: any) {
            console.error(`Error restoring admin password:`, error);
            restored.errors++;
          }
        }
        console.log(`Contraseñas de admin procesadas: ${restored.adminPasswords} restauradas`);
      }



      console.log('Complete system restore completed');

      const totalRestored = Object.values(restored).reduce((sum: number, val: number) =>
        typeof val === 'number' ? sum + val : sum, 0
      );

      return {
        message: `Restauración del sistema completada: ${totalRestored} elementos restaurados total`,
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
    } catch (error: any) {
      console.error('Restore complete system error:', error);

      // Si ya es un error de validación, no lo anidemos
      if (error.message.includes('Formato de respaldo inválido')) {
        throw error;
      }

      throw new Error(`Error al restaurar el sistema completo: ${error.message}`);
    }
  }
  async getSystemSetting(key: string): Promise<string | undefined> {
    const [setting] = await db.select().from(systemSettings).where(eq(systemSettings.key, key));
    return setting?.value;
  }

  async setSystemSetting(key: string, value: string, userId: number): Promise<void> {
    const existing = await this.getSystemSetting(key);
    if (existing !== undefined) {
      await db.update(systemSettings)
        .set({ value, updatedBy: userId, updatedAt: new Date() })
        .where(eq(systemSettings.key, key));
    } else {
      await db.insert(systemSettings).values({
        key,
        value,
        updatedBy: userId,
        updatedAt: new Date()
      });
    }
  }
}

export const storage = new DatabaseStorage();