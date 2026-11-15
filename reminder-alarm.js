// reminder-alarm.js
// Shared reminder checker: include on every page so alarms fire
// as long as any CareTrack page is open (not just reminder.html).
(function () {
  const STORAGE_KEY = "reminders";

  const load = () => JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  const save = (list) => localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  const pad = (n) => n.toString().padStart(2, "0");
  const todayKey = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

  // --- Inject alarm audio + modal ---
  const alarmSound = document.createElement("audio");
  alarmSound.src = "alarm.mp3";
  alarmSound.preload = "auto";
  alarmSound.loop = true;

  const modal = document.createElement("div");
  modal.className = "fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center hidden";
  modal.style.zIndex = "9999";
  modal.innerHTML = `
    <div class="bg-white rounded-2xl p-8 shadow-lg w-full max-w-md text-center mx-4">
      <h2 class="text-2xl font-bold mb-4 text-blue-800">⏰ Medicine Reminder</h2>
      <p data-role="medicine" class="text-lg mb-4"></p>
      <p data-role="note" class="text-gray-700 mb-6"></p>
      <div class="flex justify-center space-x-6">
        <button data-role="dismiss" class="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-6 rounded-full">Dismiss</button>
        <button data-role="snooze" class="bg-yellow-400 hover:bg-yellow-500 text-white font-bold py-2 px-6 rounded-full">Snooze 5 min</button>
      </div>
    </div>`;

  const medicineEl = modal.querySelector('[data-role="medicine"]');
  const noteEl = modal.querySelector('[data-role="note"]');
  let currentIndex = null;

  function showModal(reminder, index) {
    currentIndex = index;
    medicineEl.textContent = `Time to take your medicine: ${reminder.medicine}`;
    noteEl.textContent = reminder.note || "";
    modal.classList.remove("hidden");
  }

  function closeModal() {
    alarmSound.pause();
    alarmSound.currentTime = 0;
    modal.classList.add("hidden");
    currentIndex = null;
  }

  modal.querySelector('[data-role="dismiss"]').addEventListener("click", closeModal);

  modal.querySelector('[data-role="snooze"]').addEventListener("click", () => {
    const reminders = load();
    if (currentIndex !== null && reminders[currentIndex]) {
      reminders[currentIndex].snoozedUntil = new Date(Date.now() + 5 * 60000).toISOString();
      save(reminders);
    }
    closeModal();
  });

  // --- Reminder check loop ---
  function check() {
    const now = new Date();
    const currentTime = `${pad(now.getHours())}:${pad(now.getMinutes())}`;
    const fireKey = `${todayKey(now)} ${currentTime}`;
    const reminders = load();
    let updated = false;

    reminders.forEach((reminder, index) => {
      let shouldTrigger = false;

      if (reminder.snoozedUntil) {
        if (now >= new Date(reminder.snoozedUntil)) {
          shouldTrigger = true;
          reminder.snoozedUntil = null;
        }
      } else if (reminder.time === currentTime && reminder.lastFired !== fireKey) {
        // Non-repeating reminders fire once ever; repeating ones once per day.
        if (reminder.repeat || !reminder.triggered) shouldTrigger = true;
      }

      if (!shouldTrigger) return;

      reminder.lastFired = fireKey;
      if (!reminder.repeat) reminder.triggered = true;
      updated = true;

      if ("Notification" in window && Notification.permission === "granted") {
        new Notification(`⏰ Time for ${reminder.medicine}`, {
          body: reminder.note || "No note provided",
        });
      }

      alarmSound.currentTime = 0;
      alarmSound.play().catch(() => {
        console.log("Alarm sound blocked by browser. Click anywhere on the page to enable sound.");
      });

      showModal(reminder, index);
    });

    if (updated) save(reminders);
  }

  function start() {
    document.body.appendChild(alarmSound);
    document.body.appendChild(modal);

    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }

    // Browsers block autoplay until the user interacts; unlock audio on first click.
    document.addEventListener("click", () => {
      if (!modal.classList.contains("hidden")) return;
      alarmSound.play().then(() => alarmSound.pause()).catch(() => {});
    }, { once: true });

    check();
    setInterval(check, 1000);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", start);
  } else {
    start();
  }
})();
