// ==========================================
// FastAPI Backend URL
// ==========================================

// In production (Railway), use relative URL so it works on any domain
const API_URL = window.location.origin.includes("localhost") || window.location.origin.includes("127.0.0.1")
    ? "http://127.0.0.1:8000"
    : window.location.origin;


// ==========================================
// 1. CHECK API STATUS
// ==========================================

const statusBtn = document.getElementById("statusBtn");
const statusResult = document.getElementById("statusResult");

statusBtn.addEventListener("click", async () => {

    statusResult.innerHTML = "Checking API...";

    try {

        const response = await fetch(`${API_URL}/`);

        if (!response.ok) {
            throw new Error("Server returned an error");
        }

        const data = await response.json();

        statusResult.innerHTML =
            `<span class="success">✅ ${data.message}</span>`;

    } catch (error) {

        statusResult.innerHTML =
            `<span class="error">❌ Cannot connect to FastAPI backend.</span>`;

        console.error(error);
    }
});



// ==========================================
// 2. PRESSURE CALCULATOR
// ==========================================

const calculateBtn = document.getElementById("calculateBtn");
const calculationResult = document.getElementById("calculationResult");


calculateBtn.addEventListener("click", async () => {

    const force = document.getElementById("force").value;
    const area = document.getElementById("area").value;


    // Basic frontend validation

    if (force === "" || area === "") {

        calculationResult.innerHTML =
            `<span class="error">⚠️ Please enter both force and area.</span>`;
        return;
    }

    if (Number(area) <= 0) {

        calculationResult.innerHTML =
            `<span class="error">⚠️ Area must be greater than zero.</span>`;
        return;
    }

    calculationResult.innerHTML = "Calculating...";


    try {

        const response = await fetch(
            `${API_URL}/calculate?force=${encodeURIComponent(force)}&area=${encodeURIComponent(area)}`
        );

        const data = await response.json();

        if (!response.ok) {
            throw new Error("Calculation failed");
        }

        if (data.error) {
            calculationResult.innerHTML =
                `<span class="error">❌ ${data.error}</span>`;
            return;
        }

        calculationResult.innerHTML = `
            <div><strong>Force:</strong> ${data.force} N</div>
            <div><strong>Area:</strong> ${data.area} m²</div>
            <div class="highlight-value">Pressure = ${data.pressure.toFixed(4)} Pa</div>
        `;

    } catch (error) {

        calculationResult.innerHTML =
            `<span class="error">❌ Unable to connect to backend.</span>`;
        console.error(error);
    }

});



// ==========================================
// 3. PUSH-UP TRACKER
// ==========================================

const pushupBtn = document.getElementById("pushupBtn");
const pushupResult = document.getElementById("pushupResult");


pushupBtn.addEventListener("click", async () => {

    const bodyWeight = document.getElementById("bodyWeight").value;
    const reps = document.getElementById("reps").value;
    const sets = document.getElementById("sets").value;


    // Validation

    if (bodyWeight === "" || reps === "" || sets === "") {
        pushupResult.innerHTML =
            `<span class="error">⚠️ Please fill in all fields.</span>`;
        return;
    }

    if (Number(bodyWeight) <= 0 || Number(reps) <= 0 || Number(sets) <= 0) {
        pushupResult.innerHTML =
            `<span class="error">⚠️ All values must be greater than zero.</span>`;
        return;
    }

    pushupResult.innerHTML = "Processing...";


    try {

        // Step 1: Get force calculation
        const forceResp = await fetch(
            `${API_URL}/pushup/force?body_weight_kg=${encodeURIComponent(bodyWeight)}`
        );

        const forceData = await forceResp.json();

        if (!forceResp.ok || forceData.error) {
            throw new Error(forceData.error || "Force calculation failed");
        }


        // Step 2: Log the session
        const logResp = await fetch(`${API_URL}/pushup/log`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                body_weight_kg: Number(bodyWeight),
                reps: Number(reps),
                sets: Number(sets)
            })
        });

        const logData = await logResp.json();

        if (!logResp.ok) {
            throw new Error("Failed to log session");
        }


        // Display results
        pushupResult.innerHTML = `
            <div class="success">✅ ${logData.message}</div>
            <br>
            <div><strong>Body Weight:</strong> ${forceData.body_weight_kg} kg</div>
            <div><strong>Effective Load:</strong> ${forceData.effective_load_kg} kg (69% of body weight)</div>
            <div class="highlight-value pushup-force">
                💪 Muscle Force = ${forceData.muscle_force_N} N
            </div>
            <div><strong>Reps:</strong> ${logData.reps} × <strong>Sets:</strong> ${logData.sets}</div>
            <div><strong>Total Reps:</strong> ${logData.total_reps}</div>
            <div><strong>Session ID:</strong> #${logData.session_id}</div>
        `;

    } catch (error) {

        pushupResult.innerHTML =
            `<span class="error">❌ ${error.message || "Unable to connect to backend."}</span>`;
        console.error(error);
    }

});



