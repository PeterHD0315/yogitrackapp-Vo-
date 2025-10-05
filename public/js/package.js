let formMode = "search"; // Tracks the current mode of the form

// Fetch all package IDs and populate the dropdown
document.addEventListener("DOMContentLoaded", () => {
  setFormForSearch();
  initPackageDropdown();
  addPackageDropdownListener();
});

//SEARCH
document.getElementById("searchBtn").addEventListener("click", async () => {
  clearPackageForm();
  setFormForSearch();
  initPackageDropdown();
});

//ADD
document.getElementById("addBtn").addEventListener("click", async () => {
  setFormForAdd();
});

//SAVE
document.getElementById("saveBtn").addEventListener("click", async () => {
  if (formMode === "add") {
    //Get max ID for packageId
    const res = await fetch("/api/package/getNextId");
    const {nextId } = await res.json();
    document.getElementById("packageIdText").value = nextId;

    const form = document.getElementById("packageForm");

    const packageData = {
      packageId: nextId,
      packageName: form.packageName.value.trim(),
      description: form.description.value.trim(),
      price: parseFloat(form.price.value)
    };

    try {
      const res = await fetch("/api/package/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(packageData),
      });

      const result = await res.json();
      if (!res.ok)
        throw new Error(result.message || "Failed to add package");

      alert(`✅ Package ${packageData.packageId} added successfully!`);
      form.reset();
      setFormForSearch();
      initPackageDropdown();
    } catch (err) {
      alert("❌ Error: " + err.message);
    }
  } else if (formMode === "edit") {
    // Update existing package
    const form = document.getElementById("packageForm");
    const select = document.getElementById("packageIdSelect");
    const packageId = select.value;

    const packageData = {
      packageId: packageId,
      packageName: form.packageName.value.trim(),
      description: form.description.value.trim(),
      price: parseFloat(form.price.value)
    };

    try {
      const res = await fetch("/api/package/update", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(packageData),
      });

      const result = await res.json();
      if (!res.ok)
        throw new Error(result.message || "Failed to update package");

      alert(`✅ Package ${packageData.packageId} updated successfully!`);
      initPackageDropdown();
    } catch (err) {
      alert("❌ Error: " + err.message);
    }
  }
});

//DELETE
document.getElementById("deleteBtn").addEventListener("click", async () => {
  var select = document.getElementById("packageIdSelect");
  var packageId = select.value;

  if (!packageId) {
    alert("Please select a package to delete");
    return;
  }

  if (!confirm(`Are you sure you want to delete package ${packageId}?`)) {
    return;
  }

  try {
    const response = await fetch(
      `/api/package/deletePackage?packageId=${packageId}`, {
        method: "DELETE"
      });

    if (!response.ok) {
      throw new Error("Package delete failed");
    } else {
      alert(`Package with id ${packageId} successfully deleted`);
      clearPackageForm();
      setFormForSearch();
      initPackageDropdown();
    }
  } catch (err) {
    alert("❌ Error: " + err.message);
  }
});

async function initPackageDropdown() {
  const select = document.getElementById("packageIdSelect");
  // Clear existing options except the first one
  select.innerHTML = '<option value=""> -- Select Package Id --</option>';
  
  try {
    const response = await fetch("/api/package/getPackageIds");
    const packages = await response.json();

    packages.forEach((pkg) => {
      const option = document.createElement("option");
      option.value = pkg.packageId;
      option.textContent = `${pkg.packageId}: ${pkg.packageName} - $${pkg.price}`;
      select.appendChild(option);
    });
  } catch (err) {
    console.error("Failed to load package IDs: ", err);
  }
}

async function addPackageDropdownListener() {
  const form = document.getElementById("packageForm");
  const select = document.getElementById("packageIdSelect");
  select.addEventListener("change", async () => {
    var packageId = select.value;
    
    if (!packageId) return;
    
    try {
      const res = await fetch(
        `/api/package/getPackage?packageId=${packageId}`
      );
      if (!res.ok) throw new Error("Package search failed");

      const data = await res.json();
      if (!data || Object.keys(data).length === 0) {
        alert("No package found");
        return;
      }

      // Set form to edit mode
      formMode = "edit";
      
      //Fill form with data
      form.packageName.value = data.packageName || "";
      form.description.value = data.description || "";
      form.price.value = data.price || "";

    } catch (err) {
      alert(`Error searching package: ${packageId} - ${err.message}`);
    }
  });
}

function clearPackageForm() {
  document.getElementById("packageForm").reset();
  document.getElementById("packageIdSelect").innerHTML = '<option value=""> -- Select Package Id --</option>';
}

function setFormForSearch() {
  formMode = "search";
  //toggle back to search mode
  document.getElementById("packageIdLabel").style.display = "block"; // Show dropdown
  document.getElementById("packageIdTextLabel").style.display = "none"; // Hide text input
  document.getElementById("packageIdText").value = "";
  document.getElementById("packageIdText").style.display = "none";
  document.getElementById("packageForm").reset();
}

function setFormForAdd() {
  formMode = "add";
  //hide the package id drop down and label
  document.getElementById("packageIdLabel").style.display = "none";
  document.getElementById("packageIdTextLabel").style.display = "block";
  document.getElementById("packageIdText").value = "";
  document.getElementById("packageForm").reset();
}