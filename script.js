document.addEventListener("DOMContentLoaded", () => {
    const diaryInput = document.getElementById("diaryInput");
    const saveBtn = document.getElementById("saveEntry");
    const entryList = document.getElementById("entryList");
    const calendarDiv = document.getElementById("calendar");
    const moodChartCanvas = document.getElementById("moodChart");

    let entries = JSON.parse(localStorage.getItem("moodEntries")) || [];
    let moodChart; // Chart.js instance

    const positiveWords = ["happy", "great", "amazing", "good", "love", "excited", "joy", "wonderful"];
    const negativeWords = ["sad", "bad", "terrible", "angry", "upset", "hate", "worried", "tired"];

    function detectMood(text) {
        let score = 0;
        const words = text.toLowerCase().split(/\W+/);
        words.forEach(word => {
            if (positiveWords.includes(word)) score++;
            if (negativeWords.includes(word)) score--;
        });
        if (score > 0) return "😊 Positive";
        if (score < 0) return "😔 Negative";
        return "😐 Neutral";
    }

    function renderEntries() {
        entryList.innerHTML = "";
        entries.forEach((entry) => {
            const li = document.createElement("li");
            li.innerHTML = `<strong>${entry.date}</strong> - ${entry.mood}<br>${entry.text}`;
            entryList.appendChild(li);
        });
    }

    function renderCalendar() {
        calendarDiv.innerHTML = "";
        const today = new Date();
        const year = today.getFullYear();
        const month = today.getMonth();

        const firstDay = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();

        for (let i = 0; i < firstDay; i++) {
            const emptyDiv = document.createElement("div");
            calendarDiv.appendChild(emptyDiv);
        }

        for (let day = 1; day <= daysInMonth; day++) {
            const dateStr = `${day}/${month + 1}/${year}`;
            const dayDiv = document.createElement("div");
            dayDiv.classList.add("day");
            dayDiv.textContent = day;

            const entry = entries.find(e => e.date === dateStr);
            if (entry) {
                if (entry.mood.includes("Positive")) dayDiv.classList.add("positive");
                if (entry.mood.includes("Neutral")) dayDiv.classList.add("neutral");
                if (entry.mood.includes("Negative")) dayDiv.classList.add("negative");
            }
            calendarDiv.appendChild(dayDiv);
        }
    }

    function moodToScore(mood) {
        if (mood.includes("Positive")) return 1;
        if (mood.includes("Negative")) return -1;
        return 0;
    }

   function renderChart() {
    const sortedEntries = [...entries].sort((a, b) => {
        const [da, ma, ya] = a.date.split("/").map(Number);
        const [db, mb, yb] = b.date.split("/").map(Number);
        return new Date(ya, ma - 1, da) - new Date(yb, mb - 1, db);
    });

    const labels = sortedEntries.map(e => e.date);
    const data = sortedEntries.map(e => moodToScore(e.mood));

    if (moodChart) {
        moodChart.destroy();
    }

    moodChart = new Chart(moodChartCanvas.getContext("2d"), { // <-- FIXED HERE
        type: "line",
        data: {
            labels: labels,
            datasets: [{
                label: "Mood Over Time",
                data: data,
                borderColor: "#4cafef",
                backgroundColor: "#b3e5fc",
                tension: 0.3,
                fill: true
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    ticks: {
                        callback: (value) => {
                            if (value === 1) return "Positive";
                            if (value === 0) return "Neutral";
                            if (value === -1) return "Negative";
                            return value;
                        }
                    },
                    min: -1,
                    max: 1
                }
            }
        }
    });
}

    saveBtn.addEventListener("click", () => {
        const text = diaryInput.value.trim();
        if (text) {
            const today = new Date();
            const dateStr = `${today.getDate()}/${today.getMonth() + 1}/${today.getFullYear()}`;
            const mood = detectMood(text);
            entries = entries.filter(e => e.date !== dateStr);
            entries.push({ date: dateStr, text: text, mood: mood });
            localStorage.setItem("moodEntries", JSON.stringify(entries));
            diaryInput.value = "";
            renderEntries();
            renderCalendar();
            renderChart();
        }
    });

    renderEntries();
    renderCalendar();
    renderChart();
});