// ==========================================
// 4. SESSION HISTORY
// ==========================================

const sessionsBtn = document.getElementById("sessionsBtn");
const sessionsResult = document.getElementById("sessionsResult");


sessionsBtn.addEventListener("click", async () => {

    sessionsResult.innerHTML = "Loading sessions...";

    try {

        const response = await fetch(`${API_URL}/pushup/sessions`);
        const data = await response.json();

        if (!response.ok) {
            throw new Error("Failed to load sessions");
        }

        if (data.sessions.length === 0) {
            sessionsResult.innerHTML =
                `<span style="color:#888">No sessions logged yet. Use the Push-Up Tracker above!</span>`;
            return;
        }

        const rows = data.sessions.map(s => `
            <tr>
                <td>#${s.session_id}</td>
                <td>${s.body_weight_kg} kg</td>
                <td>${s.reps}</td>
                <td>${s.sets}</td>
                <td>${s.total_reps}</td>
                <td>${s.muscle_force_N} N</td>
                <td>${s.timestamp}</td>
            </tr>
        `).join("");

        sessionsResult.innerHTML = `
            <table class="sessions-table">
                <thead>
                    <tr>
                        <th>#</th>
                        <th>Weight</th>
                        <th>Reps</th>
                        <th>Sets</th>
                        <th>Total</th>
                        <th>Force</th>
                        <th>Time</th>
                    </tr>
                </thead>
                <tbody>${rows}</tbody>
            </table>
            <p style="margin-top:10px; color:#555">
                <strong>Total sessions:</strong> ${data.total_sessions}
            </p>
        `;

    } catch (error) {

        sessionsResult.innerHTML =
            `<span class="error">❌ Unable to load sessions.</span>`;
        console.error(error);
    }

});



// ==========================================
// 5. SEND MECHANICAL DATA (POST)
// ==========================================

const sendDataBtn = document.getElementById("sendDataBtn");
const dataResult = document.getElementById("dataResult");


sendDataBtn.addEventListener("click", async () => {

    const name = document.getElementById("dataName").value;
    const value = document.getElementById("dataValue").value;


    if (name === "" || value === "") {

        dataResult.innerHTML =
            `<span class="error">⚠️ Please enter both name and value.</span>`;
        return;
    }

    dataResult.innerHTML = "Sending data...";


    try {

        const response = await fetch(`${API_URL}/data`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name: name, value: Number(value) })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error("Failed to send data");
        }

        dataResult.innerHTML = `
            <div class="success">✅ ${data.message}</div>
            <br>
            <div><strong>Name:</strong> ${data.name}</div>
            <div><strong>Value:</strong> ${data.value}</div>
        `;

    } catch (error) {

        dataResult.innerHTML =
            `<span class="error">❌ Unable to connect to backend.</span>`;
        console.error(error);
    }

});
