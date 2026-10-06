const STORAGE_KEY = "hanamagond_owner_reports";

const SETTINGS_KEY = "hanamagond_owner_settings";

const DEFAULT_SOIL_PAUSE = 20;

const DEFAULT_MATERIAL_PAUSE = 10;

const MAX_DAYS = 8;

const soilButton = document.getElementById("soilButton");

const materialButton = document.getElementById("materialButton");

const soilSection = document.getElementById("soilSection");

const materialSection = document.getElementById("materialSection");

const driverNameInput = document.getElementById("driverName");

const currentDate = document.getElementById("currentDate");

const currentCountCard = document.getElementById("currentCountCard");

const currentTotal = document.getElementById("currentTotal");

const currentSelection = document.getElementById("currentSelection");

const soilTotal = document.getElementById("soilTotal");

const materialTotal = document.getElementById("materialTotal");

const grandTotal = document.getElementById("grandTotal");

const pauseMessage = document.getElementById("pauseMessage");

const pauseTimer = document.getElementById("pauseTimer");

const liveReportContent =
    document.getElementById("liveReportContent");

const shareButton =
    document.getElementById("shareButton");

const sharePreviousButton =
    document.getElementById("sharePreviousButton");

const newSessionButton =
    document.getElementById("newSessionButton");

const backButton =
    document.getElementById("backButton");

const reportDate =
    document.getElementById("reportDate");

const previousReport =
    document.getElementById("previousReport");

const countOptions =
    document.querySelectorAll(".count-option");

const sessionStart =
    document.getElementById("sessionStart");

const sessionEnd =
    document.getElementById("sessionEnd");

const sessionDuration =
    document.getElementById("sessionDuration");

const lastGap =
    document.getElementById("lastGap");

const settingsButton =
    document.getElementById("settingsButton");

const settingsBox =
    document.getElementById("settingsBox");

const soilPauseInput =
    document.getElementById("soilPauseInput");

const materialPauseInput =
    document.getElementById("materialPauseInput");

const saveSettingsButton =
    document.getElementById("saveSettings");

let selectedMode = "";

let lockUntil = 0;

let lockInterval = null;

let settings = getSettings();

let session = {

    date: getDateKey(new Date()),

    driver: "",

    loads: [],

    startTime: null,

    endTime: null

};


/* =========================
   SETTINGS
========================= */

function getSettings() {

    try {

        const saved =
            localStorage.getItem(SETTINGS_KEY);

        if (!saved) {

            return {

                soilPause: DEFAULT_SOIL_PAUSE,

                materialPause: DEFAULT_MATERIAL_PAUSE

            };

        }

        return {

            soilPause:
                Number(JSON.parse(saved).soilPause) ||
                DEFAULT_SOIL_PAUSE,

            materialPause:
                Number(JSON.parse(saved).materialPause) ||
                DEFAULT_MATERIAL_PAUSE

        };

    } catch {

        return {

            soilPause: DEFAULT_SOIL_PAUSE,

            materialPause: DEFAULT_MATERIAL_PAUSE

        };

    }

}


function saveSettings() {

    let soil =
        Number(soilPauseInput.value);

    let material =
        Number(materialPauseInput.value);

    if (!soil || soil < 1) {

        soil = DEFAULT_SOIL_PAUSE;

    }

    if (!material || material < 1) {

        material = DEFAULT_MATERIAL_PAUSE;

    }

    settings = {

        soilPause: soil,

        materialPause: material

    };

    localStorage.setItem(

        SETTINGS_KEY,

        JSON.stringify(settings)

    );

    soilPauseInput.value = soil;

    materialPauseInput.value = material;

    alert(
        `Settings saved!\nSoil: ${soil} sec\nMaterial: ${material} sec`
    );

}


soilPauseInput.value = settings.soilPause;

materialPauseInput.value = settings.materialPause;


settingsButton.addEventListener("click", function () {

    settingsBox.classList.toggle("hidden");

});


saveSettingsButton.addEventListener(
    "click",
    saveSettings
);


/* =========================
   DATE / TIME
========================= */

function pad(number) {

    return String(number).padStart(2, "0");

}


