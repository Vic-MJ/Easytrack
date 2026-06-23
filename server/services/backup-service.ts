import cron, { ScheduledTask } from 'node-cron';
import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs';
import { db } from '../db';
import { systemSettings } from '@shared/schema';
import { eq } from 'drizzle-orm';

const HOME_DIR = process.env.HOME || '/home/victor';
const BACKUP_DIR = path.join(HOME_DIR, 'Documentos', 'Backups_Jasana');

// Asegurar que el directorio existe
if (!fs.existsSync(BACKUP_DIR)) {
  try {
    fs.mkdirSync(BACKUP_DIR, { recursive: true });
    console.log(`[BACKUP SERVICE] Directorio de respaldos creado en: ${BACKUP_DIR}`);
  } catch (error) {
    console.error(`[BACKUP SERVICE] Error al crear el directorio en Documentos, usando fallback: ${error}`);
  }
}

export interface BackupConfig {
  enabled: boolean;
  frequency: 'daily' | 'weekly' | 'monthly';
  hour: number; // 0-23
  minute: number; // 0-59
  dayOfWeek?: number; // 0-6 (0=Domingo)
  dayOfMonth?: number; // 1-31
  keepLast?: number; // Cuántos respaldos mantener
}

class BackupService {
  private currentJob: ScheduledTask | null = null;

  async init() {
    console.log('[BACKUP SERVICE] Iniciando servicio de respaldos automáticos...');
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
        console.log('[BACKUP SERVICE] Respaldos automáticos desactivados.');
        return;
      }

      const cronExpression = this.getCronExpression(config);
      console.log(`[BACKUP SERVICE] Programando respaldo: ${cronExpression} (${config.frequency})`);

      this.currentJob = cron.schedule(cronExpression, async () => {
        try {
          await this.runBackup();
        } catch (error) {
          console.error('[BACKUP SERVICE] Error en la ejecución programada:', error);
        }
      });
    } catch (error) {
      console.error('[BACKUP SERVICE] Error al configurar el cron:', error);
    }
  }

  private async getConfig(): Promise<BackupConfig | null> {
    try {
      const [setting] = await db.select().from(systemSettings).where(eq(systemSettings.key, 'backup_config'));
      if (!setting) return null;
      return JSON.parse(setting.value) as BackupConfig;
    } catch (error) {
      console.error('[BACKUP SERVICE] Error al obtener configuración de la DB:', error);
      return null;
    }
  }

  private getCronExpression(config: BackupConfig): string {
    const { minute = 0, hour = 3, frequency, dayOfWeek, dayOfMonth } = config;
    
    if (frequency === 'daily') {
      return `${minute} ${hour} * * *`;
    } else if (frequency === 'weekly') {
      return `${minute} ${hour} * * ${dayOfWeek ?? 0}`;
    } else if (frequency === 'monthly') {
      return `${minute} ${hour} ${dayOfMonth ?? 1} * *`;
    }
    
    return `${minute} ${hour} * * *`; // Por defecto diario
  }

  async runBackup() {
    console.log('[BACKUP SERVICE] Iniciando respaldo automático...');
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('T')[0];
    const filename = `auto-backup-${timestamp}-${Date.now()}.backup`;
    const filepath = path.join(BACKUP_DIR, filename);

    const connectionString = process.env.DATABASE_URL || "postgresql://postgres:12345@localhost:5432/jasanaordenes";
    
    return new Promise((resolve, reject) => {
      const pgDump = spawn('pg_dump', ['-F', 'c', '-f', filepath, '-d', connectionString]);

      pgDump.on('close', (code) => {
        if (code === 0) {
          console.log(`[BACKUP SERVICE] Respaldo completado: ${filename}`);
          this.cleanupOldBackups().then(() => resolve(true));
        } else {
          console.error(`[BACKUP SERVICE] pg_dump falló con código ${code}`);
          reject(new Error(`pg_dump failed with code ${code}`));
        }
      });

      pgDump.on('error', (err) => {
        console.error('[BACKUP SERVICE] Error fatal ejecutando pg_dump:', err);
        reject(err);
      });
    });
  }

  private async cleanupOldBackups() {
    try {
      const config = await this.getConfig();
      const keepLast = config?.keepLast || 10;

      const files = fs.readdirSync(BACKUP_DIR)
        .filter(f => f.startsWith('auto-backup-'))
        .map(f => ({ name: f, time: fs.statSync(path.join(BACKUP_DIR, f)).mtime.getTime() }))
        .sort((a, b) => b.time - a.time);

      if (files.length > keepLast) {
        files.slice(keepLast).forEach(f => {
          fs.unlinkSync(path.join(BACKUP_DIR, f.name));
          console.log(`[BACKUP SERVICE] Depurado respaldo antiguo: ${f.name}`);
        });
      }
    } catch (error) {
      console.error('[BACKUP SERVICE] Error al limpiar archivos antiguos:', error);
    }
  }

  async listBackups() {
    if (!fs.existsSync(BACKUP_DIR)) return [];
    
    return fs.readdirSync(BACKUP_DIR)
      .filter(f => f.startsWith('auto-backup-'))
      .map(f => {
        const stats = fs.statSync(path.join(BACKUP_DIR, f));
        return {
          filename: f,
          size: stats.size,
          createdAt: stats.mtime
        };
      })
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  getBackupPath(filename: string) {
    const safeName = path.basename(filename);
    const filepath = path.join(BACKUP_DIR, safeName);
    if (fs.existsSync(filepath)) return filepath;
    return null;
  }
}

export const backupService = new BackupService();
