@echo off
echo Running database seed file...
echo This will DROP and RECREATE all tables!
echo.
pause

psql "postgresql://datingappdbuser:8hxy^5*8L0cn$Qtl@database-1.c2duwikoqsqr.us-east-1.rds.amazonaws.com:5432/postgres" -f db/seed.sql

echo.
echo Done!
pause