function getDateKey(date) {

    return (

        date.getFullYear() +

        "-" +

        pad(date.getMonth() + 1) +

        "-" +

        pad(date.getDate())

    );

}


function formatDate(date) {

    return date.toLocaleDateString(
        "en-IN",
        {
            day: "2-digit",
            month: "short",
            year: "numeric"
        }
    );

}


function formatTime(date) {

    return date.toLocaleTimeString(
        "en-IN",
        {
            hour: "numeric",
            minute: "2-digit",
            second: "2-digit",
            hour12: true
        }
    );

}


function updateCurrentDate() {

    const now = new Date();

    currentDate.textContent =
        formatDate(now) +
        " • " +
        formatTime(now);

}


updateCurrentDate();

setInterval(
    updateCurrentDate,
    1000
);


/* =========================
   LOAD TYPE
========================= */

soilButton.addEventListener(
    "click",
    function () {

        selectedMode = "soil";

        soilButton.classList.add("selected");

        materialButton.classList.remove("selected");

        soilSection.classList.remove("hidden");

        materialSection.classList.add("hidden");

        currentCountCard.classList.remove("hidden");

        currentSelection.textContent =
            "Selected: SOIL";

        updateButtonStates();

    }
);


materialButton.addEventListener(
    "click",
    function () {

        selectedMode = "material";

        materialButton.classList.add("selected");

        soilButton.classList.remove("selected");

        materialSection.classList.remove("hidden");

        soilSection.classList.add("hidden");

        currentCountCard.classList.remove("hidden");

        currentSelection.textContent =
            "Selected: MATERIAL";

        updateButtonStates();

    }
);


/* =========================
   COUNT BUTTONS
========================= */

countOptions.forEach(function (button) {

    button.addEventListener(
        "click",
        function () {

            if (isLocked()) {

                return;

            }

            const type =
                button.dataset.type;

            const name =
                button.dataset.name;

            if (selectedMode !== type) {

                return;

            }

            addLoad(type, name);

            if (type === "soil") {

                startLock(
                    settings.soilPause * 1000
                );

            } else {

                startLock(
                    settings.materialPause * 1000
                );

            }

        }
    );

});


/* =========================
   ADD LOAD
========================= */

function addLoad(type, name) {

    const now = new Date();

    const previousLoad =
        session.loads[
            session.loads.length - 1
        ];

    let gap = "—";

    if (previousLoad) {

        gap =
            calculateDifference(
                new Date(previousLoad.startTime),
                now
            );

    }

    if (!session.startTime) {

        session.startTime =
            now.toISOString();

        session.driver =
            driverNameInput.value.trim();

    }

    session.driver =
        driverNameInput.value.trim();

    const load = {

        number:
            session.loads.length + 1,

        type:
            type,

        name:
            name,

        startTime:
            now.toISOString(),

        endTime:
            now.toISOString(),

        gap:
            gap

    };

    session.loads.push(load);

    session.endTime =
        now.toISOString();

    saveCurrentReport();

    renderCurrentSession();

}


/* =========================
   LOCK
========================= */

function startLock(duration) {

    lockUntil =
        Date.now() + duration;

    countOptions.forEach(
        function (button) {

            button.disabled = true;

            const pauseText =
                button.querySelector(".pause-text");

            if (pauseText) {

                pauseText.textContent = "WAIT...";

            }

        }
    );

    pauseMessage.classList.remove("hidden");

    updatePauseTimer();

    clearInterval(lockInterval);

    lockInterval =
        setInterval(
            updatePauseTimer,
            1000
        );

}


function updatePauseTimer() {

    const remaining =
        lockUntil - Date.now();

    if (remaining <= 0) {

        clearInterval(lockInterval);

        lockUntil = 0;

        countOptions.forEach(
            function (button) {

                button.disabled = false;

                const pauseText =
                    button.querySelector(".pause-text");

                if (pauseText) {

                    pauseText.textContent = "READY";

                }

            }
        );

        pauseMessage.classList.add("hidden");

        updateButtonStates();

        return;

    }

    const seconds =
        Math.ceil(remaining / 1000);

    pauseTimer.textContent =
        "00:" +
        pad(seconds);

}


