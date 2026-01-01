/*
 * CineMatch
 * Copyright (C) 2025 <Make a Wish team>
 * Authors: see AUTHORS.md
 * SPDX-License-Identifier: GPL-3.0-only
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, version 3.
 *
 * This program is distributed WITHOUT ANY WARRANTY.
 * See the GNU General Public License for more details.
 *
 * If not, see <https://www.gnu.org/licenses/>.
 */// generate_embeddings.js
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import http from 'http';
import 'dotenv/config';
import puppeteer from 'puppeteer';

// --- CONFIG ---
const TMDB_API_KEY = process.env.VITE_TMDB_API_KEY;
const TOTAL_PAGES = 100;
const OUTPUT_FILE = "actors_db_face.json";
const MODEL_PATH = "./public/models";
const SERVER_PORT = 8765;


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function fetchActors() {
    console.log(`Fetching top ${TOTAL_PAGES * 20} actors from TMDB...\n`);
    let allActors = [];

    for (let page = 1; page <= TOTAL_PAGES; page++) {
        try {
            const url = `https://api.themoviedb.org/3/person/popular?api_key=${TMDB_API_KEY}&language=en-US&page=${page}`;
            const res = await fetch(url);

            if (!res.ok) {
                console.warn(`\nWarning: Failed to fetch page ${page} (${res.status})`);
                continue;
            }

            const data = await res.json();
            const validActors = (data.results || []).filter(person =>
                person.known_for_department === "Acting" &&
                person.profile_path &&
                !person.adult
            );

            allActors.push(...validActors);
            process.stdout.write(`\rPage ${page}/${TOTAL_PAGES} | Total actors: ${allActors.length}`);

            await sleep(100);
        } catch (error) {
            console.error(`\nError fetching page ${page}:`, error.message);
        }
    }

    const uniqueActors = Array.from(
        new Map(allActors.map(actor => [actor.id, actor])).values()
    );

    console.log(`\n\nTotal unique actors fetched: ${uniqueActors.length}\n`);
    return uniqueActors;
}

function startModelServer() {
    const server = http.createServer((req, res) => {
        // Enable CORS
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', '*');

        if (req.method === 'OPTIONS') {
            res.writeHead(200);
            res.end();
            return;
        }

        if (req.url === '/') {
            // Serve HTML page
            const htmlContent = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <script src="https://cdn.jsdelivr.net/npm/@tensorflow/tfjs@4.11.0"></script>
    <script src="https://cdn.jsdelivr.net/npm/@vladmandic/face-api@1.7.12/dist/face-api.js"></script>
</head>
<body>
    <canvas id="canvas"></canvas>
    <img id="image" crossorigin="anonymous" style="display:none;">
    
    <script>
        let modelsLoaded = false;
        
        async function loadModels() {
            if (modelsLoaded) return;
            
            console.log('Loading models in browser...');
            await faceapi.nets.ssdMobilenetv1.loadFromUri('/models');
            await faceapi.nets.faceLandmark68Net.loadFromUri('/models');
            await faceapi.nets.faceRecognitionNet.loadFromUri('/models');
            modelsLoaded = true;
            console.log('Models loaded successfully');
        }
        
        async function detectFace(imageUrl) {
            const img = document.getElementById('image');
            
            return new Promise((resolve) => {
                img.onload = async () => {
                    try {
                        const detection = await faceapi
                            .detectSingleFace(img)
                            .withFaceLandmarks()
                            .withFaceDescriptor();
                        
                        if (detection && detection.descriptor) {
                            resolve(Array.from(detection.descriptor));
                        } else {
                            resolve(null);
                        }
                    } catch (error) {
                        resolve(null);
                    }
                };
                
                img.onerror = () => resolve(null);
                img.src = imageUrl;
            });
        }
        
        window.loadModels = loadModels;
        window.detectFace = detectFace;
    </script>
</body>
</html>`;
            res.writeHead(200, { 'Content-Type': 'text/html' });
            res.end(htmlContent);
        } else if (req.url.startsWith('/models/')) {
            // Serve model files
            const fileName = req.url.replace('/models/', '');
            const filePath = path.join(__dirname, MODEL_PATH, fileName);

            if (fs.existsSync(filePath)) {
                const contentType = fileName.endsWith('.json')
                    ? 'application/json'
                    : 'application/octet-stream';

                res.writeHead(200, { 'Content-Type': contentType });
                const fileStream = fs.createReadStream(filePath);
                fileStream.pipe(res);
            } else {
                res.writeHead(404);
                res.end('Not found');
            }
        } else {
            res.writeHead(404);
            res.end('Not found');
        }
    });

    return new Promise((resolve) => {
        server.listen(SERVER_PORT, () => {
            console.log(`Local server started at http://localhost:${SERVER_PORT}`);
            resolve(server);
        });
    });
}

