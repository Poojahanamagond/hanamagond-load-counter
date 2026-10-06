
/* =========================================
   HANAMAGOND TRACTOR LOAD COUNTER
   OFFLINE VERSION
   NO FIREBASE
   ========================================= */

const STORAGE_KEY = "hanamagond_tractor_reports";
const MAX_DAYS = 8;
const LOCK_TIME = 4 * 60 * 1000;


/* =========================================
   ELEMENTS
   ========================================= */

const tractorOptions =
    document.querySelectorAll(".tractor-option");

const selectedTractorText =
    document.getElementById("selectedTractor");

const driverNameInput =
    document.getElementById("driverName");

const countButton =
    document.getElementById("countButton");

const totalLoads =
    document.getElementById("totalLoads");

const startTimeElement =
    document.getElementById("startTime");

const endTimeElement =
    document.getElementById("endTime");

const durationElement =
    document.getElementById("duration");

const currentDate =
    document.getElementById("currentDate");

const emptyMessage =
    document.getElementById("emptyMessage");

const historyContainer =
    document.getElementById("historyContainer");

const historyList =
    document.getElementById("historyList");

const shareButton =
    document.getElementById("shareButton");

const newSessionButton =
    document.getElementById("newSessionButton");

const reportDate =
    document.getElementById("reportDate");

const previousReport =
    document.getElementById("previousReport");

const lockMessage =
    document.getElementById("lockMessage");

const lockTimer =
    document.getElementById("lockTimer");

const sharePreviousButton =
    document.getElementById("sharePreviousButton");


/* =========================================
   CURRENT SESSION
   ========================================= */

let selectedTractor = "";
let lockUntil = 0;
let lockInterval = null;

let session = {
    date: getDateKey(new Date()),
    tractor: "",
    driver: "",
    loads: [],
    startTime: null,
    endTime: null
};


/* =========================================
   DATE / TIME
   ========================================= */

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
            hour12: true
        }
    );

}


function updateCurrentDate() {

    currentDate.textContent =
        formatDate(new Date()) +
        " • " +
        formatTime(new Date());

}


setInterval(
    updateCurrentDate,
    1000
);


/* =========================================
   TRACTOR SELECTION
   ========================================= */

tractorOptions.forEach(
    function (button) {

        button.addEventListener(
            "click",
            function () {

                if (button.disabled) {
                    return;
                }

                tractorOptions.forEach(
                    function (item) {

                        item.classList.remove(
                            "selected"
                        );

                        item.disabled = true;

                    }
                );

                button.classList.add(
                    "selected"
                );

                selectedTractor =
                    button.dataset.tractor;

                selectedTractorText.textContent =
                    "Selected: " +
                    selectedTractor;

            }
        );

    }
);


/* =========================================
   COUNT LOAD
   ========================================= */

countButton.addEventListener(
    "click",
    function () {

        if (isLocked()) {
            return;
        }


        if (!selectedTractor) {

            alert(
                "Please select a tractor first."
            );

            return;
        }


        const now = new Date();

        const driver =
            driverNameInput.value.trim();


        /*
         FIRST CLICK
         Starts Load 1.
        */

        if (session.loads.length === 0) {

            session.tractor =
                selectedTractor;

            session.driver =
                driver;

            session.startTime =
                now.toISOString();

        }


        /*
         NEXT CLICK
         Ends previous load.
         Then starts next load.
        */

        const previousLoad =
            session.loads[
                session.loads.length - 1
            ];


        if (previousLoad) {

            previousLoad.endTime =
                now.toISOString();

            previousLoad.duration =
                calculateDifference(
                    new Date(
                        previousLoad.startTime
                    ),
                    now
                );

        }


        const newLoad = {

            number:
                session.loads.length + 1,

            startTime:
                now.toISOString(),

            endTime:
                null,

            gap:
                previousLoad
                    ? calculateDifference(
                        new Date(
                            previousLoad.startTime
                        ),
                        now
                    )
                    : "—"

        };


        session.loads.push(
            newLoad
        );


        session.endTime =
            now.toISOString();


        saveCurrentReport();

        renderCurrentSession();


        /*
         LOCK FOR 4 MINUTES
        */

        startFourMinuteLock();

    }
);


