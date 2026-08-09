import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Complete base schema migration.
 * Creates all tables from scratch — safe to run on a fresh empty database.
 * The original auto-generated migration was a diff against an existing DB
 * and failed on fresh installs.  This replaces it.
 */
export class InitialSchema1783761942468 implements MigrationInterface {
  name = 'InitialSchema1783761942468';

  public async up(queryRunner: QueryRunner): Promise<void> {
    /* ------------------------------------------------------------------ */
    /* CORE RBAC TABLES                                                     */
    /* ------------------------------------------------------------------ */
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS \`permission_groups\` (
        \`id\`           varchar(36)  NOT NULL,
        \`created_at\`   timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
        \`updated_at\`   timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
        \`deleted_at\`   timestamp(6) NULL,
        \`created_by\`   varchar(36)  NULL,
        \`updated_by\`   varchar(36)  NULL,
        \`deleted_by\`   varchar(36)  NULL,
        \`status\`       varchar(50)  NOT NULL DEFAULT 'active',
        \`is_active\`    tinyint      NOT NULL DEFAULT 1,
        \`remarks\`      text         NULL,
        \`name\`         varchar(100) NOT NULL,
        \`code\`         varchar(100) NOT NULL,
        \`description\`  text         NULL,
        \`sort_order\`   int          NOT NULL DEFAULT 0,
        UNIQUE INDEX \`UQ_pg_name\` (\`name\`),
        UNIQUE INDEX \`UQ_pg_code\` (\`code\`),
        PRIMARY KEY (\`id\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS \`permissions\` (
        \`id\`                  varchar(36)  NOT NULL,
        \`created_at\`          timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
        \`updated_at\`          timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
        \`deleted_at\`          timestamp(6) NULL,
        \`created_by\`          varchar(36)  NULL,
        \`updated_by\`          varchar(36)  NULL,
        \`deleted_by\`          varchar(36)  NULL,
        \`status\`              varchar(50)  NOT NULL DEFAULT 'active',
        \`is_active\`           tinyint      NOT NULL DEFAULT 1,
        \`remarks\`             text         NULL,
        \`name\`                varchar(100) NOT NULL,
        \`code\`                varchar(100) NOT NULL,
        \`description\`         text         NULL,
        \`type\`                enum('page','button','api','field','record','branch','kitchen') NOT NULL DEFAULT 'api',
        \`resource\`            varchar(255) NULL,
        \`action\`              varchar(50)  NULL,
        \`permission_group_id\` varchar(36)  NULL,
        UNIQUE INDEX \`UQ_perm_name\` (\`name\`),
        UNIQUE INDEX \`UQ_perm_code\` (\`code\`),
        INDEX \`IDX_perm_group\` (\`permission_group_id\`),
        PRIMARY KEY (\`id\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS \`roles\` (
        \`id\`             varchar(36)  NOT NULL,
        \`created_at\`     timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
        \`updated_at\`     timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
        \`deleted_at\`     timestamp(6) NULL,
        \`created_by\`     varchar(36)  NULL,
        \`updated_by\`     varchar(36)  NULL,
        \`deleted_by\`     varchar(36)  NULL,
        \`status\`         varchar(50)  NOT NULL DEFAULT 'active',
        \`is_active\`      tinyint      NOT NULL DEFAULT 1,
        \`remarks\`        text         NULL,
        \`name\`           varchar(100) NOT NULL,
        \`code\`           varchar(100) NOT NULL,
        \`description\`    text         NULL,
        \`level\`          int          NOT NULL DEFAULT 0,
        \`parent_role_id\` varchar(36)  NULL,
        UNIQUE INDEX \`UQ_role_name\` (\`name\`),
        UNIQUE INDEX \`UQ_role_code\` (\`code\`),
        PRIMARY KEY (\`id\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS \`role_permissions\` (
        \`role_id\`       varchar(36) NOT NULL,
        \`permission_id\` varchar(36) NOT NULL,
        INDEX \`IDX_178199805b901ccd220ab7740e\` (\`role_id\`),
        INDEX \`IDX_17022daf3f885f7d35423e9971\` (\`permission_id\`),
        PRIMARY KEY (\`role_id\`, \`permission_id\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS \`users\` (
        \`id\`                        varchar(36)  NOT NULL,
        \`created_at\`                timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
        \`updated_at\`                timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
        \`deleted_at\`                timestamp(6) NULL,
        \`created_by\`                varchar(36)  NULL,
        \`updated_by\`                varchar(36)  NULL,
        \`deleted_by\`                varchar(36)  NULL,
        \`status\`                    varchar(50)  NOT NULL DEFAULT 'active',
        \`is_active\`                 tinyint      NOT NULL DEFAULT 1,
        \`remarks\`                   text         NULL,
        \`email\`                     varchar(255) NOT NULL,
        \`password\`                  varchar(255) NOT NULL,
        \`first_name\`                varchar(100) NOT NULL,
        \`last_name\`                 varchar(100) NOT NULL,
        \`phone\`                     varchar(20)  NULL,
        \`avatar\`                    varchar(255) NULL,
        \`last_login_at\`             timestamp    NULL,
        \`last_login_ip\`             varchar(50)  NULL,
        \`last_login_device\`         text         NULL,
        \`failed_login_attempts\`     int          NOT NULL DEFAULT 0,
        \`locked_until\`              timestamp    NULL,
        \`reset_token\`               varchar(255) NULL,
        \`reset_token_expiry\`        timestamp    NULL,
        \`otp\`                       varchar(10)  NULL,
        \`otp_expiry\`                timestamp    NULL,
        \`is_email_verified\`         tinyint      NOT NULL DEFAULT 0,
        \`is_password_change_required\` tinyint    NOT NULL DEFAULT 1,
        \`role_id\`                   varchar(36)  NULL,
        \`branch_id\`                 varchar(36)  NULL,
        UNIQUE INDEX \`UQ_user_email\` (\`email\`),
        INDEX \`IDX_user_role\` (\`role_id\`),
        PRIMARY KEY (\`id\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS \`user_permissions\` (
        \`id\`            varchar(36)  NOT NULL,
        \`created_at\`    timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
        \`updated_at\`    timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
        \`deleted_at\`    timestamp(6) NULL,
        \`created_by\`    varchar(36)  NULL,
        \`updated_by\`    varchar(36)  NULL,
        \`deleted_by\`    varchar(36)  NULL,
        \`status\`        varchar(50)  NOT NULL DEFAULT 'active',
        \`is_active\`     tinyint      NOT NULL DEFAULT 1,
        \`remarks\`       text         NULL,
        \`user_id\`       varchar(36)  NOT NULL,
        \`permission_id\` varchar(36)  NOT NULL,
        \`is_granted\`    tinyint      NOT NULL DEFAULT 1,
        UNIQUE INDEX \`UQ_user_perm\` (\`user_id\`, \`permission_id\`),
        PRIMARY KEY (\`id\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    /* ------------------------------------------------------------------ */
    /* RESTAURANT / BRANCH / KITCHEN / TABLE                               */
    /* ------------------------------------------------------------------ */
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS \`restaurants\` (
        \`id\`            varchar(36)  NOT NULL,
        \`created_at\`    timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
        \`updated_at\`    timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
        \`deleted_at\`    timestamp(6) NULL,
        \`created_by\`    varchar(36)  NULL,
        \`updated_by\`    varchar(36)  NULL,
        \`deleted_by\`    varchar(36)  NULL,
        \`status\`        varchar(50)  NOT NULL DEFAULT 'active',
        \`is_active\`     tinyint      NOT NULL DEFAULT 1,
        \`remarks\`       text         NULL,
        \`name\`          varchar(255) NOT NULL,
        \`code\`          varchar(100) NOT NULL,
        \`description\`   text         NULL,
        \`logo\`          varchar(255) NULL,
        \`address\`       text         NOT NULL,
        \`city\`          varchar(100) NOT NULL,
        \`state\`         varchar(100) NOT NULL,
        \`country\`       varchar(100) NOT NULL,
        \`pincode\`       varchar(20)  NOT NULL,
        \`phone\`         varchar(20)  NOT NULL,
        \`email\`         varchar(255) NULL,
        \`website\`       varchar(255) NULL,
        \`gst_number\`    varchar(50)  NULL,
        \`pan_number\`    varchar(50)  NULL,
        \`fssai_license\` varchar(100) NULL,
        \`currency\`      varchar(10)  NOT NULL DEFAULT 'INR',
        \`language\`      varchar(10)  NOT NULL DEFAULT 'en',
        \`timezone\`      varchar(50)  NOT NULL DEFAULT 'Asia/Kolkata',
        UNIQUE INDEX \`UQ_rest_code\` (\`code\`),
        PRIMARY KEY (\`id\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS \`branches\` (
        \`id\`                       varchar(36)    NOT NULL,
        \`created_at\`               timestamp(6)   NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
        \`updated_at\`               timestamp(6)   NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
        \`deleted_at\`               timestamp(6)   NULL,
        \`created_by\`               varchar(36)    NULL,
        \`updated_by\`               varchar(36)    NULL,
        \`deleted_by\`               varchar(36)    NULL,
        \`status\`                   varchar(50)    NOT NULL DEFAULT 'active',
        \`is_active\`                tinyint        NOT NULL DEFAULT 1,
        \`remarks\`                  text           NULL,
        \`name\`                     varchar(255)   NOT NULL,
        \`code\`                     varchar(100)   NOT NULL,
        \`description\`              text           NULL,
        \`restaurant_id\`            varchar(36)    NOT NULL,
        \`address\`                  text           NOT NULL,
        \`city\`                     varchar(100)   NOT NULL,
        \`state\`                    varchar(100)   NOT NULL,
        \`country\`                  varchar(100)   NOT NULL,
        \`pincode\`                  varchar(20)    NOT NULL,
        \`phone\`                    varchar(20)    NOT NULL,
        \`email\`                    varchar(255)   NULL,
        \`gst_number\`               varchar(50)    NULL,
        \`latitude\`                 decimal(10,6)  NULL,
        \`longitude\`                decimal(10,6)  NULL,
        \`parent_branch_id\`         varchar(36)    NULL,
        \`manager_id\`               varchar(36)    NULL,
        \`business_hours\`           json           NULL,
        \`service_charge_percentage\` decimal(5,2)  NOT NULL DEFAULT 0,
        \`tax_configuration\`        json           NULL,
        UNIQUE INDEX \`UQ_branch_code\` (\`code\`),
        INDEX \`IDX_branch_restaurant\` (\`restaurant_id\`),
        PRIMARY KEY (\`id\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS \`kitchens\` (
        \`id\`           varchar(36)  NOT NULL,
        \`created_at\`   timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
        \`updated_at\`   timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
        \`deleted_at\`   timestamp(6) NULL,
        \`created_by\`   varchar(36)  NULL,
        \`updated_by\`   varchar(36)  NULL,
        \`deleted_by\`   varchar(36)  NULL,
        \`status\`       varchar(50)  NOT NULL DEFAULT 'active',
        \`is_active\`    tinyint      NOT NULL DEFAULT 1,
        \`remarks\`      text         NULL,
        \`name\`         varchar(255) NOT NULL,
        \`code\`         varchar(100) NOT NULL,
        \`description\`  text         NULL,
        \`branch_id\`    varchar(36)  NOT NULL,
        \`location\`     varchar(100) NULL,
        \`manager_id\`   varchar(36)  NULL,
        \`printer_ip\`   varchar(255) NULL,
        \`printer_port\` int          NULL,
        \`sort_order\`   int          NOT NULL DEFAULT 0,
        INDEX \`IDX_kitchen_branch\` (\`branch_id\`),
        PRIMARY KEY (\`id\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS \`tables\` (
        \`id\`                    varchar(36)   NOT NULL,
        \`created_at\`            timestamp(6)  NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
        \`updated_at\`            timestamp(6)  NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
        \`deleted_at\`            timestamp(6)  NULL,
        \`created_by\`            varchar(36)   NULL,
        \`updated_by\`            varchar(36)   NULL,
        \`deleted_by\`            varchar(36)   NULL,
        \`status\`                varchar(50)   NOT NULL DEFAULT 'active',
        \`is_active\`             tinyint       NOT NULL DEFAULT 1,
        \`remarks\`               text          NULL,
        \`name\`                  varchar(100)  NOT NULL,
        \`table_number\`          varchar(50)   NOT NULL,
        \`branch_id\`             varchar(36)   NOT NULL,
        \`table_type\`            enum('2-seater','4-seater','6-seater','8-seater','custom') NOT NULL DEFAULT '4-seater',
        \`capacity\`              int           NOT NULL DEFAULT 4,
        \`table_status\`          enum('available','occupied','reserved','cleaning') NOT NULL DEFAULT 'available',
        \`shape\`                 enum('round','square','rectangle') NOT NULL DEFAULT 'square',
        \`dining_area\`           varchar(100)  NULL,
        \`position_x\`            decimal(10,2) NULL,
        \`position_y\`            decimal(10,2) NULL,
        \`width\`                 decimal(5,2)  NULL,
        \`height\`                decimal(5,2)  NULL,
        \`sort_order\`            int           NOT NULL DEFAULT 0,
        \`current_order_id\`      varchar(36)   NULL,
        \`merged_with_table_id\`  varchar(36)   NULL,
        \`is_merged\`             tinyint       NOT NULL DEFAULT 0,
        INDEX \`IDX_table_branch\` (\`branch_id\`),
        PRIMARY KEY (\`id\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    /* ------------------------------------------------------------------ */
    /* MENU                                                                 */
    /* ------------------------------------------------------------------ */
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS \`categories\` (
        \`id\`                 varchar(36)  NOT NULL,
        \`created_at\`         timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
        \`updated_at\`         timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
        \`deleted_at\`         timestamp(6) NULL,
        \`created_by\`         varchar(36)  NULL,
        \`updated_by\`         varchar(36)  NULL,
        \`deleted_by\`         varchar(36)  NULL,
        \`status\`             varchar(50)  NOT NULL DEFAULT 'active',
        \`is_active\`          tinyint      NOT NULL DEFAULT 1,
        \`remarks\`            text         NULL,
        \`name\`               varchar(255) NOT NULL,
        \`code\`               varchar(100) NOT NULL,
        \`description\`        text         NULL,
        \`image\`              varchar(255) NULL,
        \`parent_category_id\` varchar(36)  NULL,
        \`sort_order\`         int          NOT NULL DEFAULT 0,
        UNIQUE INDEX \`UQ_cat_code\` (\`code\`),
        PRIMARY KEY (\`id\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS \`menu_items\` (
        \`id\`                   varchar(36)    NOT NULL,
        \`created_at\`           timestamp(6)   NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
        \`updated_at\`           timestamp(6)   NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
        \`deleted_at\`           timestamp(6)   NULL,
        \`created_by\`           varchar(36)    NULL,
        \`updated_by\`           varchar(36)    NULL,
        \`deleted_by\`           varchar(36)    NULL,
        \`status\`               varchar(50)    NOT NULL DEFAULT 'active',
        \`is_active\`            tinyint        NOT NULL DEFAULT 1,
        \`remarks\`              text           NULL,
        \`name\`                 varchar(255)   NOT NULL,
        \`sku\`                  varchar(100)   NOT NULL,
        \`description\`          text           NULL,
        \`category_id\`          varchar(36)    NOT NULL,
        \`price\`                decimal(10,2)  NOT NULL,
        \`cost_price\`           decimal(10,2)  NULL,
        \`food_type\`            enum('veg','non_veg','egg','jain') NOT NULL DEFAULT 'veg',
        \`spicy_level\`          enum('none','mild','medium','hot','extra_hot') NOT NULL DEFAULT 'none',
        \`portion_size\`         enum('small','medium','large','custom') NOT NULL DEFAULT 'medium',
        \`preparation_time\`     int            NULL,
        \`image\`                varchar(255)   NULL,
        \`gallery\`              json           NULL,
        \`barcode\`              varchar(255)   NULL,
        \`qr_code\`              text           NULL,
        \`nutritional_values\`   json           NULL,
        \`allergens\`            json           NULL,
        \`is_available\`         tinyint        NOT NULL DEFAULT 1,
        \`is_combo\`             tinyint        NOT NULL DEFAULT 0,
        \`combo_items\`          json           NULL,
        \`variants\`             json           NULL,
        \`add_ons\`              json           NULL,
        \`modifiers\`            json           NULL,
        \`dynamic_pricing\`      json           NULL,
        \`seasonal_price_start\` date           NULL,
        \`seasonal_price_end\`   date           NULL,
        \`seasonal_price\`       decimal(10,2)  NULL,
        \`printer_id\`           varchar(36)    NULL,
        \`sort_order\`           int            NOT NULL DEFAULT 0,
        \`total_sold\`           int            NOT NULL DEFAULT 0,
        UNIQUE INDEX \`UQ_mi_sku\` (\`sku\`),
        INDEX \`IDX_mi_category\` (\`category_id\`),
        PRIMARY KEY (\`id\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS \`menu_item_kitchens\` (
        \`menu_item_id\` varchar(36) NOT NULL,
        \`kitchen_id\`   varchar(36) NOT NULL,
        INDEX \`IDX_e4ee78a1bde86e4a05e76cc5c0\` (\`menu_item_id\`),
        INDEX \`IDX_417409ed989390da9f90513579\` (\`kitchen_id\`),
        PRIMARY KEY (\`menu_item_id\`, \`kitchen_id\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    /* ------------------------------------------------------------------ */
    /* ORDERS / KOT / INVOICES / PAYMENTS                                  */
    /* ------------------------------------------------------------------ */
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS \`customers\` (
        \`id\`               varchar(36)    NOT NULL,
        \`created_at\`       timestamp(6)   NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
        \`updated_at\`       timestamp(6)   NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
        \`deleted_at\`       timestamp(6)   NULL,
        \`created_by\`       varchar(36)    NULL,
        \`updated_by\`       varchar(36)    NULL,
        \`deleted_by\`       varchar(36)    NULL,
        \`status\`           varchar(50)    NOT NULL DEFAULT 'active',
        \`is_active\`        tinyint        NOT NULL DEFAULT 1,
        \`remarks\`          text           NULL,
        \`name\`             varchar(255)   NOT NULL,
        \`phone\`            varchar(20)    NOT NULL,
        \`email\`            varchar(255)   NULL,
        \`address\`          text           NULL,
        \`city\`             varchar(100)   NULL,
        \`state\`            varchar(100)   NULL,
        \`pincode\`          varchar(20)    NULL,
        \`date_of_birth\`    date           NULL,
        \`anniversary_date\` date           NULL,
        \`membership_tier\`  enum('silver','gold','platinum') NULL,
        \`loyalty_points\`   int            NOT NULL DEFAULT 0,
        \`wallet_balance\`   decimal(10,2)  NOT NULL DEFAULT 0,
        \`credit_limit\`     decimal(10,2)  NOT NULL DEFAULT 0,
        \`outstanding_amount\` decimal(10,2) NOT NULL DEFAULT 0,
        \`lifetime_value\`   decimal(10,2)  NOT NULL DEFAULT 0,
        \`total_visits\`     int            NOT NULL DEFAULT 0,
        \`last_visit_date\`  timestamp      NULL,
        \`favorite_items\`   json           NULL,
        \`notes\`            text           NULL,
        \`gst_number\`       varchar(50)    NULL,
        UNIQUE INDEX \`UQ_cust_email\` (\`email\`),
        PRIMARY KEY (\`id\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS \`orders\` (
        \`id\`                    varchar(36)    NOT NULL,
        \`created_at\`            timestamp(6)   NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
        \`updated_at\`            timestamp(6)   NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
        \`deleted_at\`            timestamp(6)   NULL,
        \`created_by\`            varchar(36)    NULL,
        \`updated_by\`            varchar(36)    NULL,
        \`deleted_by\`            varchar(36)    NULL,
        \`status\`                varchar(50)    NOT NULL DEFAULT 'active',
        \`is_active\`             tinyint        NOT NULL DEFAULT 1,
        \`remarks\`               text           NULL,
        \`order_number\`          varchar(50)    NOT NULL,
        \`branch_id\`             varchar(36)    NOT NULL,
        \`customer_id\`           varchar(36)    NULL,
        \`table_id\`              varchar(36)    NULL,
        \`order_type\`            enum('dine_in','take_away','delivery') NOT NULL DEFAULT 'dine_in',
        \`order_status\`          enum('pending','confirmed','preparing','ready','served','completed','cancelled') NOT NULL DEFAULT 'pending',
        \`payment_status\`        enum('pending','partial','paid','refunded') NOT NULL DEFAULT 'pending',
        \`subtotal\`              decimal(10,2)  NOT NULL DEFAULT 0,
        \`discount_amount\`       decimal(10,2)  NOT NULL DEFAULT 0,
        \`discount_percentage\`   decimal(5,2)   NOT NULL DEFAULT 0,
        \`discount_type\`         enum('percentage','fixed') NULL,
        \`discount_reason\`       varchar(255)   NULL,
        \`coupon_code\`           varchar(100)   NULL,
        \`tax_amount\`            decimal(10,2)  NOT NULL DEFAULT 0,
        \`tax_percentage\`        decimal(5,2)   NOT NULL DEFAULT 0,
        \`service_charge\`        decimal(10,2)  NOT NULL DEFAULT 0,
        \`delivery_charge\`       decimal(10,2)  NOT NULL DEFAULT 0,
        \`tips\`                  decimal(10,2)  NOT NULL DEFAULT 0,
        \`rounding_amount\`       decimal(10,2)  NOT NULL DEFAULT 0,
        \`grand_total\`           decimal(10,2)  NOT NULL DEFAULT 0,
        \`paid_amount\`           decimal(10,2)  NOT NULL DEFAULT 0,
        \`due_amount\`            decimal(10,2)  NOT NULL DEFAULT 0,
        \`number_of_guests\`      int            NOT NULL DEFAULT 1,
        \`special_instructions\`  text           NULL,
        \`cancellation_reason\`   text           NULL,
        \`waiter_id\`             varchar(36)    NULL,
        \`cashier_id\`            varchar(36)    NULL,
        \`ordered_at\`            timestamp      NULL,
        \`confirmed_at\`          timestamp      NULL,
        \`completed_at\`          timestamp      NULL,
        \`cancelled_at\`          timestamp      NULL,
        \`cashier_confirmed_at\`  timestamp      NULL,
        \`is_locked\`             tinyint        NOT NULL DEFAULT 0,
        UNIQUE INDEX \`UQ_order_number\` (\`order_number\`),
        INDEX \`IDX_order_branch\` (\`branch_id\`),
        PRIMARY KEY (\`id\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS \`order_items\` (
        \`id\`                   varchar(36)   NOT NULL,
        \`created_at\`           timestamp(6)  NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
        \`updated_at\`           timestamp(6)  NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
        \`deleted_at\`           timestamp(6)  NULL,
        \`created_by\`           varchar(36)   NULL,
        \`updated_by\`           varchar(36)   NULL,
        \`deleted_by\`           varchar(36)   NULL,
        \`status\`               varchar(50)   NOT NULL DEFAULT 'active',
        \`is_active\`            tinyint       NOT NULL DEFAULT 1,
        \`remarks\`              text          NULL,
        \`order_id\`             varchar(36)   NOT NULL,
        \`menu_item_id\`         varchar(36)   NOT NULL,
        \`item_name\`            varchar(255)  NOT NULL,
        \`price\`                decimal(10,2) NOT NULL,
        \`quantity\`             int           NOT NULL DEFAULT 1,
        \`discount_amount\`      decimal(10,2) NOT NULL DEFAULT 0,
        \`tax_amount\`           decimal(10,2) NOT NULL DEFAULT 0,
        \`total\`                decimal(10,2) NOT NULL DEFAULT 0,
        \`variants\`             json          NULL,
        \`add_ons\`              json          NULL,
        \`modifiers\`            json          NULL,
        \`special_instructions\` text          NULL,
        \`kot_id\`               varchar(36)   NULL,
        INDEX \`IDX_oi_order\` (\`order_id\`),
        PRIMARY KEY (\`id\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS \`kots\` (
        \`id\`                   varchar(36)  NOT NULL,
        \`created_at\`           timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
        \`updated_at\`           timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
        \`deleted_at\`           timestamp(6) NULL,
        \`created_by\`           varchar(36)  NULL,
        \`updated_by\`           varchar(36)  NULL,
        \`deleted_by\`           varchar(36)  NULL,
        \`status\`               varchar(50)  NOT NULL DEFAULT 'active',
        \`is_active\`            tinyint      NOT NULL DEFAULT 1,
        \`remarks\`              text         NULL,
        \`kot_number\`           varchar(50)  NOT NULL,
        \`order_id\`             varchar(36)  NOT NULL,
        \`kitchen_id\`           varchar(36)  NOT NULL,
        \`kot_status\`           enum('pending','in_progress','ready','served','cancelled') NOT NULL DEFAULT 'pending',
        \`priority\`             enum('normal','high','urgent') NOT NULL DEFAULT 'normal',
        \`items\`                json         NOT NULL,
        \`chef_id\`              varchar(36)  NULL,
        \`waiter_id\`            varchar(36)  NULL,
        \`special_instructions\` text         NULL,
        \`started_at\`           timestamp    NULL,
        \`ready_at\`             timestamp    NULL,
        \`served_at\`            timestamp    NULL,
        \`cancelled_at\`         timestamp    NULL,
        \`preparation_time\`     int          NULL,
        \`elapsed_time\`         int          NULL,
        \`is_merged\`            tinyint      NOT NULL DEFAULT 0,
        \`merged_with_kot_id\`   varchar(36)  NULL,
        \`print_count\`          int          NOT NULL DEFAULT 0,
        \`cancellation_reason\`  text         NULL,
        UNIQUE INDEX \`IDX_4aa4293123692fb7c45166c668\` (\`kot_number\`),
        PRIMARY KEY (\`id\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS \`payments\` (
        \`id\`               varchar(36)   NOT NULL,
        \`created_at\`       timestamp(6)  NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
        \`updated_at\`       timestamp(6)  NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
        \`deleted_at\`       timestamp(6)  NULL,
        \`created_by\`       varchar(36)   NULL,
        \`updated_by\`       varchar(36)   NULL,
        \`deleted_by\`       varchar(36)   NULL,
        \`status\`           varchar(50)   NOT NULL DEFAULT 'active',
        \`is_active\`        tinyint       NOT NULL DEFAULT 1,
        \`remarks\`          text          NULL,
        \`payment_number\`   varchar(50)   NOT NULL,
        \`order_id\`         varchar(36)   NOT NULL,
        \`payment_method\`   enum('cash','card','upi','wallet','credit','bank_transfer') NOT NULL,
        \`payment_gateway\`  enum('razorpay','paytm','phonepe','gpay','stripe','manual') NOT NULL DEFAULT 'manual',
        \`amount\`           decimal(10,2) NOT NULL,
        \`transaction_id\`   varchar(255)  NULL,
        \`reference_number\` varchar(255)  NULL,
        \`payment_status\`   varchar(50)   NOT NULL DEFAULT 'success',
        \`payment_date\`     timestamp     NOT NULL DEFAULT CURRENT_TIMESTAMP,
        \`notes\`            text          NULL,
        \`processed_by\`     varchar(36)   NULL,
        \`payment_mode\`     enum('cash','online','card') NOT NULL DEFAULT 'cash',
        \`is_split_payment\` tinyint       NOT NULL DEFAULT 0,
        \`payment_sequence\` int           NOT NULL DEFAULT 1,
        UNIQUE INDEX \`IDX_37f40df34aab6084881c0ceebd\` (\`payment_number\`),
        PRIMARY KEY (\`id\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS \`invoices\` (
        \`id\`               varchar(36)   NOT NULL,
        \`created_at\`       timestamp(6)  NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
        \`updated_at\`       timestamp(6)  NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
        \`deleted_at\`       timestamp(6)  NULL,
        \`created_by\`       varchar(36)   NULL,
        \`updated_by\`       varchar(36)   NULL,
        \`deleted_by\`       varchar(36)   NULL,
        \`status\`           varchar(50)   NOT NULL DEFAULT 'active',
        \`is_active\`        tinyint       NOT NULL DEFAULT 1,
        \`remarks\`          text          NULL,
        \`invoice_number\`   varchar(50)   NOT NULL,
        \`invoice_type\`     enum('invoice','credit_note','debit_note') NOT NULL DEFAULT 'invoice',
        \`order_id\`         varchar(36)   NOT NULL,
        \`customer_id\`      varchar(36)   NULL,
        \`branch_id\`        varchar(36)   NOT NULL,
        \`invoice_date\`     date          NOT NULL,
        \`subtotal\`         decimal(10,2) NOT NULL,
        \`discount_amount\`  decimal(10,2) NOT NULL DEFAULT 0,
        \`cgst_amount\`      decimal(10,2) NOT NULL DEFAULT 0,
        \`cgst_percentage\`  decimal(5,2)  NOT NULL DEFAULT 0,
        \`sgst_amount\`      decimal(10,2) NOT NULL DEFAULT 0,
        \`sgst_percentage\`  decimal(5,2)  NOT NULL DEFAULT 0,
        \`igst_amount\`      decimal(10,2) NOT NULL DEFAULT 0,
        \`igst_percentage\`  decimal(5,2)  NOT NULL DEFAULT 0,
        \`service_charge\`   decimal(10,2) NOT NULL DEFAULT 0,
        \`rounding_amount\`  decimal(10,2) NOT NULL DEFAULT 0,
        \`grand_total\`      decimal(10,2) NOT NULL,
        \`notes\`            text          NULL,
        \`pdf_path\`         varchar(255)  NULL,
        \`qr_code\`          text          NULL,
        \`generated_by\`     varchar(36)   NULL,
        \`print_count\`      int           NOT NULL DEFAULT 0,
        \`is_duplicate\`     tinyint       NOT NULL DEFAULT 0,
        UNIQUE INDEX \`IDX_d8f8d3788694e1b3f96c42c36f\` (\`invoice_number\`),
        PRIMARY KEY (\`id\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    /* ------------------------------------------------------------------ */
    /* RESERVATIONS / CUSTOMERS                                             */
    /* ------------------------------------------------------------------ */
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS \`reservations\` (
        \`id\`                  varchar(36)  NOT NULL,
        \`created_at\`          timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
        \`updated_at\`          timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
        \`deleted_at\`          timestamp(6) NULL,
        \`created_by\`          varchar(36)  NULL,
        \`updated_by\`          varchar(36)  NULL,
        \`deleted_by\`          varchar(36)  NULL,
        \`status\`              varchar(50)  NOT NULL DEFAULT 'active',
        \`is_active\`           tinyint      NOT NULL DEFAULT 1,
        \`remarks\`             text         NULL,
        \`reservation_number\`  varchar(50)  NOT NULL,
        \`branch_id\`           varchar(36)  NOT NULL,
        \`customer_id\`         varchar(36)  NULL,
        \`customer_name\`       varchar(255) NOT NULL,
        \`customer_phone\`      varchar(20)  NOT NULL,
        \`customer_email\`      varchar(255) NULL,
        \`reservation_date\`    date         NOT NULL,
        \`reservation_time\`    time         NOT NULL,
        \`party_size\`          int          NOT NULL DEFAULT 2,
        \`table_id\`            varchar(36)  NULL,
        \`reservation_status\`  enum('pending','confirmed','cancelled','completed','no_show') NOT NULL DEFAULT 'pending',
        \`special_requests\`    text         NULL,
        \`confirmed_at\`        timestamp    NULL,
        \`cancelled_at\`        timestamp    NULL,
        \`checked_in_at\`       timestamp    NULL,
        \`cancellation_reason\` text         NULL,
        UNIQUE INDEX \`UQ_res_number\` (\`reservation_number\`),
        PRIMARY KEY (\`id\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    /* ------------------------------------------------------------------ */
    /* INVENTORY / VENDORS / PURCHASE ORDERS                               */
    /* ------------------------------------------------------------------ */
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS \`vendors\` (
        \`id\`                  varchar(36)   NOT NULL,
        \`created_at\`          timestamp(6)  NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
        \`updated_at\`          timestamp(6)  NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
        \`deleted_at\`          timestamp(6)  NULL,
        \`created_by\`          varchar(36)   NULL,
        \`updated_by\`          varchar(36)   NULL,
        \`deleted_by\`          varchar(36)   NULL,
        \`status\`              varchar(50)   NOT NULL DEFAULT 'active',
        \`is_active\`           tinyint       NOT NULL DEFAULT 1,
        \`remarks\`             text          NULL,
        \`name\`                varchar(255)  NOT NULL,
        \`code\`                varchar(100)  NOT NULL,
        \`company_name\`        varchar(255)  NULL,
        \`contact_person\`      varchar(100)  NULL,
        \`email\`               varchar(255)  NULL,
        \`phone\`               varchar(20)   NOT NULL,
        \`alternate_phone\`     varchar(20)   NULL,
        \`address\`             text          NULL,
        \`city\`                varchar(100)  NULL,
        \`state\`               varchar(100)  NULL,
        \`country\`             varchar(100)  NULL,
        \`pincode\`             varchar(20)   NULL,
        \`gst_number\`          varchar(50)   NULL,
        \`pan_number\`          varchar(50)   NULL,
        \`bank_name\`           varchar(100)  NULL,
        \`bank_account_number\` varchar(50)   NULL,
        \`bank_ifsc_code\`      varchar(50)   NULL,
        \`payment_term\`        enum('cash','credit','net_7','net_15','net_30','net_60') NOT NULL DEFAULT 'cash',
        \`credit_limit\`        decimal(10,2) NOT NULL DEFAULT 0,
        \`opening_balance\`     decimal(10,2) NOT NULL DEFAULT 0,
        \`current_balance\`     decimal(10,2) NOT NULL DEFAULT 0,
        \`total_purchases\`     decimal(10,2) NOT NULL DEFAULT 0,
        \`total_payments\`      decimal(10,2) NOT NULL DEFAULT 0,
        \`rating\`              int           NULL DEFAULT 5,
        \`documents\`           json          NULL,
        \`notes\`               text          NULL,
        UNIQUE INDEX \`UQ_vendor_code\` (\`code\`),
        PRIMARY KEY (\`id\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS \`raw_materials\` (
        \`id\`               varchar(36)   NOT NULL,
        \`created_at\`       timestamp(6)  NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
        \`updated_at\`       timestamp(6)  NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
        \`deleted_at\`       timestamp(6)  NULL,
        \`created_by\`       varchar(36)   NULL,
        \`updated_by\`       varchar(36)   NULL,
        \`deleted_by\`       varchar(36)   NULL,
        \`status\`           varchar(50)   NOT NULL DEFAULT 'active',
        \`is_active\`        tinyint       NOT NULL DEFAULT 1,
        \`remarks\`          text          NULL,
        \`name\`             varchar(255)  NOT NULL,
        \`code\`             varchar(100)  NOT NULL,
        \`description\`      text          NULL,
        \`material_type\`    enum('raw_material','finished_goods','consumable') NOT NULL DEFAULT 'raw_material',
        \`category_id\`      varchar(36)   NULL,
        \`unit\`             enum('kg','gram','liter','ml','piece','dozen','packet','box') NOT NULL DEFAULT 'kg',
        \`cost_per_unit\`    decimal(10,2) NOT NULL DEFAULT 0,
        \`current_stock\`    decimal(10,2) NOT NULL DEFAULT 0,
        \`minimum_stock\`    decimal(10,2) NOT NULL DEFAULT 0,
        \`reorder_level\`    decimal(10,2) NOT NULL DEFAULT 0,
        \`maximum_stock\`    decimal(10,2) NOT NULL DEFAULT 0,
        \`preferred_vendor_id\` varchar(36) NULL,
        \`lead_time_days\`   int           NULL,
        \`shelf_life_days\`  int           NULL,
        \`storage_location\` varchar(100)  NULL,
        \`is_perishable\`    tinyint       NOT NULL DEFAULT 0,
        \`track_batch\`      tinyint       NOT NULL DEFAULT 0,
        \`track_expiry\`     tinyint       NOT NULL DEFAULT 0,
        \`image\`            varchar(255)  NULL,
        \`hsn_code\`         varchar(50)   NULL,
        \`gst_percentage\`   decimal(5,2)  NOT NULL DEFAULT 0,
        UNIQUE INDEX \`UQ_rm_code\` (\`code\`),
        PRIMARY KEY (\`id\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS \`purchase_orders\` (
        \`id\`                    varchar(36)   NOT NULL,
        \`created_at\`            timestamp(6)  NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
        \`updated_at\`            timestamp(6)  NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
        \`deleted_at\`            timestamp(6)  NULL,
        \`created_by\`            varchar(36)   NULL,
        \`updated_by\`            varchar(36)   NULL,
        \`deleted_by\`            varchar(36)   NULL,
        \`status\`                varchar(50)   NOT NULL DEFAULT 'active',
        \`is_active\`             tinyint       NOT NULL DEFAULT 1,
        \`remarks\`               text          NULL,
        \`po_number\`             varchar(50)   NOT NULL,
        \`vendor_id\`             varchar(36)   NOT NULL,
        \`branch_id\`             varchar(36)   NOT NULL,
        \`order_date\`            date          NOT NULL,
        \`expected_delivery_date\` date         NULL,
        \`po_status\`             enum('draft','pending_approval','approved','rejected','ordered','partially_received','received','cancelled') NOT NULL DEFAULT 'draft',
        \`payment_term\`          enum('cash','credit','net_7','net_15','net_30','net_60') NOT NULL DEFAULT 'net_30',
        \`subtotal\`              decimal(10,2) NOT NULL DEFAULT 0,
        \`tax_percentage\`        decimal(5,2)  NOT NULL DEFAULT 0,
        \`tax_amount\`            decimal(10,2) NOT NULL DEFAULT 0,
        \`discount_amount\`       decimal(10,2) NOT NULL DEFAULT 0,
        \`shipping_cost\`         decimal(10,2) NOT NULL DEFAULT 0,
        \`total_amount\`          decimal(10,2) NOT NULL DEFAULT 0,
        \`approved_by\`           varchar(36)   NULL,
        \`approved_at\`           timestamp     NULL,
        \`rejection_reason\`      text          NULL,
        \`notes\`                 text          NULL,
        \`delivery_address\`      varchar(255)  NULL,
        UNIQUE INDEX \`UQ_po_number\` (\`po_number\`),
        PRIMARY KEY (\`id\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS \`purchase_order_items\` (
        \`id\`               varchar(36)   NOT NULL,
        \`created_at\`       timestamp(6)  NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
        \`updated_at\`       timestamp(6)  NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
        \`deleted_at\`       timestamp(6)  NULL,
        \`created_by\`       varchar(36)   NULL,
        \`updated_by\`       varchar(36)   NULL,
        \`deleted_by\`       varchar(36)   NULL,
        \`status\`           varchar(50)   NOT NULL DEFAULT 'active',
        \`is_active\`        tinyint       NOT NULL DEFAULT 1,
        \`remarks\`          text          NULL,
        \`purchase_order_id\` varchar(36)  NOT NULL,
        \`raw_material_id\`  varchar(36)   NOT NULL,
        \`quantity\`         decimal(10,3) NOT NULL,
        \`unit\`             varchar(50)   NOT NULL DEFAULT 'kg',
        \`unit_price\`       decimal(10,2) NOT NULL,
        \`total_price\`      decimal(10,2) NOT NULL,
        \`received_quantity\` decimal(10,3) NOT NULL DEFAULT 0,
        \`notes\`            text          NULL,
        INDEX \`IDX_poi_po\` (\`purchase_order_id\`),
        PRIMARY KEY (\`id\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    /* ------------------------------------------------------------------ */
    /* RECIPES / EMPLOYEES / EXPENSES / AUDIT / SETTINGS                   */
    /* ------------------------------------------------------------------ */
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS \`recipes\` (
        \`id\`                 varchar(36)   NOT NULL,
        \`created_at\`         timestamp(6)  NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
        \`updated_at\`         timestamp(6)  NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
        \`deleted_at\`         timestamp(6)  NULL,
        \`created_by\`         varchar(36)   NULL,
        \`updated_by\`         varchar(36)   NULL,
        \`deleted_by\`         varchar(36)   NULL,
        \`status\`             varchar(50)   NOT NULL DEFAULT 'active',
        \`is_active\`          tinyint       NOT NULL DEFAULT 1,
        \`remarks\`            text          NULL,
        \`name\`               varchar(255)  NOT NULL,
        \`code\`               varchar(100)  NOT NULL,
        \`description\`        text          NULL,
        \`menu_item_id\`       varchar(36)   NOT NULL,
        \`preparation_time\`   int           NULL,
        \`cooking_time\`       int           NULL,
        \`serving_size\`       int           NOT NULL DEFAULT 1,
        \`preparation_steps\`  text          NULL,
        \`total_cost\`         decimal(10,2) NOT NULL DEFAULT 0,
        \`cost_per_serving\`   decimal(10,2) NOT NULL DEFAULT 0,
        \`version\`            int           NOT NULL DEFAULT 1,
        UNIQUE INDEX \`UQ_recipe_code\` (\`code\`),
        PRIMARY KEY (\`id\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS \`recipe_ingredients\` (
        \`id\`              varchar(36)   NOT NULL,
        \`created_at\`      timestamp(6)  NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
        \`updated_at\`      timestamp(6)  NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
        \`deleted_at\`      timestamp(6)  NULL,
        \`created_by\`      varchar(36)   NULL,
        \`updated_by\`      varchar(36)   NULL,
        \`deleted_by\`      varchar(36)   NULL,
        \`status\`          varchar(50)   NOT NULL DEFAULT 'active',
        \`is_active\`       tinyint       NOT NULL DEFAULT 1,
        \`remarks\`         text          NULL,
        \`recipe_id\`       varchar(36)   NOT NULL,
        \`raw_material_id\` varchar(36)   NOT NULL,
        \`quantity\`        decimal(10,2) NOT NULL,
        \`unit\`            varchar(50)   NOT NULL DEFAULT 'kg',
        \`cost\`            decimal(10,2) NOT NULL DEFAULT 0,
        \`sort_order\`      int           NOT NULL DEFAULT 0,
        \`preparation_notes\` text        NULL,
        INDEX \`IDX_ri_recipe\` (\`recipe_id\`),
        PRIMARY KEY (\`id\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS \`employees\` (
        \`id\`                         varchar(36)   NOT NULL,
        \`created_at\`                 timestamp(6)  NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
        \`updated_at\`                 timestamp(6)  NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
        \`deleted_at\`                 timestamp(6)  NULL,
        \`created_by\`                 varchar(36)   NULL,
        \`updated_by\`                 varchar(36)   NULL,
        \`deleted_by\`                 varchar(36)   NULL,
        \`status\`                     varchar(50)   NOT NULL DEFAULT 'active',
        \`is_active\`                  tinyint       NOT NULL DEFAULT 1,
        \`remarks\`                    text          NULL,
        \`employee_code\`              varchar(50)   NOT NULL,
        \`user_id\`                    varchar(36)   NULL,
        \`first_name\`                 varchar(100)  NOT NULL,
        \`last_name\`                  varchar(100)  NOT NULL,
        \`email\`                      varchar(255)  NULL,
        \`phone\`                      varchar(20)   NOT NULL,
        \`date_of_birth\`              date          NOT NULL,
        \`gender\`                     enum('male','female','other') NOT NULL,
        \`address\`                    text          NULL,
        \`city\`                       varchar(100)  NULL,
        \`state\`                      varchar(100)  NULL,
        \`pincode\`                    varchar(20)   NULL,
        \`branch_id\`                  varchar(36)   NOT NULL,
        \`designation\`                varchar(100)  NOT NULL,
        \`department\`                 varchar(100)  NOT NULL,
        \`employment_type\`            enum('full_time','part_time','contract','temporary') NOT NULL DEFAULT 'full_time',
        \`joining_date\`               date          NOT NULL,
        \`confirmation_date\`          date          NULL,
        \`resignation_date\`           date          NULL,
        \`relieving_date\`             date          NULL,
        \`basic_salary\`               decimal(10,2) NOT NULL,
        \`gross_salary\`               decimal(10,2) NOT NULL DEFAULT 0,
        \`pan_number\`                 varchar(50)   NULL,
        \`aadhar_number\`              varchar(50)   NULL,
        \`uan_number\`                 varchar(50)   NULL,
        \`esi_number\`                 varchar(50)   NULL,
        \`bank_name\`                  varchar(100)  NULL,
        \`bank_account_number\`        varchar(50)   NULL,
        \`bank_ifsc_code\`             varchar(50)   NULL,
        \`photo\`                      varchar(255)  NULL,
        \`documents\`                  json          NULL,
        \`emergency_contact_name\`     varchar(20)   NULL,
        \`emergency_contact_phone\`    varchar(20)   NULL,
        \`emergency_contact_relation\` varchar(100)  NULL,
        \`notes\`                      text          NULL,
        UNIQUE INDEX \`IDX_56162b5f24af743a154680684f\` (\`employee_code\`),
        PRIMARY KEY (\`id\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS \`attendances\` (
        \`id\`                varchar(36)   NOT NULL,
        \`created_at\`        timestamp(6)  NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
        \`updated_at\`        timestamp(6)  NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
        \`deleted_at\`        timestamp(6)  NULL,
        \`created_by\`        varchar(36)   NULL,
        \`updated_by\`        varchar(36)   NULL,
        \`deleted_by\`        varchar(36)   NULL,
        \`status\`            varchar(50)   NOT NULL DEFAULT 'active',
        \`is_active\`         tinyint       NOT NULL DEFAULT 1,
        \`remarks\`           text          NULL,
        \`employee_id\`       varchar(36)   NOT NULL,
        \`attendance_date\`   date          NOT NULL,
        \`attendance_status\` enum('present','absent','half_day','leave','holiday','week_off') NOT NULL DEFAULT 'present',
        \`check_in_time\`     time          NULL,
        \`check_out_time\`    time          NULL,
        \`total_hours\`       decimal(5,2)  NOT NULL DEFAULT 0,
        \`overtime_hours\`    decimal(5,2)  NOT NULL DEFAULT 0,
        \`notes\`             text          NULL,
        \`approved_by\`       varchar(36)   NULL,
        \`approved_at\`       timestamp     NULL,
        PRIMARY KEY (\`id\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS \`expenses\` (
        \`id\`                  varchar(36)   NOT NULL,
        \`created_at\`          timestamp(6)  NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
        \`updated_at\`          timestamp(6)  NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
        \`deleted_at\`          timestamp(6)  NULL,
        \`created_by\`          varchar(36)   NULL,
        \`updated_by\`          varchar(36)   NULL,
        \`deleted_by\`          varchar(36)   NULL,
        \`status\`              varchar(50)   NOT NULL DEFAULT 'active',
        \`is_active\`           tinyint       NOT NULL DEFAULT 1,
        \`remarks\`             text          NULL,
        \`expense_number\`      varchar(50)   NOT NULL,
        \`branch_id\`           varchar(36)   NOT NULL,
        \`category\`            enum('electricity','gas','rent','maintenance','marketing','petty_cash','salary','transportation','office_supplies','miscellaneous') NOT NULL,
        \`title\`               varchar(255)  NOT NULL,
        \`description\`         text          NULL,
        \`amount\`              decimal(10,2) NOT NULL,
        \`expense_date\`        date          NOT NULL,
        \`expense_status\`      enum('pending','approved','rejected','paid') NOT NULL DEFAULT 'pending',
        \`vendor_name\`         varchar(255)  NULL,
        \`bill_number\`         varchar(255)  NULL,
        \`attachment\`          varchar(255)  NULL,
        \`approved_by\`         varchar(36)   NULL,
        \`approved_at\`         timestamp     NULL,
        \`rejection_reason\`    text          NULL,
        \`is_recurring\`        tinyint       NOT NULL DEFAULT 0,
        \`recurring_frequency\` varchar(50)   NULL,
        UNIQUE INDEX \`IDX_c104942da407cb31c7e6b5b40a\` (\`expense_number\`),
        PRIMARY KEY (\`id\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS \`audit_logs\` (
        \`id\`          varchar(36)  NOT NULL,
        \`created_at\`  timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
        \`updated_at\`  timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
        \`deleted_at\`  timestamp(6) NULL,
        \`created_by\`  varchar(36)  NULL,
        \`updated_by\`  varchar(36)  NULL,
        \`deleted_by\`  varchar(36)  NULL,
        \`status\`      varchar(50)  NOT NULL DEFAULT 'active',
        \`is_active\`   tinyint      NOT NULL DEFAULT 1,
        \`remarks\`     text         NULL,
        \`user_id\`     varchar(36)  NULL,
        \`action\`      enum('create','update','delete','login','logout','payment','permission_change') NOT NULL,
        \`entity_type\` varchar(100) NOT NULL,
        \`entity_id\`   varchar(36)  NULL,
        \`old_values\`  json         NULL,
        \`new_values\`  json         NULL,
        \`ip_address\`  varchar(50)  NULL,
        \`user_agent\`  text         NULL,
        \`description\` text         NULL,
        PRIMARY KEY (\`id\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS \`settings\` (
        \`id\`            varchar(36)  NOT NULL,
        \`created_at\`    timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
        \`updated_at\`    timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
        \`deleted_at\`    timestamp(6) NULL,
        \`created_by\`    varchar(36)  NULL,
        \`updated_by\`    varchar(36)  NULL,
        \`deleted_by\`    varchar(36)  NULL,
        \`status\`        varchar(50)  NOT NULL DEFAULT 'active',
        \`is_active\`     tinyint      NOT NULL DEFAULT 1,
        \`remarks\`       text         NULL,
        \`setting_key\`   varchar(100) NOT NULL,
        \`setting_value\` text         NOT NULL,
        \`data_type\`     enum('STRING','NUMBER','BOOLEAN','JSON','DATE') NOT NULL DEFAULT 'STRING',
        \`category\`      enum('GENERAL','BUSINESS','POS','PAYMENT','TAX','NOTIFICATION','SECURITY','INTEGRATION') NOT NULL DEFAULT 'GENERAL',
        \`description\`   varchar(255) NULL,
        \`is_public\`     tinyint      NOT NULL DEFAULT 0,
        \`is_editable\`   tinyint      NOT NULL DEFAULT 1,
        \`branch_id\`     varchar(255) NULL,
        UNIQUE INDEX \`UQ_setting_key\` (\`setting_key\`),
        PRIMARY KEY (\`id\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop in reverse dependency order
    const tables = [
      'settings', 'audit_logs', 'expenses', 'attendances', 'employees',
      'recipe_ingredients', 'recipes', 'purchase_order_items', 'purchase_orders',
      'raw_materials', 'vendors', 'reservations', 'invoices', 'payments',
      'kots', 'order_items', 'orders', 'customers',
      'menu_item_kitchens', 'menu_items', 'categories',
      'tables', 'kitchens', 'branches', 'restaurants',
      'user_permissions', 'users', 'role_permissions', 'roles',
      'permissions', 'permission_groups',
    ];
    for (const t of tables) {
      await queryRunner.query(`DROP TABLE IF EXISTS \`${t}\``);
    }
  }
}
