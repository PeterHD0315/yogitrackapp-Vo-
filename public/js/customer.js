let formMode = "search"; // Tracks the current mode of the form

// Fetch all customer IDs and populate the dropdown
document.addEventListener("DOMContentLoaded", () => {
  setFormForSearch();
  initCustomerDropdown();
  addCustomerDropdownListener();
});

//SEARCH
document.getElementById("searchBtn").addEventListener("click", async () => {
  clearCustomerForm();
  setFormForSearch();
  initCustomerDropdown();
});

//ADD
document.getElementById("addBtn").addEventListener("click", async () => {
  setFormForAdd();
});

//SAVE
document.getElementById("saveBtn").addEventListener("click", async () => {
  if (formMode === "add") {
    //Get max ID for customerId
    const res = await fetch("/api/customer/getNextId");
    const {nextId } = await res.json();
    document.getElementById("customerIdText").value = nextId;

    const form = document.getElementById("customerForm");

    const customerData = {
      customerId: nextId,
      firstName: form.firstName.value.trim(),
      lastName: form.lastName.value.trim(),
      address: form.address.value.trim(),
      phone: form.phone.value.trim(),
      email: form.email.value.trim(),
      preferredContact: form.preferredContact.value,
      senior: form.senior.checked,
      classBalance: parseInt(form.classBalance.value) || 0
    };

    try {
      const res = await fetch("/api/customer/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(customerData),
      });

      const result = await res.json();
      if (!res.ok)
        throw new Error(result.message || "Failed to add customer");

      alert(`✅ Customer ${customerData.customerId} added successfully!`);
      form.reset();
      setFormForSearch();
      initCustomerDropdown();
    } catch (err) {
      alert("❌ Error: " + err.message);
    }
  } else if (formMode === "edit") {
    // Update existing customer
    const form = document.getElementById("customerForm");
    const select = document.getElementById("customerIdSelect");
    const customerId = select.value.split(":")[0];

    const customerData = {
      customerId: customerId,
      firstName: form.firstName.value.trim(),
      lastName: form.lastName.value.trim(),
      address: form.address.value.trim(),
      phone: form.phone.value.trim(),
      email: form.email.value.trim(),
      preferredContact: form.preferredContact.value,
      senior: form.senior.checked,
      classBalance: parseInt(form.classBalance.value) || 0
    };

    try {
      const res = await fetch("/api/customer/update", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(customerData),
      });

      const result = await res.json();
      if (!res.ok)
        throw new Error(result.message || "Failed to update customer");

      alert(`✅ Customer ${customerData.customerId} updated successfully!`);
      initCustomerDropdown();
    } catch (err) {
      alert("❌ Error: " + err.message);
    }
  }
});

//DELETE
document.getElementById("deleteBtn").addEventListener("click", async () => {
  var select = document.getElementById("customerIdSelect");
  var customerId = select.value.split(":")[0];

  if (!customerId) {
    alert("Please select a customer to delete");
    return;
  }

  if (!confirm(`Are you sure you want to delete customer ${customerId}?`)) {
    return;
  }

  try {
    const response = await fetch(
      `/api/customer/deleteCustomer?customerId=${customerId}`, {
        method: "DELETE"
      });

    if (!response.ok) {
      throw new Error("Customer delete failed");
    } else {
      alert(`Customer with id ${customerId} successfully deleted`);
      clearCustomerForm();
      setFormForSearch();
      initCustomerDropdown();
    }
  } catch (err) {
    alert("❌ Error: " + err.message);
  }
});

async function initCustomerDropdown() {
  const select = document.getElementById("customerIdSelect");
  // Clear existing options except the first one
  select.innerHTML = '<option value=""> -- Select Customer Id --</option>';
  
  try {
    const response = await fetch("/api/customer/getCustomerIds");
    const customers = await response.json();

    customers.forEach((customer) => {
      const option = document.createElement("option");
      option.value = `${customer.customerId}:${customer.firstName} ${customer.lastName}`;
      option.textContent = `${customer.customerId}: ${customer.firstName} ${customer.lastName} (Balance: ${customer.classBalance})`;
      select.appendChild(option);
    });
  } catch (err) {
    console.error("Failed to load customer IDs: ", err);
  }
}

async function addCustomerDropdownListener() {
  const form = document.getElementById("customerForm");
  const select = document.getElementById("customerIdSelect");
  select.addEventListener("change", async () => {
    var customerId = select.value.split(":")[0];
    
    if (!customerId) return;
    
    try {
      const res = await fetch(
        `/api/customer/getCustomer?customerId=${customerId}`
      );
      if (!res.ok) throw new Error("Customer search failed");

      const data = await res.json();
      if (!data || Object.keys(data).length === 0) {
        alert("No customer found");
        return;
      }

      // Set form to edit mode
      formMode = "edit";
      
      //Fill form with data
      form.firstName.value = data.firstName || "";
      form.lastName.value = data.lastName || "";
      form.address.value = data.address || "";
      form.phone.value = data.phone || "";
      form.email.value = data.email || "";
      form.classBalance.value = data.classBalance || 0;
      form.senior.checked = data.senior || false;

      // Set preferred contact radio button
      if (data.preferredContact === "phone") {
        form.preferredContact[0].checked = true;
      } else if (data.preferredContact === "email") {
        form.preferredContact[1].checked = true;
      }

    } catch (err) {
      alert(`Error searching customer: ${customerId} - ${err.message}`);
    }
  });
}

function clearCustomerForm() {
  document.getElementById("customerForm").reset();
  document.getElementById("customerIdSelect").innerHTML = '<option value=""> -- Select Customer Id --</option>';
}

function setFormForSearch() {
  formMode = "search";
  //toggle back to search mode
  document.getElementById("customerIdLabel").style.display = "block"; // Show dropdown
  document.getElementById("customerIdTextLabel").style.display = "none"; // Hide text input
  document.getElementById("customerIdText").value = "";
  document.getElementById("customerIdText").style.display = "none";
  document.getElementById("customerForm").reset();
}

function setFormForAdd() {
  formMode = "add";
  //hide the customer id drop down and label
  document.getElementById("customerIdLabel").style.display = "none";
  document.getElementById("customerIdTextLabel").style.display = "block";
  document.getElementById("customerIdText").value = "";
  document.getElementById("customerForm").reset();
  // Set default class balance to 0
  document.querySelector('input[name="classBalance"]').value = 0;
}