function isLocked() {

    if (Date.now() < lockUntil) {

        updatePauseTimer();

        return true;

    }

    return false;

}


function updateButtonStates() {

    if (isLocked()) {

        countOptions.forEach(
            button => button.disabled = true
        );

        return;

    }

    countOptions.forEach(
        function (button) {

            button.disabled =
                button.dataset.type !== selectedMode;

        }
    );

}


/* =========================
   DIFFERENCE
========================= */

function calculateDifference(start, end) {

    const milliseconds =
        end.getTime() -
        start.getTime();

    const totalSeconds =
        Math.floor(milliseconds / 1000);

    if (totalSeconds < 60) {

        return totalSeconds + " sec";

    }

    const totalMinutes =
        Math.floor(totalSeconds / 60);

    const hours =
        Math.floor(totalMinutes / 60);

    const minutes =
        totalMinutes % 60;

    if (hours > 0) {

        if (minutes > 0) {

            return (
                hours +
                " hr " +
                minutes +
                " min"
            );

        }

        return hours + " hr";

    }

    return minutes + " min";

}


/* =========================
   TOTALS
========================= */

function getTypeTotal(type) {

    return session.loads.filter(
        load => load.type === type
    ).length;

}


function getItemLoads(type, name) {

    return session.loads.filter(
        load =>
            load.type === type &&
            load.name === name
    );

}


/* =========================
   RENDER
========================= */

function updateOptionCounts() {

    countOptions.forEach(
        function (button) {

            const type =
                button.dataset.type;

            const name =
                button.dataset.name;

            const count =
                getItemLoads(type, name).length;

            const countElement =
                button.querySelector(".load-count");

            if (countElement) {

                countElement.textContent =
                    count +
                    (count === 1
                        ? " Load"
                        : " Loads");

            }

        }
    );

}


function renderCurrentSession() {

    const soilCount =
        getTypeTotal("soil");

    const materialCount =
        getTypeTotal("material");

    const total =
        session.loads.length;

    soilTotal.textContent =
        soilCount;

    materialTotal.textContent =
        materialCount;

    grandTotal.textContent =
        total;

    currentTotal.textContent =
        total;

    updateOptionCounts();

    if (session.startTime) {

        sessionStart.textContent =
            formatTime(
                new Date(session.startTime)
            );

    } else {

        sessionStart.textContent = "—";

    }

    if (session.endTime) {

        sessionEnd.textContent =
            formatTime(
                new Date(session.endTime)
            );

    } else {

        sessionEnd.textContent = "—";

    }

    if (session.startTime) {

        const end =
            session.endTime
                ? new Date(session.endTime)
                : new Date();

        sessionDuration.textContent =
            calculateDifference(
                new Date(session.startTime),
                end
            );

    } else {

        sessionDuration.textContent = "—";

    }

    if (session.loads.length) {

        lastGap.textContent =
            session.loads[
                session.loads.length - 1
            ].gap;

    } else {

        lastGap.textContent = "—";

    }

    renderLiveReport();

}


/* =========================
   LIVE REPORT
========================= */