/* =========================================
   FOUR MINUTE LOCK
   ========================================= */

function startFourMinuteLock() {

    lockUntil =
        Date.now() +
        LOCK_TIME;


    countButton.disabled = true;


    lockMessage.classList.remove(
        "hidden"
    );


    updateLockTimer();


    clearInterval(
        lockInterval
    );


    lockInterval =
        setInterval(
            updateLockTimer,
            1000
        );

}


function updateLockTimer() {

    const remaining =
        lockUntil -
        Date.now();


    if (remaining <= 0) {

        clearInterval(
            lockInterval
        );

        countButton.disabled =
            false;

        lockMessage.classList.add(
            "hidden"
        );

        return;
    }


    const totalSeconds =
        Math.ceil(
            remaining / 1000
        );


    const minutes =
        Math.floor(
            totalSeconds / 60
        );


    const seconds =
        totalSeconds % 60;


    lockTimer.textContent =
        pad(minutes) +
        ":" +
        pad(seconds);

}


function isLocked() {

    if (
        Date.now() <
        lockUntil
    ) {

        updateLockTimer();

        return true;

    }

    return false;

}


/* =========================================
   DIFFERENCE
   ========================================= */

function calculateDifference(
    start,
    end
) {

    const milliseconds =
        end.getTime() -
        start.getTime();


    const totalMinutes =
        Math.floor(
            milliseconds / 60000
        );


    if (totalMinutes < 1) {
        return "0 min";
    }


    const hours =
        Math.floor(
            totalMinutes / 60
        );


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

        return (
            hours +
            " hr"
        );

    }


    return (
        minutes +
        " min"
    );

}


/* =========================================
   RENDER CURRENT SESSION
   ========================================= */

function renderCurrentSession() {

    totalLoads.textContent =
        session.loads.length;


    if (session.startTime) {

        startTimeElement.textContent =
            formatTime(
                new Date(
                    session.startTime
                )
            );

    } else {

        startTimeElement.textContent =
            "—";

    }


    if (session.endTime) {

        endTimeElement.textContent =
            formatTime(
                new Date(
                    session.endTime
                )
            );

    } else {

        endTimeElement.textContent =
            "—";

    }


    if (
        session.startTime &&
        session.endTime
    ) {

        durationElement.textContent =
            calculateDifference(
                new Date(
                    session.startTime
                ),
                new Date(
                    session.endTime
                )
            );

    } else {

        durationElement.textContent =
            "—";

    }


    renderHistory();

}


/* =========================================
   HISTORY
   ========================================= */

function renderHistory() {

    if (session.loads.length === 0) {

        emptyMessage.classList.remove(
            "hidden"
        );

        historyContainer.classList.add(
            "hidden"
        );

        return;
    }


    emptyMessage.classList.add(
        "hidden"
    );

    historyContainer.classList.remove(
        "hidden"
    );


    historyList.innerHTML = "";


    session.loads.forEach(
        function (load) {

            const row =
                document.createElement(
                    "div"
                );


            row.className =
                "history-row";


            const start =
                new Date(
                    load.startTime
                );


            const end =
                load.endTime
                    ? new Date(
                        load.endTime
                    )
                    : null;


            let timeText;


            if (end) {

                timeText =
                    formatTime(start) +
                    " - " +
                    formatTime(end);

            } else {

                timeText =
                    formatTime(start) +
                    " - Running";

            }


            row.innerHTML = `

                <span class="load-number">
                    #${load.number}
                </span>

                <span class="load-time">
                    ${timeText}
                </span>

                <span class="load-gap">
                    ${load.gap}
                </span>

            `;


            historyList.appendChild(
                row
            );

        }
    );

}


/* =========================================
   LOCAL STORAGE
   ========================================= */

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

    } catch (error) {

        console.error(
            "Unable to read reports:",
            error
        );

        return {};

    }

}


