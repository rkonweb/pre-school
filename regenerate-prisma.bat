@echo off
echo Stopping dev server and regenerating Prisma client...
echo.
echo Please follow these steps:
echo.
echo 1. Stop your dev server (Ctrl+C in the terminal running npm run dev)
echo 2. Run this command: npx prisma generate
echo 3. Start the dev server again: npm run dev
echo 4. Visit: http://localhost:3000/admin/curriculum/architect
echo.
echo This will regenerate the Prisma client with the new AcademicMonth and AcademicDay models.
echo.
pause
