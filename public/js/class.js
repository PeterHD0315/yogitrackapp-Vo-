let formMode = "search"; // Tracks the current mode of the form
let scheduleCounter = 0;

// Fetch all class IDs and populate the dropdown
document.addEventListener("DOMContentLoaded", () => {
  setFormForSearch();
  initClassDropdown();
  initInstructorDropdown();
  addClassDropdownListener();
  initModal();
});

//SEARCH
document.getElementById("searchBtn").addEventListener("click", async () => {
  clearClassForm();
  setFormForSearch();
  initClassDropdown();
});

//ADD
document.getElementById("addBtn").addEventListener("click", async () => {
  setFormForAdd();
});

//SAVE
document.getElementById("saveBtn").addEventListener("click", async () => {
  if (formMode === "add") {
    //Get max ID for classId
    const res = await fetch("/api/class/getNextId");
    const {nextId } = await res.json();
    document.getElementById("classIdText").value = nextId;

    const form = document.getElementById("classForm");
    const scheduleData = collectScheduleData();

    const classData = {
      classId: nextId,
      className: form.className.value.trim(),
      instructorId: form.instructorId.value,
      classType: form.classType.value,
      description: form.description.value.trim(),
      daytime: scheduleData
    };

    try {
      const res = await fetch("/api/class/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(classData),
      });

      const result = await res.json();
      if (!res.ok)
        throw new Error(result.message || "Failed to add class");

      alert(`✅ Class ${classData.classId} added successfully!`);
      form.reset();
      clearScheduleEntries();
      setFormForSearch();
      initClassDropdown();
    } catch (err) {
      alert("❌ Error: " + err.message);
    }
  } else if (formMode === "edit") {
    // Update existing class
    const form = document.getElementById("classForm");
    const select = document.getElementById("classIdSelect");
    const classId = select.value.split(":")[0];
    const scheduleData = collectScheduleData();

    const classData = {
      classId: classId,
      className: form.className.value.trim(),
      instructorId: form.instructorId.value,
      classType: form.classType.value,
      description: form.description.value.trim(),
      daytime: scheduleData
    };

    try {
      const res = await fetch("/api/class/update", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(classData),
      });

      const result = await res.json();
      if (!res.ok)
        throw new Error(result.message || "Failed to update class");

      alert(`✅ Class ${classData.classId} updated successfully!`);
      initClassDropdown();
    } catch (err) {
      alert("❌ Error: " + err.message);
    }
  }
});

//DELETE
document.getElementById("deleteBtn").addEventListener("click", async () => {
  var select = document.getElementById("classIdSelect");
  var classId = select.value.split(":")[0];

  if (!classId) {
    alert("Please select a class to delete");
    return;
  }

  if (!confirm(`Are you sure you want to delete class ${classId}?`)) {
    return;
  }

  try {
    const response = await fetch(
      `/api/class/deleteClass?classId=${classId}`, {
        method: "DELETE"
      });

    if (!response.ok) {
      throw new Error("Class delete failed");
    } else {
      alert(`Class with id ${classId} successfully deleted`);
      clearClassForm();
      setFormForSearch();
      initClassDropdown();
    }
  } catch (err) {
    alert("❌ Error: " + err.message);
  }
});

// Add Schedule Entry
document.getElementById("addScheduleBtn").addEventListener("click", () => {
  addScheduleEntry();
});

// View Weekly Schedule
document.getElementById("viewScheduleBtn").addEventListener("click", async () => {
  await showWeeklySchedule();
});

async function initClassDropdown() {
  const select = document.getElementById("classIdSelect");
  // Clear existing options except the first one
  select.innerHTML = '<option value=""> -- Select Class Id --</option>';
  
  try {
    const response = await fetch("/api/class/getClassIds");
    const classes = await response.json();

    classes.forEach((cls) => {
      const option = document.createElement("option");
      option.value = `${cls.classId}:${cls.className}`;
      option.textContent = `${cls.classId}: ${cls.className} (${cls.instructorName})`;
      select.appendChild(option);
    });
  } catch (err) {
    console.error("Failed to load class IDs: ", err);
  }
}

async function initInstructorDropdown() {
  const select = document.getElementById("instructorSelect");
  
  try {
    const response = await fetch("/api/instructor/getInstructorIds");
    const instructors = await response.json();

    instructors.forEach((instructor) => {
      const option = document.createElement("option");
      option.value = instructor.instructorId;
      option.textContent = `${instructor.instructorId}: ${instructor.firstname} ${instructor.lastname}`;
      select.appendChild(option);
    });
  } catch (err) {
    console.error("Failed to load instructor IDs: ", err);
  }
}

async function addClassDropdownListener() {
  const form = document.getElementById("classForm");
  const select = document.getElementById("classIdSelect");
  select.addEventListener("change", async () => {
    var classId = select.value.split(":")[0];
    
    if (!classId) return;
    
    try {
      const res = await fetch(
        `/api/class/getClass?classId=${classId}`
      );
      if (!res.ok) throw new Error("Class search failed");

      const data = await res.json();
      if (!data || Object.keys(data).length === 0) {
        alert("No class found");
        return;
      }

      // Set form to edit mode
      formMode = "edit";
      
      //Fill form with data
      form.className.value = data.className || "";
      form.instructorId.value = data.instructorId || "";
      form.classType.value = data.classType || "";
      form.description.value = data.description || "";

      // Clear and populate schedule entries
      clearScheduleEntries();
      if (data.daytime && data.daytime.length > 0) {
        data.daytime.forEach(schedule => {
          addScheduleEntry(schedule);
        });
      }

    } catch (err) {
      alert(`Error searching class: ${classId} - ${err.message}`);
    }
  });
}

