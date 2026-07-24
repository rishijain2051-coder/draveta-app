-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('ADMIN', 'B2B', 'AFFILIATE');

-- CreateEnum
CREATE TYPE "UserStatus" AS ENUM ('ACTIVE', 'SUSPENDED');

-- CreateEnum
CREATE TYPE "ProductStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "BusinessType" AS ENUM ('HOTEL', 'CAFE', 'RESTAURANT', 'RETAILER', 'WHOLESALER', 'DISTRIBUTOR', 'INTERIOR_DESIGNER', 'ARCHITECT', 'OTHER');

-- CreateEnum
CREATE TYPE "ApplicationStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'SUSPENDED');

-- CreateEnum
CREATE TYPE "AccountTier" AS ENUM ('RETAILER', 'DISTRIBUTOR', 'HOTEL_CAFE', 'CUSTOM');

-- CreateEnum
CREATE TYPE "OrderStatus" AS ENUM ('SUBMITTED', 'ACKNOWLEDGED', 'INVOICED', 'FULFILLED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "Platform" AS ENUM ('AMAZON', 'ETSY');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'PAID');

-- CreateEnum
CREATE TYPE "ContentType" AS ENUM ('TEXT', 'IMAGE', 'URL');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" "UserRole" NOT NULL DEFAULT 'B2B',
    "status" "UserStatus" NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "categories" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "image_url" TEXT,
    "display_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "products" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "specs" JSONB,
    "category_id" TEXT NOT NULL,
    "base_price" DECIMAL(10,2) NOT NULL,
    "amazon_url" TEXT,
    "etsy_url" TEXT,
    "meta_title" TEXT,
    "meta_description" TEXT,
    "og_image" TEXT,
    "status" "ProductStatus" NOT NULL DEFAULT 'DRAFT',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "products_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "product_images" (
    "id" TEXT NOT NULL,
    "product_id" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "alt_text" TEXT,
    "display_order" INTEGER NOT NULL DEFAULT 0,
    "is_primary" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "product_images_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "product_variants" (
    "id" TEXT NOT NULL,
    "product_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "sku" TEXT NOT NULL,
    "price_modifier" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "specs" JSONB,

    CONSTRAINT "product_variants_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "b2b_applications" (
    "id" TEXT NOT NULL,
    "company_name" TEXT NOT NULL,
    "business_type" "BusinessType" NOT NULL,
    "gst_number" TEXT,
    "year_established" INTEGER,
    "website_url" TEXT,
    "contact_name" TEXT NOT NULL,
    "contact_designation" TEXT,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "categories_interested" JSONB,
    "estimated_volume" TEXT,
    "current_suppliers" TEXT,
    "heard_about" TEXT,
    "delivery_city" TEXT,
    "delivery_state" TEXT,
    "order_frequency" TEXT,
    "gst_certificate_url" TEXT,
    "status" "ApplicationStatus" NOT NULL DEFAULT 'PENDING',
    "reviewed_by_id" TEXT,
    "reviewed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "b2b_applications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "b2b_accounts" (
    "id" TEXT NOT NULL,
    "application_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "tier" "AccountTier" NOT NULL DEFAULT 'RETAILER',
    "discount_percentage" DECIMAL(5,2) NOT NULL DEFAULT 0,
    "status" "UserStatus" NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "b2b_accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "b2b_tier_pricing" (
    "id" TEXT NOT NULL,
    "product_id" TEXT NOT NULL,
    "tier" "AccountTier" NOT NULL,
    "min_qty" INTEGER NOT NULL,
    "max_qty" INTEGER,
    "unit_price" DECIMAL(10,2) NOT NULL,

    CONSTRAINT "b2b_tier_pricing_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "order_requests" (
    "id" TEXT NOT NULL,
    "b2b_account_id" TEXT NOT NULL,
    "status" "OrderStatus" NOT NULL DEFAULT 'SUBMITTED',
    "items" JSONB NOT NULL,
    "total" DECIMAL(12,2) NOT NULL,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "order_requests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "b2b_notes" (
    "id" TEXT NOT NULL,
    "application_id" TEXT NOT NULL,
    "author_id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "b2b_notes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "affiliate_applications" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "social_url" TEXT,
    "audience_size" TEXT,
    "status" "ApplicationStatus" NOT NULL DEFAULT 'PENDING',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "affiliate_applications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "affiliate_profiles" (
    "id" TEXT NOT NULL,
    "application_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "unique_code" TEXT NOT NULL,
    "discount_percent" DECIMAL(5,2) NOT NULL DEFAULT 5,
    "commission_percent" DECIMAL(5,2) NOT NULL DEFAULT 2,
    "status" "UserStatus" NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "affiliate_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "affiliate_sales_logs" (
    "id" TEXT NOT NULL,
    "affiliate_id" TEXT NOT NULL,
    "period" TEXT NOT NULL,
    "platform" "Platform" NOT NULL,
    "redemption_count" INTEGER NOT NULL DEFAULT 0,
    "revenue" DECIMAL(12,2) NOT NULL,
    "commission_owed" DECIMAL(12,2) NOT NULL,
    "payment_status" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "paid_at" TIMESTAMP(3),
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "affiliate_sales_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "content_blocks" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "type" "ContentType" NOT NULL DEFAULT 'TEXT',
    "updated_by_id" TEXT,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "content_blocks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "seo_defaults" (
    "id" TEXT NOT NULL,
    "title_template" TEXT NOT NULL,
    "meta_description" TEXT NOT NULL,
    "og_image" TEXT,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "seo_defaults_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "seo_overrides" (
    "id" TEXT NOT NULL,
    "page_path" TEXT NOT NULL,
    "meta_title" TEXT,
    "meta_description" TEXT,
    "og_image" TEXT,

    CONSTRAINT "seo_overrides_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "marketplace_clicks" (
    "id" TEXT NOT NULL,
    "product_id" TEXT NOT NULL,
    "platform" "Platform" NOT NULL,
    "country" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "marketplace_clicks_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "categories_slug_key" ON "categories"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "products_slug_key" ON "products"("slug");

-- CreateIndex
CREATE INDEX "products_category_id_idx" ON "products"("category_id");

-- CreateIndex
CREATE INDEX "products_status_idx" ON "products"("status");

-- CreateIndex
CREATE INDEX "product_images_product_id_idx" ON "product_images"("product_id");

-- CreateIndex
CREATE UNIQUE INDEX "product_variants_sku_key" ON "product_variants"("sku");

-- CreateIndex
CREATE INDEX "product_variants_product_id_idx" ON "product_variants"("product_id");

-- CreateIndex
CREATE INDEX "b2b_applications_status_idx" ON "b2b_applications"("status");

-- CreateIndex
CREATE UNIQUE INDEX "b2b_accounts_application_id_key" ON "b2b_accounts"("application_id");

-- CreateIndex
CREATE UNIQUE INDEX "b2b_accounts_user_id_key" ON "b2b_accounts"("user_id");

-- CreateIndex
CREATE INDEX "b2b_tier_pricing_product_id_idx" ON "b2b_tier_pricing"("product_id");

-- CreateIndex
CREATE UNIQUE INDEX "b2b_tier_pricing_product_id_tier_min_qty_key" ON "b2b_tier_pricing"("product_id", "tier", "min_qty");

-- CreateIndex
CREATE INDEX "order_requests_b2b_account_id_idx" ON "order_requests"("b2b_account_id");

-- CreateIndex
CREATE INDEX "order_requests_status_idx" ON "order_requests"("status");

-- CreateIndex
CREATE INDEX "b2b_notes_application_id_idx" ON "b2b_notes"("application_id");

-- CreateIndex
CREATE INDEX "affiliate_applications_status_idx" ON "affiliate_applications"("status");

-- CreateIndex
CREATE UNIQUE INDEX "affiliate_profiles_application_id_key" ON "affiliate_profiles"("application_id");

-- CreateIndex
CREATE UNIQUE INDEX "affiliate_profiles_user_id_key" ON "affiliate_profiles"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "affiliate_profiles_unique_code_key" ON "affiliate_profiles"("unique_code");

-- CreateIndex
CREATE INDEX "affiliate_sales_logs_affiliate_id_idx" ON "affiliate_sales_logs"("affiliate_id");

-- CreateIndex
CREATE UNIQUE INDEX "content_blocks_key_key" ON "content_blocks"("key");

-- CreateIndex
CREATE UNIQUE INDEX "seo_overrides_page_path_key" ON "seo_overrides"("page_path");

-- CreateIndex
CREATE INDEX "marketplace_clicks_product_id_idx" ON "marketplace_clicks"("product_id");

-- CreateIndex
CREATE INDEX "marketplace_clicks_created_at_idx" ON "marketplace_clicks"("created_at");

-- AddForeignKey
ALTER TABLE "products" ADD CONSTRAINT "products_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_images" ADD CONSTRAINT "product_images_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_variants" ADD CONSTRAINT "product_variants_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "b2b_applications" ADD CONSTRAINT "b2b_applications_reviewed_by_id_fkey" FOREIGN KEY ("reviewed_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "b2b_accounts" ADD CONSTRAINT "b2b_accounts_application_id_fkey" FOREIGN KEY ("application_id") REFERENCES "b2b_applications"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "b2b_accounts" ADD CONSTRAINT "b2b_accounts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "b2b_tier_pricing" ADD CONSTRAINT "b2b_tier_pricing_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_requests" ADD CONSTRAINT "order_requests_b2b_account_id_fkey" FOREIGN KEY ("b2b_account_id") REFERENCES "b2b_accounts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "b2b_notes" ADD CONSTRAINT "b2b_notes_application_id_fkey" FOREIGN KEY ("application_id") REFERENCES "b2b_applications"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "b2b_notes" ADD CONSTRAINT "b2b_notes_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "affiliate_profiles" ADD CONSTRAINT "affiliate_profiles_application_id_fkey" FOREIGN KEY ("application_id") REFERENCES "affiliate_applications"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "affiliate_profiles" ADD CONSTRAINT "affiliate_profiles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "affiliate_sales_logs" ADD CONSTRAINT "affiliate_sales_logs_affiliate_id_fkey" FOREIGN KEY ("affiliate_id") REFERENCES "affiliate_profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "content_blocks" ADD CONSTRAINT "content_blocks_updated_by_id_fkey" FOREIGN KEY ("updated_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