function saveReports(reports) {

    localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(reports)
    );

}


/* =========================================
   SAVE CURRENT REPORT
   ========================================= */

function saveCurrentReport() {

    if (session.loads.length === 0) {
        return;
    }


    const reports =
        getReports();


    reports[session.date] = {

        date:
            session.date,

        tractor:
            session.tractor,

        driver:
            session.driver,

        loads:
            session.loads,

        startTime:
            session.startTime,

        endTime:
            session.endTime

    };


    removeOldReports(
        reports
    );


    saveReports(
        reports
    );

}


/* =========================================
   REMOVE OLD REPORTS
   ========================================= */

function removeOldReports(reports) {

    const today =
        new Date();


    Object.keys(reports)
        .forEach(
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
                        difference /
                        86400000
                    );


                if (
                    days >= MAX_DAYS ||
                    days < 0
                ) {

                    delete reports[
                        dateKey
                    ];

                }

            }
        );

}


/* =========================================
   ESCAPE HTML
   ========================================= */

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


/* =========================================
   PDF REPORT GENERATOR
   ========================================= */

function createPDFReport(report) {
    const reportElement = document.createElement("div");

    reportElement.className = "png-report";
    reportElement.style.width = "700px";
    reportElement.style.boxSizing = "border-box";
    reportElement.style.background = "#ffffff";
    reportElement.style.color = "#111111";
    reportElement.style.padding = "30px";
    reportElement.style.fontFamily = "Arial, Helvetica, sans-serif";

    let historyHTML = "";

    report.loads.forEach(function (load) {
        const start = new Date(load.startTime);
        const end = load.endTime ? new Date(load.endTime) : null;

        const timeText = end
            ? formatTime(start) + " - " + formatTime(end)
            : formatTime(start) + " - Running";

        historyHTML += `
            <div style="
                display:grid;
                grid-template-columns:100px 1fr 100px;
                padding:12px 10px;
                border-bottom:1px solid #dddddd;
                font-size:16px;
                align-items:center;
            ">
                <div><strong>#${load.number}</strong></div>
                <div>${timeText}</div>
                <div>${escapeHtml(load.gap)}</div>
            </div>
        `;
    });

    const duration =
        report.startTime && report.endTime
            ? calculateDifference(
                new Date(report.startTime),
                new Date(report.endTime)
            )
            : "—";

    reportElement.innerHTML = `
        <div style="
            text-align:center;
            padding-bottom:25px;
            border-bottom:3px solid #111111;
            margin-bottom:20px;
        ">
            <div style="font-size:30px;font-weight:800;">
                🚜 HANAMAGOND
            </div>

            <div style="font-size:24px;font-weight:700;margin-top:5px;">
                TRACTOR LOAD REPORT
            </div>

            <div style="font-size:16px;margin-top:8px;color:#555555;">
                Complete Load Report
            </div>
        </div>

        <div style="
            border:1px solid #cccccc;
            border-radius:10px;
            margin-bottom:18px;
            overflow:hidden;
            background:#ffffff;
        ">
            <div style="display:flex;justify-content:space-between;padding:14px 16px;border-bottom:1px solid #eeeeee;font-size:17px;">
                <strong>Date</strong>
                <span>${formatDate(new Date(report.date + "T00:00:00"))}</span>
            </div>

            <div style="display:flex;justify-content:space-between;padding:14px 16px;border-bottom:1px solid #eeeeee;font-size:17px;">
                <strong>Tractor</strong>
                <span>${escapeHtml(report.tractor)}</span>
            </div>

            <div style="display:flex;justify-content:space-between;padding:14px 16px;border-bottom:1px solid #eeeeee;font-size:17px;">
                <strong>Driver</strong>
                <span>${escapeHtml(report.driver || "Not entered")}</span>
            </div>

            <div style="display:flex;justify-content:space-between;padding:14px 16px;font-size:17px;">
                <strong>Total Loads</strong>
                <strong>${report.loads.length}</strong>
            </div>
        </div>

        <div style="
            border:1px solid #cccccc;
            border-radius:10px;
            margin-bottom:18px;
            overflow:hidden;
            background:#ffffff;
        ">
            <div style="
                padding:15px 16px;
                font-size:18px;
                font-weight:800;
                border-bottom:2px solid #111111;
            ">
                LOAD HISTORY
            </div>

            <div style="
                display:grid;
                grid-template-columns:100px 1fr 100px;
                padding:12px 10px;
                background:#f3f3f3;
                font-size:15px;
                font-weight:800;
            ">
                <div>LOAD</div>
                <div>TIME</div>
                <div>GAP</div>
            </div>

            ${historyHTML}
        </div>

        <div style="
            border:1px solid #cccccc;
            border-radius:10px;
            margin-bottom:20px;
            overflow:hidden;
            background:#ffffff;
        ">
            <div style="display:flex;justify-content:space-between;padding:14px 16px;border-bottom:1px solid #eeeeee;font-size:17px;">
                <strong>Session Start</strong>
                <span>${report.startTime ? formatTime(new Date(report.startTime)) : "—"}</span>
            </div>

            <div style="display:flex;justify-content:space-between;padding:14px 16px;border-bottom:1px solid #eeeeee;font-size:17px;">
                <strong>Session End</strong>
                <span>${report.endTime ? formatTime(new Date(report.endTime)) : "—"}</span>
            </div>

            <div style="display:flex;justify-content:space-between;padding:14px 16px;font-size:17px;">
                <strong>Duration</strong>
                <span>${duration}</span>
            </div>
        </div>

        <div style="
            text-align:center;
            padding-top:10px;
            font-size:14px;
            color:#555555;
        ">
            @2026 • HANAMAGOND
        </div>
    `;

    reportElement.style.position = "fixed";
    reportElement.style.left = "0";
    reportElement.style.top = "0";
    reportElement.style.zIndex = "-9999";
    reportElement.style.visibility = "hidden";
    reportElement.style.opacity = "1";

    document.body.appendChild(reportElement);

    return reportElement;
}
/* =========================================
   CONVERT REPORT TO MULTI-PAGE PDF
   ========================================= */

