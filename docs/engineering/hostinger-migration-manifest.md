# GoDaddy to Hostinger migration manifest

Status: target approved; Hostinger account and temporary host not yet verified.

## Boundary

Hostinger replaces only GoDaddy paid web hosting for the legacy apex compatibility workload. Vercel continues to host `portal.apollomc.ai`; Supabase remains the data plane; Google Workspace remains email; Drive remains final custody; AWS remains private transient storage where required. Domain registration and nameserver transfer are separate decisions.

## Source evidence required before migration

- Full cPanel account backup plus independently exported document roots and databases.
- PHP version/extensions, MySQL/MariaDB version, `.htaccess`, redirects and custom error pages.
- Cron jobs, FTP accounts, SSL/SNI configuration, DNS zone, mail routing and disk-use inventory.
- Access/error logs for `/`, `/apollo/`, `/devdepot/`, `admin`, `mail` and `staging`.
- Checksums and restore test for the captured backup.

## Target record

| Field | Required value/evidence |
|---|---|
| Hostinger plan/account | Pending owner purchase/provisioning |
| Region/datacenter | Pending |
| Temporary hostname | Pending |
| PHP/runtime compatibility | Pending test |
| Database engine/version | Pending test |
| SSH/SFTP access | Pending verification |
| Backup frequency/retention | Pending verification |
| TLS/redirect policy | Pending implementation |

## Cutover gates

1. Restore files and databases on the temporary host.
2. Recreate only proved cron/redirect/runtime dependencies; do not duplicate the apex on `mail` or `staging`.
3. Pass content, form, asset, admin, redirect, TLS, header and performance parity tests.
4. Lower TTL, then change only required apex/www web records.
5. Preserve portal CNAME, MX, SPF, DKIM, DMARC and Supabase Auth callback records.
6. Monitor for 7-14 days with GoDaddy hosting frozen and immediately recoverable.
7. Cancel GoDaddy hosting only after zero unexplained callers, restore proof and owner sign-off.

## Rollback trigger

Restore the prior apex/www records when critical pages, forms, redirects or integrations fail and cannot be corrected inside the approved incident window. DNS snapshots, previous values, timestamps and validation receipts are mandatory.
