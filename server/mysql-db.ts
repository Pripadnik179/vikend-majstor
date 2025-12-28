import mysql from 'mysql2/promise';

let mysqlPool: mysql.Pool | null = null;

export function getMySQLPool(): mysql.Pool | null {
  if (!process.env.MYSQL_URL) {
    console.log('MYSQL_URL not configured - production database not available');
    return null;
  }
  
  if (!mysqlPool) {
    mysqlPool = mysql.createPool(process.env.MYSQL_URL);
    console.log('MySQL production database pool created');
  }
  
  return mysqlPool;
}

export async function queryMySQL<T = any>(sql: string, params: any[] = []): Promise<T[]> {
  const pool = getMySQLPool();
  if (!pool) {
    throw new Error('MySQL connection not available');
  }
  
  const [rows] = await pool.execute(sql, params);
  return rows as T[];
}

export async function executeMySQL(sql: string, params: any[] = []): Promise<mysql.ResultSetHeader> {
  const pool = getMySQLPool();
  if (!pool) {
    throw new Error('MySQL connection not available');
  }
  
  const [result] = await pool.execute(sql, params);
  return result as mysql.ResultSetHeader;
}

export interface ProductionEmailSubscriber {
  id: number;
  email: string;
  source: string;
  is_active: boolean;
  created_at: Date;
}

export interface ProductionSubscription {
  id: number;
  user_id: string;
  tier: string;
  status: string;
  started_at: Date;
  expires_at: Date;
  amount: number;
}

export async function getProductionSubscribers(): Promise<ProductionEmailSubscriber[]> {
  try {
    return await queryMySQL<ProductionEmailSubscriber>(
      'SELECT id, email, source, is_active, created_at FROM email_subscribers ORDER BY created_at DESC'
    );
  } catch (error: any) {
    console.error('Error fetching production subscribers:', error.message);
    return [];
  }
}

export async function addProductionSubscriber(email: string, source: string = 'landing_page'): Promise<boolean> {
  try {
    const existing = await queryMySQL<{id: number}>(
      'SELECT id FROM email_subscribers WHERE email = ?',
      [email]
    );
    
    if (existing.length > 0) {
      await executeMySQL(
        'UPDATE email_subscribers SET is_active = 1 WHERE email = ?',
        [email]
      );
      return false;
    }
    
    await executeMySQL(
      'INSERT INTO email_subscribers (email, source, is_active, created_at) VALUES (?, ?, 1, NOW())',
      [email, source]
    );
    return true;
  } catch (error: any) {
    console.error('Error adding production subscriber:', error.message);
    throw error;
  }
}

export async function deleteProductionSubscriber(id: number): Promise<boolean> {
  try {
    const result = await executeMySQL(
      'DELETE FROM email_subscribers WHERE id = ?',
      [id]
    );
    return result.affectedRows > 0;
  } catch (error: any) {
    console.error('Error deleting production subscriber:', error.message);
    return false;
  }
}

export async function getProductionSubscriptions(): Promise<any[]> {
  try {
    return await queryMySQL(
      `SELECT s.id, s.user_id, s.tier, s.status, s.started_at, s.expires_at, s.amount,
              u.name as user_name, u.email as user_email
       FROM subscriptions s
       LEFT JOIN users u ON s.user_id = u.id
       ORDER BY s.started_at DESC`
    );
  } catch (error: any) {
    console.error('Error fetching production subscriptions:', error.message);
    return [];
  }
}

export async function updateProductionSubscription(id: number, updates: {tier?: string; status?: string; expiresAt?: Date}): Promise<boolean> {
  try {
    const setClauses: string[] = [];
    const params: any[] = [];
    
    if (updates.tier) {
      setClauses.push('tier = ?');
      params.push(updates.tier);
    }
    if (updates.status) {
      setClauses.push('status = ?');
      params.push(updates.status);
    }
    if (updates.expiresAt) {
      setClauses.push('expires_at = ?');
      params.push(updates.expiresAt);
    }
    
    if (setClauses.length === 0) return false;
    
    params.push(id);
    const result = await executeMySQL(
      `UPDATE subscriptions SET ${setClauses.join(', ')} WHERE id = ?`,
      params
    );
    return result.affectedRows > 0;
  } catch (error: any) {
    console.error('Error updating production subscription:', error.message);
    return false;
  }
}

export function isProductionAvailable(): boolean {
  return !!process.env.MYSQL_URL;
}