function renderLiveReport() {

    if (session.loads.length === 0) {

        liveReportContent.innerHTML =
            `<div class="no-loads">
                No loads recorded yet.
            </div>`;

        return;

    }

    let html = "";

    html += `

        <div class="report-header-box">

            <div>
                <strong>Date:</strong>

                ${formatDate(
                    new Date(
                        session.date + "T00:00:00"
                    )
                )}
            </div>

            <div>
                <strong>Driver:</strong>

                ${escapeHtml(
                    session.driver || "Not entered"
                )}
            </div>

            <div>
                <strong>Soil Loads:</strong>

                ${getTypeTotal("soil")}
            </div>

            <div>
                <strong>Material Loads:</strong>

                ${getTypeTotal("material")}
            </div>

            <div>
                <strong>Total Loads:</strong>

                ${session.loads.length}
            </div>

        </div>

    `;

    html += `

        <div class="report-category">

            <div class="report-category-title">

                🚜 SOIL LOADS

            </div>

    `;

    const soilButtons =
        document.querySelectorAll(
            '.count-option[data-type="soil"]'
        );

    let hasSoil = false;

    soilButtons.forEach(
        function (button) {

            const name =
                button.dataset.name;

            const loads =
                getItemLoads("soil", name);

            if (loads.length === 0) {

                return;

            }

            hasSoil = true;

            html += `

                <div class="report-item">

                    <div class="report-item-title">

                        🚜 ${escapeHtml(name)}

                    </div>

                    <div class="report-item-count">

                        ${loads.length}
                        ${loads.length === 1
                            ? "Load"
                            : "Loads"}

                    </div>

                    ${createLoadTable(loads)}

                </div>

            `;

        }
    );

    if (!hasSoil) {

        html += `

            <div class="no-loads">

                No soil loads.

            </div>

        `;

    }

    html += `</div>`;

    html += `

        <div class="report-category">

            <div class="report-category-title">

                🏗️ MATERIAL LOADS

            </div>

    `;

    const materialButtons =
        document.querySelectorAll(
            '.count-option[data-type="material"]'
        );

    let hasMaterial = false;

    materialButtons.forEach(
        function (button) {

            const name =
                button.dataset.name;

            const loads =
                getItemLoads(
                    "material",
                    name
                );

            if (loads.length === 0) {

                return;

            }

            hasMaterial = true;

            html += `

                <div class="report-item">

                    <div class="report-item-title">

                        🏗️ ${escapeHtml(name)}

                    </div>

                    <div class="report-item-count">

                        ${loads.length}
                        ${loads.length === 1
                            ? "Load"
                            : "Loads"}

                    </div>

                    ${createLoadTable(loads)}

                </div>

            `;

        }
    );

    if (!hasMaterial) {

        html += `

            <div class="no-loads">

                No material loads.

            </div>

        `;

    }

    html += `</div>`;

    html += `

        <div class="report-header-box">

            <div>

                <strong>Session Start:</strong>

                ${
                    session.startTime
                        ? formatTime(
                            new Date(
                                session.startTime
                            )
                        )
                        : "—"
                }

            </div>

            <div>

                <strong>Session End:</strong>

                ${
                    session.endTime
                        ? formatTime(
                            new Date(
                                session.endTime
                            )
                        )
                        : "—"
                }

            </div>

            <div>

                <strong>Duration:</strong>

                ${
                    session.startTime
                        ? calculateDifference(
                            new Date(
                                session.startTime
                            ),
                            session.endTime
                                ? new Date(
                                    session.endTime
                                )
                                : new Date()
                        )
                        : "—"
                }

            </div>

        </div>

    `;

    liveReportContent.innerHTML =
        html;

}


/* =========================
   LOAD TABLE
========================= */

function createLoadTable(loads) {

    let html = `

        <table class="load-table">

            <thead>

                <tr>

                    <th>Load</th>

                    <th>Time</th>

                    <th>Gap</th>

                </tr>

            </thead>

            <tbody>

    `;

    loads.forEach(
        function (load, index) {

            html += `

                <tr>

                    <td>
                        Load ${index + 1}
                    </td>

                    <td>

                        ${formatTime(
                            new Date(
                                load.startTime
                            )
                        )}

                    </td>

                    <td>

                        ${escapeHtml(load.gap)}

                    </td>

                </tr>

            `;

        }
    );

    html += `

            </tbody>

        </table>

    `;

    return html;

}


/* =========================
   STORAGE
========================= */

function getReports() {

    try {

        const data =
            localStorage.getItem(
                STORAGE_KEY
            );

        if (!data) {

            return {};

        }

        return JSON.parse(data);

    } catch {

        return {};

    }

}


function saveReports(reports) {

    localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(reports)
    );

}


function saveCurrentReport() {

    if (session.loads.length === 0) {

        return;

    }

    const reports =
        getReports();

    reports[session.date] = {

        date:
            session.date,

        driver:
            session.driver,

        loads:
            session.loads,

        startTime:
            session.startTime,

        endTime:
            session.endTime

    };

    removeOldReports(reports);

    saveReports(reports);

}


/* =========================
   OLD REPORTS
========================= */

