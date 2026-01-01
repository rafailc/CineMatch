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
 */import { useLocation } from "react-router-dom";
import Navigation from "./components/Navigation";
import App from "./App";

export default function AppWrapper() {
    const location = useLocation();

    const hideNav = location.pathname === "/login";

    return (
        <>
            {!hideNav && <Navigation />}
            <App />
        </>
    );
}