async function generateReportPDF(report) {

    if (typeof html2canvas === "undefined") {
        throw new Error("html2canvas library is not loaded.");
    }

    if (!window.jspdf || !window.jspdf.jsPDF) {
        throw new Error("jsPDF library is not loaded.");
    }

    const reportElement = createPDFReport(report);

    try {
        reportElement.style.visibility = "visible";

        await new Promise(resolve =>
            requestAnimationFrame(() =>
                requestAnimationFrame(resolve)
            )
        );

        if (document.fonts && document.fonts.ready) {
            await document.fonts.ready;
        }

        const width = reportElement.offsetWidth;
        const height = reportElement.scrollHeight;

        if (!width || !height) {
            throw new Error("Report has invalid dimensions.");
        }

        const canvas = await html2canvas(reportElement, {
            backgroundColor: "#ffffff",
            scale: 2,
            useCORS: true,
            allowTaint: false,
            logging: false,
            width: width,
            height: height,
            scrollX: 0,
            scrollY: 0,
            windowWidth: width,
            windowHeight: height
        });

        const { jsPDF } = window.jspdf;

        const pdf = new jsPDF({
            orientation: "portrait",
            unit: "mm",
            format: "a4"
        });

        const margin = 10;
        const pageWidth = 210;
        const pageHeight = 297;

        const printableWidth = pageWidth - margin * 2;
        const printableHeight = pageHeight - margin * 2;

        const pixelsPerPage = Math.floor(
            canvas.width * printableHeight / printableWidth
        );

        let offsetY = 0;
        let pageNumber = 0;

        while (offsetY < canvas.height) {

            const sliceHeight = Math.min(
                pixelsPerPage,
                canvas.height - offsetY
            );

            const pageCanvas = document.createElement("canvas");

            pageCanvas.width = canvas.width;
            pageCanvas.height = sliceHeight;

            const context = pageCanvas.getContext("2d");

            context.fillStyle = "#ffffff";

            context.fillRect(
                0,
                0,
                pageCanvas.width,
                pageCanvas.height
            );

            context.drawImage(
                canvas,
                0,
                offsetY,
                canvas.width,
                sliceHeight,
                0,
                0,
                canvas.width,
                sliceHeight
            );

            if (pageNumber > 0) {
                pdf.addPage();
            }

            const imageHeight =
                sliceHeight * printableWidth / canvas.width;

            pdf.addImage(
                pageCanvas.toDataURL("image/jpeg", 0.95),
                "JPEG",
                margin,
                margin,
                printableWidth,
                imageHeight
            );

            offsetY += sliceHeight;
            pageNumber++;
        }

        return pdf.output("blob");

    } finally {
        reportElement.remove();
    }
}