function removeOldReports(reports) {

    const today =
        new Date();

    Object.keys(reports).forEach(
        function (dateKey) {

            const reportDate =
                new Date(
                    dateKey +
                    "T00:00:00"
                );

            const difference =
                today.getTime() -
                reportDate.getTime();

            const days =
                Math.floor(
                    difference / 86400000
                );

            if (
                days >= MAX_DAYS ||
                days < 0
            ) {

                delete reports[dateKey];

            }

        }
    );

}


/* =========================
   PREVIOUS REPORT
========================= */

reportDate.addEventListener(
    "change",
    function () {

        const selectedDate =
            reportDate.value;

        if (!selectedDate) {

            previousReport.innerHTML =
                "Select a date to view the complete report.";

            return;

        }

        showPreviousReport(selectedDate);

    }
);


function showPreviousReport(dateKey) {

    const reports =
        getReports();

    const report =
        reports[dateKey];

    if (!report) {

        previousReport.innerHTML = `

            <div class="report-header-box">

                <strong>No Report</strong>

                <br>

                No report is available for
                ${formatDate(
                    new Date(
                        dateKey +
                        "T00:00:00"
                    )
                )}.

            </div>

        `;

        return;

    }

    const soilLoads =
        report.loads.filter(
            load => load.type === "soil"
        );

    const materialLoads =
        report.loads.filter(
            load => load.type === "material"
        );

    let html = `

        <div class="report-header-box">

            <div>

                <strong>Date:</strong>

                ${formatDate(
                    new Date(
                        dateKey +
                        "T00:00:00"
                    )
                )}

            </div>

            <div>

                <strong>Driver:</strong>

                ${escapeHtml(
                    report.driver ||
                    "Not entered"
                )}

            </div>

            <div>

                <strong>Soil Loads:</strong>

                ${soilLoads.length}

            </div>

            <div>

                <strong>Material Loads:</strong>

                ${materialLoads.length}

            </div>

            <div>

                <strong>Total Loads:</strong>

                ${report.loads.length}

            </div>

        </div>

    `;

    html += `

        <div class="report-category">

            <div class="report-category-title">

                🚜 SOIL LOADS

            </div>

    `;

    const soilNames =
        [
            ...new Set(
                soilLoads.map(
                    load => load.name
                )
            )
        ];

    if (soilNames.length === 0) {

        html += `

            <div class="no-loads">

                No soil loads.

            </div>

        `;

    }

    soilNames.forEach(
        function (name) {

            const loads =
                soilLoads.filter(
                    load =>
                        load.name === name
                );

            html += `

                <div class="report-item">

                    <div class="report-item-title">

                        🚜 ${escapeHtml(name)}

                    </div>

                    <div class="report-item-count">

                        ${loads.length} Loads

                    </div>

                    ${createLoadTable(loads)}

                </div>

            `;

        }
    );

    html += `</div>`;

    html += `

        <div class="report-category">

            <div class="report-category-title">

                🏗️ MATERIAL LOADS

            </div>

    `;

    const materialNames =
        [
            ...new Set(
                materialLoads.map(
                    load => load.name
                )
            )
        ];

    if (materialNames.length === 0) {

        html += `

            <div class="no-loads">

                No material loads.

            </div>

        `;

    }

    materialNames.forEach(
        function (name) {

            const loads =
                materialLoads.filter(
                    load =>
                        load.name === name
                );

            html += `

                <div class="report-item">

                    <div class="report-item-title">

                        🏗️ ${escapeHtml(name)}

                    </div>

                    <div class="report-item-count">

                        ${loads.length} Loads

                    </div>

                    ${createLoadTable(loads)}

                </div>

            `;

        }
    );

    html += `</div>`;

    html += `

        <div class="report-header-box">

            <div>

                <strong>Session Start:</strong>

                ${
                    report.startTime
                        ? formatTime(
                            new Date(
                                report.startTime
                            )
                        )
                        : "—"
                }

            </div>

            <div>

                <strong>Session End:</strong>

                ${
                    report.endTime
                        ? formatTime(
                            new Date(
                                report.endTime
                            )
                        )
                        : "—"
                }

            </div>

            <div>

                <strong>Duration:</strong>

                ${
                    report.startTime &&
                    report.endTime
                        ? calculateDifference(
                            new Date(
                                report.startTime
                            ),
                            new Date(
                                report.endTime
                            )
                        )
                        : "—"
                }

            </div>

        </div>

    `;

    previousReport.innerHTML =
        html;

}


