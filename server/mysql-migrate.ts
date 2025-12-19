import mysql from "mysql2/promise";

async function migrate() {
  if (!process.env.MYSQL_URL) {
    throw new Error("MYSQL_URL is not set");
  }

  console.log("Connecting to MySQL database...");
  const connection = await mysql.createConnection(process.env.MYSQL_URL);
  
  console.log("Creating tables...");

  await connection.execute(`
    CREATE TABLE IF NOT EXISTS users (
      id VARCHAR(36) PRIMARY KEY,
      email VARCHAR(255) NOT NULL UNIQUE,
      password TEXT NOT NULL,
      name VARCHAR(255) NOT NULL,
      phone VARCHAR(50),
      city VARCHAR(100),
      district VARCHAR(100),
      avatar_url TEXT,
      role ENUM('owner', 'renter') NOT NULL DEFAULT 'renter',
      rating DECIMAL(2, 1) DEFAULT 0,
      total_ratings INT DEFAULT 0,
      email_verified BOOLEAN NOT NULL DEFAULT FALSE,
      subscription_type ENUM('free', 'basic', 'premium') NOT NULL DEFAULT 'free',
      subscription_status ENUM('active', 'expired', 'cancelled') NOT NULL DEFAULT 'active',
      subscription_start_date TIMESTAMP NULL,
      subscription_end_date TIMESTAMP NULL,
      is_early_adopter BOOLEAN NOT NULL DEFAULT FALSE,
      is_premium_listing BOOLEAN NOT NULL DEFAULT FALSE,
      premium_listing_end_date TIMESTAMP NULL,
      free_feature_used BOOLEAN NOT NULL DEFAULT FALSE,
      stripe_customer_id VARCHAR(255),
      total_ads_created INT NOT NULL DEFAULT 0,
      push_token TEXT,
      is_admin BOOLEAN NOT NULL DEFAULT FALSE,
      is_active BOOLEAN NOT NULL DEFAULT TRUE,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `);
  console.log("Created users table");

  await connection.execute(`
    CREATE TABLE IF NOT EXISTS verification_tokens (
      id VARCHAR(36) PRIMARY KEY,
      user_id VARCHAR(36) NOT NULL,
      token VARCHAR(255) NOT NULL UNIQUE,
      type VARCHAR(50) NOT NULL DEFAULT 'email',
      expires_at TIMESTAMP NOT NULL,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);
  console.log("Created verification_tokens table");

  await connection.execute(`
    CREATE TABLE IF NOT EXISTS subscriptions (
      id VARCHAR(36) PRIMARY KEY,
      user_id VARCHAR(36) NOT NULL,
      type ENUM('free', 'basic', 'premium') NOT NULL,
      status ENUM('active', 'expired', 'cancelled') NOT NULL DEFAULT 'active',
      price_rsd INT NOT NULL,
      start_date TIMESTAMP NOT NULL,
      end_date TIMESTAMP NOT NULL,
      stripe_payment_intent_id VARCHAR(255),
      stripe_subscription_id VARCHAR(255),
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);
  console.log("Created subscriptions table");

  await connection.execute(`
    CREATE TABLE IF NOT EXISTS items (
      id VARCHAR(36) PRIMARY KEY,
      owner_id VARCHAR(36) NOT NULL,
      title VARCHAR(255) NOT NULL,
      description TEXT NOT NULL,
      category VARCHAR(100) NOT NULL,
      sub_category VARCHAR(100),
      tool_type VARCHAR(100),
      tool_sub_type VARCHAR(100),
      brand VARCHAR(100),
      power_source VARCHAR(100),
      power_watts INT,
      price_per_day INT NOT NULL,
      deposit INT NOT NULL,
      city VARCHAR(100) NOT NULL,
      district VARCHAR(100),
      latitude DECIMAL(10, 7),
      longitude DECIMAL(10, 7),
      images JSON DEFAULT ('[]'),
      ad_type VARCHAR(50) NOT NULL DEFAULT 'renting',
      is_available BOOLEAN NOT NULL DEFAULT TRUE,
      is_featured BOOLEAN NOT NULL DEFAULT FALSE,
      rating DECIMAL(2, 1) DEFAULT 0,
      total_ratings INT DEFAULT 0,
      expires_at TIMESTAMP NULL,
      activity_tags JSON,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);
  console.log("Created items table");

  await connection.execute(`
    CREATE TABLE IF NOT EXISTS bookings (
      id VARCHAR(36) PRIMARY KEY,
      item_id VARCHAR(36) NOT NULL,
      renter_id VARCHAR(36) NOT NULL,
      owner_id VARCHAR(36) NOT NULL,
      start_date TIMESTAMP NOT NULL,
      end_date TIMESTAMP NOT NULL,
      total_days INT NOT NULL,
      total_price INT NOT NULL,
      deposit INT NOT NULL,
      status ENUM('pending', 'confirmed', 'active', 'completed', 'cancelled') NOT NULL DEFAULT 'pending',
      payment_method VARCHAR(50) DEFAULT 'cash',
      stripe_payment_id VARCHAR(255),
      pickup_confirmed BOOLEAN DEFAULT FALSE,
      return_confirmed BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (item_id) REFERENCES items(id) ON DELETE CASCADE,
      FOREIGN KEY (renter_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);
  console.log("Created bookings table");

  await connection.execute(`
    CREATE TABLE IF NOT EXISTS conversations (
      id VARCHAR(36) PRIMARY KEY,
      user1_id VARCHAR(36) NOT NULL,
      user2_id VARCHAR(36) NOT NULL,
      item_id VARCHAR(36),
      last_message_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user1_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (user2_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (item_id) REFERENCES items(id) ON DELETE SET NULL
    )
  `);
  console.log("Created conversations table");

  await connection.execute(`
    CREATE TABLE IF NOT EXISTS messages (
      id VARCHAR(36) PRIMARY KEY,
      conversation_id VARCHAR(36) NOT NULL,
      sender_id VARCHAR(36) NOT NULL,
      receiver_id VARCHAR(36) NOT NULL,
      content TEXT NOT NULL,
      is_read BOOLEAN NOT NULL DEFAULT FALSE,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE,
      FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (receiver_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);
  console.log("Created messages table");

  await connection.execute(`
    CREATE TABLE IF NOT EXISTS reviews (
      id VARCHAR(36) PRIMARY KEY,
      booking_id VARCHAR(36) NOT NULL,
      item_id VARCHAR(36) NOT NULL,
      reviewer_id VARCHAR(36) NOT NULL,
      reviewee_id VARCHAR(36) NOT NULL,
      rating INT NOT NULL,
      comment TEXT,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE,
      FOREIGN KEY (item_id) REFERENCES items(id) ON DELETE CASCADE,
      FOREIGN KEY (reviewer_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (reviewee_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);
  console.log("Created reviews table");

  console.log("Creating admin user...");
  
  const adminId = '00000000-0000-0000-0000-000000000001';
  const adminPassword = '$scrypt$n=32768,r=8,p=1$dGVzdHNhbHQ$C/WlSfALx7FQaE5P9dGjPZp0hT5lbNj5X9R+C9F+Q5s=';
  
  try {
    await connection.execute(`
      INSERT IGNORE INTO users (id, email, password, name, is_admin, is_active, email_verified)
      VALUES (?, 'marko@demo.com', ?, 'Marko Admin', TRUE, TRUE, TRUE)
    `, [adminId, adminPassword]);
    console.log("Admin user created or already exists");
  } catch (e) {
    console.log("Admin user may already exist");
  }

  await connection.end();
  console.log("Migration complete!");
}

migrate().catch(console.error);