/* =========================================
   DOWNLOAD PDF
   ========================================= */

function downloadPDF(blob, fileName) {

    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");

    link.href = url;
    link.download = fileName;
    link.style.display = "none";

    document.body.appendChild(link);

    link.click();

    link.remove();

    setTimeout(function () {
        URL.revokeObjectURL(url);
    }, 2000);
}


/* =========================================
   SHARE / SAVE PDF
   ========================================= */

async function shareReportAsPDF(report) {

    try {

        if (
            !report ||
            !report.loads ||
            report.loads.length === 0
        ) {
            alert("No loads available for this report.");
            return;
        }

        const pdfBlob = await generateReportPDF(report);

        if (!pdfBlob) {
            throw new Error("PDF was not generated.");
        }

        const fileName =
            "Hanamagond-Tractor-Report-" +
            report.date +
            ".pdf";

        const file = new File(
            [pdfBlob],
            fileName,
            {
                type: "application/pdf"
            }
        );

        if (
            navigator.share &&
            navigator.canShare &&
            navigator.canShare({ files: [file] })
        ) {

            await navigator.share({
                title: "Hanamagond Tractor Load Report",
                text: "Complete Tractor Load Report",
                files: [file]
            });

            return;
        }

        downloadPDF(pdfBlob, fileName);

        alert("Report PDF saved successfully.");

    } catch (error) {

        console.error("PDF generation error:", error);

        if (error.name !== "AbortError") {
            alert(
                "Unable to create the report PDF. Please check that the PDF library is loaded and try again."
            );
        }
    }
}


/* =========================================
   KEEP EXISTING BUTTON CONNECTIONS
   ========================================= */

async function shareReportAsPNG(report) {
	 return shareReportAsPDF(report);
	}
/* =========================================
   SHARE CURRENT REPORT
   ========================================= */

shareButton.addEventListener(
    "click",
    async function () {

        if (
            session.loads.length === 0
        ) {

            alert(
                "No loads to share yet."
            );

            return;

        }


        await shareReportAsPNG(
            session
        );

    }
);


/* =========================================
   PREVIOUS REPORT DATE
   ========================================= */

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


        showPreviousReport(
            selectedDate
        );

    }
);


/* =========================================
   SHOW PREVIOUS REPORT
   ========================================= */