/* =========================
   SHARE PDF
========================= */

async function generateReportPDF(report) {

    if (typeof html2canvas === "undefined") {

        alert(
            "Report image library is not loaded."
        );

        return null;

    }

    if (
        typeof window.jspdf === "undefined" ||
        typeof window.jspdf.jsPDF === "undefined"
    ) {

        alert(
            "PDF library is not loaded."
        );

        return null;

    }

    const { jsPDF } = window.jspdf;

    const element =
        document.createElement("div");

    element.style.width = "700px";

    element.style.padding = "30px";

    element.style.background = "white";

    element.style.color = "#222";

    element.style.fontFamily =
        "Arial, sans-serif";


    const soilLoads =
        report.loads.filter(
            load => load.type === "soil"
        );

    const materialLoads =
        report.loads.filter(
            load => load.type === "material"
        );


    function createPDFTable(loads) {

        let html = `

            <table style="
                width:100%;
                border-collapse:collapse;
                background:white;
                margin-top:10px;
            ">

                <thead>

                    <tr>

                        <th style="
                            border:1px solid #ddd;
                            padding:8px;
                            text-align:left;
                        ">
                            Load
                        </th>

                        <th style="
                            border:1px solid #ddd;
                            padding:8px;
                            text-align:left;
                        ">
                            Time
                        </th>

                        <th style="
                            border:1px solid #ddd;
                            padding:8px;
                            text-align:left;
                        ">
                            Gap
                        </th>

                    </tr>

                </thead>

                <tbody>

        `;

        loads.forEach(
            function (load, index) {

                html += `

                    <tr>

                        <td style="
                            border:1px solid #ddd;
                            padding:8px;
                        ">
                            Load ${index + 1}
                        </td>

                        <td style="
                            border:1px solid #ddd;
                            padding:8px;
                        ">
                            ${formatTime(
                                new Date(
                                    load.startTime
                                )
                            )}
                        </td>

                        <td style="
                            border:1px solid #ddd;
                            padding:8px;
                        ">
                            ${escapeHtml(load.gap)}
                        </td>

                    </tr>

                `;

            }
        );

        html += `

                </tbody>

            </table>

        `;

        return html;

    }


    function createCategory(title, loads) {

        let html = `

            <div style="
                border:1px solid #ddd;
                border-radius:10px;
                padding:15px;
                margin-bottom:15px;
            ">

                <h2>${title}</h2>

        `;

        const names =
            [
                ...new Set(
                    loads.map(
                        load => load.name
                    )
                )
            ];


        if (names.length === 0) {

            html += `

                <p style="color:#777;">

                    No loads.

                </p>

            `;

        }


        names.forEach(
            function (name) {

                const itemLoads =
                    loads.filter(
                        load =>
                            load.name === name
                    );


                html += `

                    <div style="
                        background:#f6f8fa;
                        border-radius:10px;
                        padding:12px;
                        margin-bottom:10px;
                    ">

                        <strong style="font-size:18px;">

                            ${escapeHtml(name)}

                        </strong>

                        <div style="
                            margin:5px 0 10px;
                            font-weight:bold;
                        ">

                            ${itemLoads.length}

                            ${
                                itemLoads.length === 1
                                    ? "Load"
                                    : "Loads"
                            }

                        </div>

                        ${createPDFTable(itemLoads)}

                    </div>

                `;

            }
        );


        html += `</div>`;

        return html;

    }


    element.innerHTML = `

        <div style="
            text-align:center;
            margin-bottom:25px;
        ">

            <div style="
                font-size:28px;
                font-weight:bold;
            ">

                👨‍🌾 HANAMAGOND

            </div>


            <div style="
                font-size:22px;
                font-weight:bold;
                margin-top:5px;
            ">

                OWNER LOAD REPORT

            </div>


            <div style="
                margin-top:8px;
                color:#666;
            ">

                Complete Load Report

            </div>

        </div>


        <div style="
            border:1px solid #ddd;
            border-radius:10px;
            padding:15px;
            margin-bottom:15px;
        ">

            <p>

                <strong>Date:</strong>

                ${formatDate(
                    new Date(
                        report.date +
                        "T00:00:00"
                    )
                )}

            </p>


            <p>

                <strong>Driver:</strong>

                ${escapeHtml(
                    report.driver ||
                    "Not entered"
                )}

            </p>


            <p>

                <strong>Soil Loads:</strong>

                ${soilLoads.length}

            </p>


            <p>

                <strong>Material Loads:</strong>

                ${materialLoads.length}

            </p>


            <p>

                <strong>Total Loads:</strong>

                ${report.loads.length}

            </p>

        </div>


        ${createCategory(
            "🚜 SOIL LOADS",
            soilLoads
        )}


        ${createCategory(
            "🏗️ MATERIAL LOADS",
            materialLoads
        )}


        <div style="
            border:1px solid #ddd;
            border-radius:10px;
            padding:15px;
        ">

            <p>

                <strong>Session Start:</strong>

                ${
                    report.startTime
                        ? formatTime(
                            new Date(
                                report.startTime
                            )
                        )
                        : "—"
                }

            </p>


            <p>

                <strong>Session End:</strong>

                ${
                    report.endTime
                        ? formatTime(
                            new Date(
                                report.endTime
                            )
                        )
                        : "—"
                }

            </p>


            <p>

                <strong>Duration:</strong>

                ${
                    report.startTime &&
                    report.endTime
                        ? calculateDifference(
                            new Date(
                                report.startTime
                            ),
                            new Date(
                                report.endTime
                            )
                        )
                        : "—"
                }

            </p>

        </div>


        <div style="
            text-align:center;
            margin-top:25px;
            color:#777;
        ">

            @2026 • HANAMAGOND OWNER

        </div>

    `;


    document.body.appendChild(element);


    try {

        element.style.position = "fixed";

        element.style.left = "-10000px";

        element.style.top = "0";


        await new Promise(
            resolve => {

                requestAnimationFrame(
                    () => {

                        requestAnimationFrame(
                            resolve
                        );

                    }
                );

            }
        );


        const canvas =
            await html2canvas(
                element,
                {
                    backgroundColor: "#ffffff",
                    scale: 2,
                    useCORS: true,
                    logging: false
                }
            );


        const imgData =
            canvas.toDataURL("image/png");


        const pdf =
            new jsPDF({
                orientation: "portrait",
                unit: "mm",
                format: "a4"
            });


        const pageWidth =
            pdf.internal.pageSize.getWidth();

        const pageHeight =
            pdf.internal.pageSize.getHeight();

        const margin = 10;

        const usableWidth =
            pageWidth -
            (margin * 2);

        const imgWidth =
            usableWidth;

        const imgHeight =
            (canvas.height * imgWidth) /
            canvas.width;

        let heightLeft =
            imgHeight;

        let position =
            margin;


        pdf.addImage(
            imgData,
            "PNG",
            margin,
            position,
            imgWidth,
            imgHeight
        );


        heightLeft -=
            pageHeight -
            (margin * 2);


        while (heightLeft > 0) {

            position =
                margin -
                (
                    imgHeight -
                    heightLeft
                );


            pdf.addPage();


            pdf.addImage(
                imgData,
                "PNG",
                margin,
                position,
                imgWidth,
                imgHeight
            );


            heightLeft -=
                pageHeight -
                (margin * 2);

        }


        return pdf;

    } finally {

        element.remove();

    }

}


