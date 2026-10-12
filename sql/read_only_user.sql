-- Run this on the MySQL/MariaDB server that hosts osTicket (or, ideally,
-- on a REPLICA of it — see README "Reporting replica" section).
--
-- Creates an account that can only ever run SELECT statements against the
-- `helpdesk` database (osTicket's database). It cannot INSERT/UPDATE/DELETE/DROP
-- or touch any other database, so the dashboard can never modify or damage osTicket.

CREATE USER 'helpdesk_dash_ro'@'%' IDENTIFIED BY 'change-me-strong-password';

GRANT SELECT ON helpdesk.* TO 'helpdesk_dash_ro'@'%';

-- Optional hardening: restrict the account to only connect from the
-- dashboard server's IP instead of '%', e.g.:
-- CREATE USER 'helpdesk_dash_ro'@'10.10.20.15' IDENTIFIED BY '...';
-- GRANT SELECT ON helpdesk.* TO 'helpdesk_dash_ro'@'10.10.20.15';

FLUSH PRIVILEGES;

-- Sanity check (run as this user): should succeed
-- USE helpdesk;
-- SELECT COUNT(*) FROM ost_ticket;
-- Sanity check: should fail with "command denied"
-- DELETE FROM ost_ticket LIMIT 1;