async function setupBrowser() {
    console.log("Launching browser...");
    const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();

    // Navigate to local server
    await page.goto(`http://localhost:${SERVER_PORT}`);

    // Wait for face-api to load
    await page.waitForFunction(() => typeof window.faceapi !== 'undefined');

    // Load models
    console.log("Loading AI models in browser...");
    await page.evaluate(() => window.loadModels());
    console.log("✓ All models loaded successfully!\n");

    return { browser, page };
}

async function generateEmbeddings(actors, page) {
    console.log("Starting face recognition analysis...\n");

    const database = [];
    const startTime = Date.now();
    let skipped = 0;

    for (let i = 0; i < actors.length; i++) {
        const actor = actors[i];
        const imageUrl = `https://image.tmdb.org/t/p/w200${actor.profile_path}`;

        try {
            const embedding = await page.evaluate((url) => {
                return window.detectFace(url);
            }, imageUrl);

            if (embedding) {
                database.push({
                    id: actor.id,
                    name: actor.name,
                    gender: actor.gender,
                    popularity: actor.popularity,
                    profile_path: actor.profile_path,
                    embedding: embedding
                });
            } else {
                skipped++;
            }

            if ((i + 1) % 10 === 0 || i === actors.length - 1) {
                const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
                const rate = ((i + 1) / parseFloat(elapsed)).toFixed(1);
                process.stdout.write(
                    `\rProcessed: ${i + 1}/${actors.length} | ` +
                    `Faces found: ${database.length} | ` +
                    `Skipped: ${skipped} | ` +
                    `Time: ${elapsed}s (${rate}/s)`
                );
            }

        } catch (error) {
            skipped++;
        }
    }

    console.log("\n");
    return database;
}

function saveDatabase(database) {
    console.log("Saving database...");

    const outputPath = path.resolve(__dirname, OUTPUT_FILE);
    fs.writeFileSync(outputPath, JSON.stringify(database, null, 2));

    console.log(`\n✓ SUCCESS! Saved ${database.length} actors with face embeddings`);
    console.log(`✓ Output file: ${outputPath}`);

    if (database.length > 0) {
        const avgPopularity = (database.reduce((sum, a) => sum + a.popularity, 0) / database.length).toFixed(2);
        console.log(`✓ Average popularity: ${avgPopularity}`);
        console.log(`✓ Embedding dimensions: ${database[0].embedding.length}`);
    }
}

async function main() {
    let browser = null;
    let server = null;

    try {
        console.log("=".repeat(60));
        console.log("TMDB Actor Face Embeddings Generator (Browser Mode)");
        console.log("=".repeat(60) + "\n");

        if (!TMDB_API_KEY) {
            throw new Error("TMDB API key not found. Set VITE_TMDB_API_KEY in .env file");
        }

        // Start local server
        server = await startModelServer();

        // Fetch actors
        const actors = await fetchActors();

        if (actors.length === 0) {
            throw new Error("No actors fetched from TMDB");
        }

        // Setup browser with face-api
        const { browser: br, page } = await setupBrowser();
        browser = br;

        // Generate embeddings
        const database = await generateEmbeddings(actors, page);

        if (database.length === 0) {
            throw new Error("No face embeddings generated");
        }

        // Save to file
        saveDatabase(database);

        console.log("\n" + "=".repeat(60));
        console.log("Process completed successfully!");
        console.log("=".repeat(60));

    } catch (error) {
        console.error("\n" + "=".repeat(60));
        console.error("ERROR:", error.message);
        console.error("=".repeat(60));
        console.error(error);
        process.exit(1);
    } finally {
        if (browser) {
            await browser.close();
        }
        if (server) {
            server.close();
        }
    }
}

main();