/* =========================
   SHARE PDF
========================= */

async function shareReportAsPDF(report) {

    try {

        const pdf =
            await generateReportPDF(report);

        if (!pdf) {

            return;

        }


        const fileName =
            "Hanamagond-Owner-Report-" +
            report.date +
            ".pdf";


        const pdfBlob =
            pdf.output("blob");


        const file =
            new File(
                [pdfBlob],
                fileName,
                {
                    type: "application/pdf"
                }
            );


        if (
            navigator.share &&
            navigator.canShare &&
            navigator.canShare({
                files: [file]
            })
        ) {

            await navigator.share({

                title:
                    "Hanamagond Owner Report",

                text:
                    "Complete Owner Load Report",

                files: [file]

            });

            return;

        }


        const url =
            URL.createObjectURL(
                pdfBlob
            );


        const link =
            document.createElement("a");


        link.href = url;


        link.download =
            fileName;


        document.body.appendChild(link);


        link.click();


        link.remove();


        setTimeout(
            function () {

                URL.revokeObjectURL(url);

            },
            1000
        );


        alert(
            "Owner Report PDF saved successfully."
        );

    } catch (error) {

        console.error(
            "Owner PDF error:",
            error
        );


        if (
            error.name !==
            "AbortError"
        ) {

            alert(
                "Unable to create the Owner report PDF."
            );

        }

    }

}


