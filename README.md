# CineMatch


## Project Context
Developed as a team semester laboratory project

## Authors
See [AUTHORS.md](AUTHORS.md).

## License
This project is licensed under the **GNU General Public License v3.0 (GPLv3)**.
See the [LICENSE](LICENSE) file.

### Academic Use Notice
This project was created for academic evaluation.
Any reuse beyond course evaluation **must** comply with GPLv3 and must preserve attribution to the authors.

## How to Run the CineMatch App:
1) Supabase Auth setup:

A. Enable the auth

- Supabase Dashboard → Authentication → Sign In / Providers
- toggle on : "Allow new users to sign up" and "Confirm email"

- Email:
  "enable Email provider"  and enable "Secure email change",
  Minimum password length: 6
- OAuth (Google and GitHub): enable the provider(s) and add client id/secret

  B. URL Configuration
- Supabase Dashboard → Authentication → URL Configuration
- Site URL: http://localhost:5173
- Redirect URLs: "http://localhost:5173" and "http://localhost:5173/*"

  C. Notifications
- Supabase Dashboard → Authentication → Notifications
- Toggle on: "Enable notification" and "Email address changed"

D. Create the buckets
- Supabase Dashboard → Storage → Buckets → New bucket
- Create Public bucket:

i) profile-photos

ii) media

iii) assets

- settings: Enable image transformation
- Open the assets bucket, in assets bucket upload the file from the google drive: https://drive.google.com/drive/folders/16MaulQRszJYt-L9LY06s4CogI4idUkil?usp=sharing
- in sql editor paste and run the SQL code from the Google Drive file "buckets_rls.txt": https://drive.google.com/drive/folders/1PNwe-M19aUxEgglvdoVHWy2i4eczqTS9?usp=sharing
- If you get errors / policies don’t apply: follow the steps on the file "manual_adding_the_rls_policy_for_buckets.txt"

Application Setup:

Requirements: JDK 25

1.   In the `cinematch-frontend` folder, create a `.env` file and add:
- VITE_SUPABASE_URL=https://<your-project-id>.supabase.co
- VITE_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
- VITE_TMDB_API_KEY=YOUR_TMDB_API_KEY

2. In the 'demo' folder, create a `.env` file and add:
- SUPABASE_URL=jdbc:postgresql://<region>.pooler.supabase.com:5432/postgres
- SUPABASE_SERVICE_KEY=your_service_role_key_here
- SUPABASE_PASSWORD=your_database_password_here
- TMDB_API_KEY=YOUR_TMDB_API_KEY
- HUGGINGFACE_API_KEY=YOUR_HUGGINGFACE_API_KEY
- LLM.API.KEY=YOUR_OPENROUTER_API_KEY

3. Right-click on pom.xml and select “Add as Maven Project”.

4. Open: src/main/resources/application.properties:
   Find: "spring.datasource.username=postgres.pdfpnmhsvendlsgskjdk"
   replace "pdfpnmhsvendlsgskjdk" with ur <PROJECT_REF> ( its in the url: "https://supabase.com/dashboard/project/here-is-the-<PROJECT_REF>")

5. Import the .env files in Spring Boot (for IntelliJ)

    - Go to: Run → Edit Configurations…

    - Select your Spring Boot configuration (CineMatchApplication).

    - Click Modify options → Environment variables.

    - Environment variables->Click the folder icon (Browse).

    - Add the frontend .env file.

    - Press + and add the backend .env file.

    - Save.

    - apply and ok.

6. Run the backend (CineMatchApplication).

7. Open a terminal in your IDE.

8. Navigate to the frontend folder:
    - cd cinematch-frontend

9. Install dependencies:
    - npm install

10. Start the development server:
    - npm run dev

11. Open the app in your browser:
    http://localhost:5173/

12. To stop the app: \
    a)Go to the terminal and press Ctrl + C \
    b)Stop  the backend (CineMatchApplication).

## Support

If you run into any issues, contact: [bigpoly07@gmail.com](mailto:bigpoly07@gmail.com)