function showPreviousReport(
    dateKey
) {

    const reports =
        getReports();


    const report =
        reports[dateKey];


    if (!report) {

        previousReport.innerHTML = `

            <div class="report-title">
                No Report
            </div>

            No report is available for
            ${formatDate(
                new Date(
                    dateKey +
                    "T00:00:00"
                )
            )}.

        `;

        return;

    }


    let html = "";


    html += `

        <div class="report-title">
            🚜 Complete Report
        </div>

        <div class="report-line">

            <strong>
                Date:
            </strong>

            ${formatDate(
                new Date(
                    dateKey +
                    "T00:00:00"
                )
            )}

        </div>


        <div class="report-line">

            <strong>
                Tractor:
            </strong>

            ${escapeHtml(
                report.tractor
            )}

        </div>


        <div class="report-line">

            <strong>
                Driver:
            </strong>

            ${escapeHtml(
                report.driver ||
                "Not entered"
            )}

        </div>


        <div class="report-line">

            <strong>
                Total Loads:
            </strong>

            ${report.loads.length}

        </div>

    `;


    html += `

        <div class="report-line">

            <strong>
                LOAD HISTORY
            </strong>

        </div>

    `;


    report.loads.forEach(
        function (load) {

            const start =
                new Date(
                    load.startTime
                );


            const end =
                load.endTime
                    ? new Date(
                        load.endTime
                    )
                    : null;


            html += `

                <div class="report-load">

                    <strong>
                        Load ${load.number}
                    </strong>

                    <br>

                    ${formatTime(start)}

                    -

                    ${
                        end
                            ? formatTime(end)
                            : "Running"
                    }

                    <br>

                    Gap:
                    ${escapeHtml(load.gap)}

                </div>

            `;

        }
    );


    if (report.startTime) {

        html += `

            <div class="report-line">

                <strong>
                    Session Start:
                </strong>

                ${formatTime(
                    new Date(
                        report.startTime
                    )
                )}

            </div>

        `;

    }


    if (report.endTime) {

        html += `

            <div class="report-line">

                <strong>
                    Session End:
                </strong>

                ${formatTime(
                    new Date(
                        report.endTime
                    )
                )}

            </div>

        `;

    }


    if (
        report.startTime &&
        report.endTime
    ) {

        html += `

            <div class="report-line">

                <strong>
                    Duration:
                </strong>

                ${calculateDifference(
                    new Date(
                        report.startTime
                    ),
                    new Date(
                        report.endTime
                    )
                )}

            </div>

        `;

    }


    previousReport.innerHTML =
        html;

}


/* =========================================
   SHARE PREVIOUS REPORT AS PNG
   ========================================= */

if (sharePreviousButton) {

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


            await shareReportAsPNG(
                report
            );

        }
    );

}


/* =========================================
   NEW SESSION
   ========================================= */

newSessionButton.addEventListener(
    "click",
    function () {

        if (
            session.loads.length > 0
        ) {

            saveCurrentReport();

        }


        const confirmed =
            confirm(
                "Start a new session?"
            );


        if (!confirmed) {
            return;
        }


        clearInterval(
            lockInterval
        );


        lockUntil = 0;


        countButton.disabled =
            false;


        lockMessage.classList.add(
            "hidden"
        );


        session = {

            date:
                getDateKey(
                    new Date()
                ),

            tractor: "",

            driver: "",

            loads: [],

            startTime: null,

            endTime: null

        };


        selectedTractor = "";


        tractorOptions.forEach(
            function (button) {

                button.classList.remove(
                    "selected"
                );

                button.disabled =
                    false;

            }
        );


        selectedTractorText.textContent =
            "No tractor selected";


        driverNameInput.value =
            "";


        renderCurrentSession();

    }
);


/* =========================================
   LOAD TODAY REPORT
   ========================================= */

function loadTodayReport() {

    const reports =
        getReports();


    const today =
        getDateKey(
            new Date()
        );


    if (reports[today]) {

        session =
            reports[today];


        selectedTractor =
            session.tractor;


        tractorOptions.forEach(
            function (button) {

                if (
                    button.dataset.tractor ===
                    selectedTractor
                ) {

                    button.classList.add(
                        "selected"
                    );

                } else {

                    button.disabled =
                        true;

                }

            }
        );


        if (session.tractor) {

            selectedTractorText.textContent =
                "Selected: " +
                session.tractor;

        }


        driverNameInput.value =
            session.driver || "";


        renderCurrentSession();

    }

}


/* =========================================
   DATE PICKER
   ========================================= */

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


/* =========================================
   CLEAN OLD DATA
   ========================================= */

function cleanOldData() {

    const reports =
        getReports();


    removeOldReports(
        reports
    );


    saveReports(
        reports
    );

}


/* =========================================
   START APP
   ========================================= */

updateCurrentDate();

setupDatePicker();

cleanOldData();

loadTodayReport();

renderCurrentSession();