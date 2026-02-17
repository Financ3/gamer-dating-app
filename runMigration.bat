@echo off
echo ============================================
echo  Password Reset Migration Script
echo ============================================
echo.
echo This will add the following columns to the users table:
echo   - reset_token (TEXT)
echo   - reset_token_expiry (BIGINT)
echo.
echo Your existing data will NOT be deleted.
echo.
pause

echo Running migration...
echo.

psql "postgresql://datingappdbuser:8hxy^5*8L0cn$Qtl@database-1.c2duwikoqsqr.us-east-1.rds.amazonaws.com:5432/postgres" -f db/migrations/001_add_password_reset_columns.sql

echo.
echo ============================================
echo Migration complete!
echo ============================================
pause