function addScheduleEntry(scheduleData = null) {
  scheduleCounter++;
  const container = document.getElementById("scheduleContainer");
  
  const entryDiv = document.createElement("div");
  entryDiv.className = "schedule-entry";
  entryDiv.id = `schedule-${scheduleCounter}`;
  
  entryDiv.innerHTML = `
    <div>
      <label>Day
        <select name="day" class="form-input">
          <option value="">-- Select Day --</option>
          <option value="Mon">Monday</option>
          <option value="Tue">Tuesday</option>
          <option value="Wed">Wednesday</option>
          <option value="Thu">Thursday</option>
          <option value="Fri">Friday</option>
          <option value="Sat">Saturday</option>
          <option value="Sun">Sunday</option>
        </select>
      </label>
    </div>
    <div>
      <label>Time
        <input type="time" name="time" class="form-input">
      </label>
    </div>
    <div>
      <label>Duration (min)
        <input type="number" name="duration" min="15" max="180" step="15" value="60" class="form-input">
      </label>
    </div>
    <div>
      <button type="button" class="remove-schedule" onclick="removeScheduleEntry('schedule-${scheduleCounter}')">Remove</button>
    </div>
  `;
  
  container.appendChild(entryDiv);
  
  // If schedule data is provided, populate the fields
  if (scheduleData) {
    const daySelect = entryDiv.querySelector('select[name="day"]');
    const timeInput = entryDiv.querySelector('input[name="time"]');
    const durationInput = entryDiv.querySelector('input[name="duration"]');
    
    daySelect.value = scheduleData.day || "";
    timeInput.value = scheduleData.time || "";
    durationInput.value = scheduleData.duration || 60;
  }
}

function removeScheduleEntry(entryId) {
  const entry = document.getElementById(entryId);
  if (entry) {
    entry.remove();
  }
}

function collectScheduleData() {
  const scheduleEntries = document.querySelectorAll(".schedule-entry");
  const scheduleData = [];
  
  scheduleEntries.forEach(entry => {
    const day = entry.querySelector('select[name="day"]').value;
    const time = entry.querySelector('input[name="time"]').value;
    const duration = entry.querySelector('input[name="duration"]').value;
    
    if (day && time && duration) {
      scheduleData.push({
        day: day,
        time: time,
        duration: parseInt(duration)
      });
    }
  });
  
  return scheduleData;
}

function clearScheduleEntries() {
  const container = document.getElementById("scheduleContainer");
  container.innerHTML = "";
  scheduleCounter = 0;
}

async function showWeeklySchedule() {
  try {
    const response = await fetch("/api/class/getWeeklySchedule");
    const weeklyData = await response.json();
    
    const modal = document.getElementById("scheduleModal");
    const content = document.getElementById("weeklyScheduleContent");
    
    // Build the weekly schedule HTML
    let scheduleHTML = '<div class="weekly-schedule">';
    
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    
    days.forEach(day => {
      scheduleHTML += `
        <div class="day-column">
          <div class="day-header">${day}</div>
      `;
      
      if (weeklyData[day] && weeklyData[day].length > 0) {
        weeklyData[day].forEach(cls => {
          scheduleHTML += `
            <div class="class-item">
              <div class="class-time">${cls.time}</div>
              <div class="class-name">${cls.className}</div>
              <div class="class-instructor">${cls.instructor}</div>
              <div class="class-type">${cls.classType}</div>
              <div style="font-size: 0.75rem; color: #666; margin-top: 0.25rem;">${cls.duration} min</div>
            </div>
          `;
        });
      } else {
        scheduleHTML += '<div style="color: #999; font-style: italic;">No classes scheduled</div>';
      }
      
      scheduleHTML += '</div>';
    });
    
    scheduleHTML += '</div>';
    content.innerHTML = scheduleHTML;
    modal.style.display = "block";
    
  } catch (err) {
    alert("❌ Error loading weekly schedule: " + err.message);
  }
}

function initModal() {
  const modal = document.getElementById("scheduleModal");
  const closeBtn = document.querySelector(".close");
  
  closeBtn.onclick = function() {
    modal.style.display = "none";
  }
  
  window.onclick = function(event) {
    if (event.target == modal) {
      modal.style.display = "none";
    }
  }
}

function clearClassForm() {
  document.getElementById("classForm").reset();
  document.getElementById("classIdSelect").innerHTML = '<option value=""> -- Select Class Id --</option>';
  clearScheduleEntries();
}

function setFormForSearch() {
  formMode = "search";
  //toggle back to search mode
  document.getElementById("classIdLabel").style.display = "block"; // Show dropdown
  document.getElementById("classIdTextLabel").style.display = "none"; // Hide text input
  document.getElementById("classIdText").value = "";
  document.getElementById("classIdText").style.display = "none";
  document.getElementById("classForm").reset();
  clearScheduleEntries();
}

function setFormForAdd() {
  formMode = "add";
  //hide the class id drop down and label
  document.getElementById("classIdLabel").style.display = "none";
  document.getElementById("classIdTextLabel").style.display = "block";
  document.getElementById("classIdText").value = "";
  document.getElementById("classForm").reset();
  clearScheduleEntries();
  // Add one schedule entry by default
  addScheduleEntry();
}