/* =========================
   SHARE CURRENT
========================= */

shareButton.addEventListener(
    "click",
    async function () {

        if (session.loads.length === 0) {

            alert(
                "No loads to share yet."
            );

            return;

        }

        await shareReportAsPDF(session);

    }
);


/* =========================
   SHARE PREVIOUS
========================= */

sharePreviousButton.addEventListener(
    "click",
    async function () {

        const selectedDate =
            reportDate.value;

        if (!selectedDate) {

            alert(
                "Please select a date first."
            );

            return;

        }

        const reports =
            getReports();

        const report =
            reports[selectedDate];

        if (!report) {

            alert(
                "No report available for this date."
            );

            return;

        }

        await shareReportAsPDF(report);

    }
);


/* =========================
   NEW SESSION
========================= */

newSessionButton.addEventListener(
    "click",
    function () {

        if (session.loads.length > 0) {

            saveCurrentReport();

        }

        const confirmed =
            confirm(
                "Start a new Owner session?"
            );

        if (!confirmed) {

            return;

        }

        clearInterval(lockInterval);

        lockUntil = 0;

        countOptions.forEach(
            function (button) {

                button.disabled = false;

                const pauseText =
                    button.querySelector(
                        ".pause-text"
                    );

                if (pauseText) {

                    pauseText.textContent =
                        "READY";

                }

            }
        );

        pauseMessage.classList.add(
            "hidden"
        );

        session = {

            date:
                getDateKey(
                    new Date()
                ),

            driver:
                "",

            loads:
                [],

            startTime:
                null,

            endTime:
                null

        };

        selectedMode = "";

        soilButton.classList.remove(
            "selected"
        );

        materialButton.classList.remove(
            "selected"
        );

        soilSection.classList.add(
            "hidden"
        );

        materialSection.classList.add(
            "hidden"
        );

        currentCountCard.classList.add(
            "hidden"
        );

        currentSelection.textContent =
            "—";

        driverNameInput.value = "";

        updateOptionCounts();

        renderCurrentSession();

        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });

    }
);


/* =========================
   BACK
========================= */

backButton.addEventListener(
    "click",
    function () {

        window.location.href =
            "main.html";

    }
);


/* =========================
   DATE PICKER
========================= */

function setupDatePicker() {

    const today =
        new Date();

    const oldest =
        new Date();

    oldest.setDate(
        today.getDate() - 7
    );

    reportDate.max =
        getDateKey(today);

    reportDate.min =
        getDateKey(oldest);

}


/* =========================
   CLEAN DATA
========================= */

function cleanOldData() {

    const reports =
        getReports();

    removeOldReports(reports);

    saveReports(reports);

}


/* =========================
   ESCAPE
========================= */

function escapeHtml(value) {

    return String(value)

        .replaceAll(
            "&",
            "&amp;"
        )

        .replaceAll(
            "<",
            "&lt;"
        )

        .replaceAll(
            ">",
            "&gt;"
        )

        .replaceAll(
            '"',
            "&quot;"
        )

        .replaceAll(
            "'",
            "&#039;"
        );

}


/* =========================
   START
========================= */

setupDatePicker();

cleanOldData();

renderCurrentSession();

updateButtonStates();