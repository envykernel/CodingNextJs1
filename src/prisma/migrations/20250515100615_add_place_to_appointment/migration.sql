-- RenameForeignKey
ALTER TABLE "payment_application" RENAME CONSTRAINT "payment_application_invoice_line_apps_fkey" TO "payment_application_invoice_line_id_fkey";

-- RenameForeignKey
ALTER TABLE "payment_application" RENAME CONSTRAINT "payment_application_invoice_payment_applications_fkey" TO "payment_application_invoice_id_fkey";
