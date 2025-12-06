How to Run the CineMatch App:

1.   In the `cinematch-frontend` folder, create a `.env` file and add:
   VITE_SUPABASE_URL=https://<your-project-id>.supabase.co
   VITE_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
   VITE_TMDB_API_KEY=YOUR_TMDB_API_KEY

2. In the 'demo' folder, create a `.env` file and add:
  SUPABASE_URL=jdbc:postgresql://<region>.pooler.supabase.com:5432/postgres
  SUPABASE_SERVICE_KEY=your_service_role_key_here
  SUPABASE_PASSWORD=your_database_password_here
  TMDB_API_KEY=YOUR_TMDB_API_KEY
  HUGGINGFACE_API_KEY=YOUR_HUGGINGFACE_API_KEY

4. Import the .env files in Spring Boot (for IntelliJ)

Go to: Run → Edit Configurations…

Select your Spring Boot configuration (CineMatchApplication).

Click Modify options → Environment variables.

Environment variables->Click the folder icon (Browse).

Add the frontend .env file.

Press + and add the backend .env file.

Save.

apply and ok.

4. Run the backend (CineMatchApplication).

5. Open a terminal in your IDE.

6. Navigate to the frontend folder:
   cd cinematch-frontend

7. Install dependencies:
   npm install
   npm install  sonner

8. Start the development server:
   npm run dev

9. Open the app in your browser:
   http://localhost:5173/

10. To stop the app:
   a)Go to the terminal and press Ctrl + C
   b)Stop  the backend (CineMatchApplication).
