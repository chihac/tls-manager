// Consolidated application JavaScript file

document.addEventListener("DOMContentLoaded", function () {
  // ============= LOCAL STORAGE FUNCTIONS =============
  function saveData(key, data) {
    localStorage.setItem(key, JSON.stringify(data));
  }

  function loadData(key, defaultValue = null) {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : defaultValue;
  }

  function clearData(key) {
    localStorage.removeItem(key);
  }

  // ============= DOM ELEMENTS =============
  const modal = document.getElementById("modal");
  const modalCloseButton = document.querySelector(".close");
  const equipmentForm = document.getElementById("equipment-form");
  const disabledCheckbox = document.getElementById("disabled-checkbox");
  const gridContainer = document.getElementById("grid-container");
  const addCharacterButton = document.getElementById("add-character");

  // Rename modal elements
  const renameModal = document.getElementById("rename-modal");
  const renameCloseButton = document.querySelector(".rename-close");
  const renameForm = document.getElementById("rename-form");
  const characterNameInput = document.getElementById("character-name");

  let currentCell = null;
  let currentCharacterIndex = null;

  // Ensure all elements are found
  if (
    !modal ||
    !modalCloseButton ||
    !equipmentForm ||
    !gridContainer ||
    !addCharacterButton ||
    !renameModal ||
    !renameCloseButton ||
    !renameForm ||
    !characterNameInput
  ) {
    console.error("Could not find all required DOM elements");
    return; // Exit if not all elements are found
  }

  // Updated equipment types to match game requirements with abbreviations
  const equipmentTypes = [
    { name: "Main Hand 1", abbr: "M1" },
    { name: "Off Hand 1", abbr: "O1" },
    { name: "Main Hand 2", abbr: "M2" },
    { name: "Off Hand 2", abbr: "O2" },
    { name: "Helmet", abbr: "HM" },
    { name: "Chest", abbr: "CH" },
    { name: "Pants", abbr: "PN" },
    { name: "Trinket 1", abbr: "T1" },
    { name: "Trinket 2", abbr: "T2" },
    { name: "Consumable 1", abbr: "C1" },
    { name: "Consumable 2", abbr: "C2" },
    { name: "Consumable 3", abbr: "C3" },
    { name: "Consumable 4", abbr: "C4" },
  ];

  // ============= QUALITY COLORS =============
  const qualityColors = {
    bad: "var(--bad-quality-color, #ff6b6b)",
    decent: "var(--decent-quality-color, #ffd166)",
    BiS: "var(--bis-quality-color, #06d6a0)",
  };

  // ============= EQUIPMENT GRID FUNCTIONALITY =============
  function createEquipmentGrid() {
    const savedCharacters = loadData("characters", []);

    // Clear existing grid
    gridContainer.innerHTML = "";

    if (savedCharacters.length === 0) {
      // Create default character if none exists
      addCharacter();
      return;
    }

    // Create the table
    const table = document.createElement("table");
    table.className = "equipment-table";

    // Create header row with character names
    const headerRow = document.createElement("tr");

    // Empty cell for the top-left corner
    const cornerCell = document.createElement("th");
    cornerCell.className = "equipment-type";
    headerRow.appendChild(cornerCell);

    // Add character names to header (now clickable for renaming)
    savedCharacters.forEach((character, charIndex) => {
      const th = document.createElement("th");
      th.className = "character-header";

      // Character name - make it clickable
      const nameSpan = document.createElement("span");
      const characterName = character.name || `Character ${charIndex + 1}`;
      nameSpan.textContent = characterName;
      nameSpan.className = "character-name clickable-name";
      nameSpan.title = characterName; // Add title attribute for hover tooltip

      // Add click event to open rename modal
      nameSpan.addEventListener("click", () => {
        openRenameModal(charIndex, characterName);
      });

      th.appendChild(nameSpan);

      headerRow.appendChild(th);
    });

    table.appendChild(headerRow);

    // Create rows for equipment types
    equipmentTypes.forEach((equipType, rowIndex) => {
      const row = document.createElement("tr");

      // First cell is equipment type
      const typeCell = document.createElement("th");
      typeCell.className = "equipment-type";
      typeCell.title = equipType.name; // Add title attribute for hover tooltip

      // Add full name and abbreviated version
      const fullName = document.createElement("span");
      fullName.className = "full-name";
      fullName.textContent = equipType.name;
      typeCell.appendChild(fullName);

      const abbr = document.createElement("span");
      abbr.className = "abbr-name";
      abbr.textContent = equipType.abbr;
      typeCell.appendChild(abbr);

      row.appendChild(typeCell);

      // Add a cell for each character
      savedCharacters.forEach((character, charIndex) => {
        const cell = document.createElement("td");
        cell.className = "clickable-cell";
        cell.dataset.character = charIndex;
        cell.dataset.equipment = rowIndex;

        // Get equipment data
        const level = character.equipment?.[rowIndex]?.level || "-";
        const quality = character.equipment?.[rowIndex]?.quality || "-";
        const isDisabled = character.equipment?.[rowIndex]?.disabled || false;

        // Set cell text to level
        cell.textContent = level;

        // Set cell styling based on disabled state or quality
        if (level === "X" || isDisabled) {
          cell.style.backgroundColor = "#cccccc";
          cell.classList.add("disabled-slot");
        } else if (quality in qualityColors) {
          cell.style.backgroundColor = qualityColors[quality];
          cell.classList.remove("disabled-slot");
        } else {
          cell.style.backgroundColor = "";
          cell.classList.remove("disabled-slot");
        }

        // Store quality as a data attribute
        cell.dataset.quality = quality;

        // Add click event
        cell.addEventListener("click", () => openModal(cell));

        row.appendChild(cell);
      });

      table.appendChild(row);
    });

    // Add delete buttons in a new row at the bottom
    const deleteRow = document.createElement("tr");
    deleteRow.className = "delete-row";

    // First cell is label
    const deleteLabel = document.createElement("th");
    deleteLabel.textContent = "Delete";
    deleteLabel.className = "delete-label";
    deleteRow.appendChild(deleteLabel);

    // Add delete buttons for each character
    savedCharacters.forEach((character, charIndex) => {
      const cell = document.createElement("td");
      cell.className = "delete-cell";

      // Create delete button
      const deleteBtn = document.createElement("button");
      deleteBtn.type = "button";
      deleteBtn.className = "delete-character-btn";
      deleteBtn.innerHTML = "Delete";
      deleteBtn.setAttribute(
        "aria-label",
        `Delete ${character.name || `Character ${charIndex + 1}`}`
      );
      deleteBtn.addEventListener("click", (e) => {
        deleteCharacter(charIndex);
      });

      cell.appendChild(deleteBtn);
      deleteRow.appendChild(cell);
    });

    table.appendChild(deleteRow);

    gridContainer.appendChild(table);
  }

  // ============= CHARACTER MANAGEMENT =============
  function addCharacter() {
    const characters = loadData("characters", []);

    // Create equipment array with default values
    const defaultEquipment = equipmentTypes.map((equipType, index) => {
      // Set Trinket 2, Consumable 3, and Consumable 4 as disabled by default
      // Trinket 2 is at index 8, Consumable 3 is at index 11, Consumable 4 is at index 12
      const isDisabled = [8, 11, 12].includes(index); // Indexes of T2, C3, C4

      return {
        type: equipType.name,
        level: isDisabled ? "X" : "-",
        quality: "-",
        disabled: isDisabled,
      };
    });

    characters.push({
      name: `Character ${characters.length + 1}`,
      equipment: defaultEquipment,
    });

    saveData("characters", characters);
    createEquipmentGrid();
  }

  // Function to delete a character
  function deleteCharacter(charIndex) {
    if (
      confirm(
        "Are you sure you want to delete this character? This action cannot be undone."
      )
    ) {
      const characters = loadData("characters", []);
      if (characters[charIndex]) {
        // Remove character from array
        characters.splice(charIndex, 1);
        saveData("characters", characters);
        createEquipmentGrid();
      }
    }
  }

  // Function to handle renaming a character
  function renameCharacter(charIndex, newName) {
    const characters = loadData("characters", []);
    if (characters[charIndex]) {
      characters[charIndex].name = newName;
      saveData("characters", characters);
      createEquipmentGrid();
    }
  }

  // ============= MODAL FUNCTIONALITY =============
  function openModal(cell) {
    currentCell = cell;

    // Get character and equipment information for the title
    const charIndex = parseInt(cell.dataset.character);
    const equipIndex = parseInt(cell.dataset.equipment);
    const characters = loadData("characters", []);

    // Get character name and equipment type
    const character = characters[charIndex];
    const characterName = character?.name || `Character ${charIndex + 1}`;
    const equipmentType = equipmentTypes[equipIndex]?.name || "Equipment";

    // Update the modal title
    const modalTitle = document.getElementById("modal-title");
    if (modalTitle) {
      modalTitle.textContent = `${characterName} - ${equipmentType}`;
    }

    // Get the equipment data
    const equipment = characters[charIndex]?.equipment?.[equipIndex] || {};
    const level = equipment.level || "-";
    const quality = equipment.quality || "-";
    const isDisabled = equipment.disabled || false;

    // Set disabled checkbox state
    disabledCheckbox.checked = isDisabled;

    // Update UI based on disabled state
    updateModalDisabledState(isDisabled);

    // Pre-select current level value if exists and not disabled
    if (level !== "X" && level !== "-") {
      const levelInput = document.querySelector(
        `input[name="level"][value="${level}"]`
      );
      if (levelInput) levelInput.checked = true;
    } else {
      // Select the "None" option if available
      const noneOption = document.querySelector(
        'input[name="level"][value="-"]'
      );
      if (noneOption) noneOption.checked = true;
    }

    // Pre-select current quality value
    if (quality && quality !== "-") {
      const qualityInput = document.querySelector(
        `input[name="quality"][value="${quality}"]`
      );
      if (qualityInput) qualityInput.checked = true;
    } else {
      // Select the "None" option for quality
      const noneOption = document.querySelector(
        'input[name="quality"][value="-"]'
      );
      if (noneOption) noneOption.checked = true;
    }

    modal.style.display = "block";
  }

  // Function to close the modal - fixed definition
  function closeModal() {
    modal.style.display = "none";

    // Reset disabled form groups if they exist
    const levelGroup = document.querySelector(".level-group");
    const qualityGroup = document.querySelector(".quality-group");

    if (levelGroup && qualityGroup) {
      levelGroup.classList.remove("disabled-form-group");
      qualityGroup.classList.remove("disabled-form-group");
    }

    // Clear current cell reference
    currentCell = null;
  }

  // Function to update the modal UI based on disabled state
  function updateModalDisabledState(isDisabled) {
    // Safely query the form groups
    const levelGroup = document.querySelector(".level-group");
    const qualityGroup = document.querySelector(".quality-group");

    // Only proceed if the elements exist
    if (!levelGroup || !qualityGroup) {
      console.warn("Level or quality group elements not found in the DOM");
      return;
    }

    if (isDisabled) {
      // If disabled, gray out and disable other form elements
      levelGroup.classList.add("disabled-form-group");
      qualityGroup.classList.add("disabled-form-group");

      // Disable all radio inputs
      document
        .querySelectorAll('input[name="level"], input[name="quality"]')
        .forEach((input) => {
          input.disabled = true;
        });
    } else {
      // If not disabled, enable form elements
      levelGroup.classList.remove("disabled-form-group");
      qualityGroup.classList.remove("disabled-form-group");

      // Enable all radio inputs
      document
        .querySelectorAll('input[name="level"], input[name="quality"]')
        .forEach((input) => {
          input.disabled = false;
        });
    }
  }

  // Update saveSelection function to handle the separate disabled checkbox
  function saveSelection(e) {
    e.preventDefault();

    // Get the disabled state
    const isDisabled = disabledCheckbox.checked;

    // Get the level and quality values
    const selectedLevel = isDisabled
      ? "X"
      : document.querySelector('input[name="level"]:checked')?.value || "-";
    const selectedQuality =
      document.querySelector('input[name="quality"]:checked')?.value || "-";

    if (currentCell) {
      // Update display
      currentCell.textContent = isDisabled ? "X" : selectedLevel;

      // Apply styling based on disabled state or quality
      if (isDisabled) {
        currentCell.style.backgroundColor = "#cccccc"; // Gray background for disabled
        currentCell.classList.add("disabled-slot");
      } else if (selectedQuality in qualityColors) {
        currentCell.style.backgroundColor = qualityColors[selectedQuality];
        currentCell.classList.remove("disabled-slot");
      } else {
        currentCell.style.backgroundColor = "";
        currentCell.classList.remove("disabled-slot");
      }

      // Store quality as a data attribute
      currentCell.dataset.quality = selectedQuality;

      // Update data in localStorage
      const charIndex = parseInt(currentCell.dataset.character);
      const equipIndex = parseInt(currentCell.dataset.equipment);

      const characters = loadData("characters", []);
      if (characters[charIndex]) {
        if (!characters[charIndex].equipment) {
          characters[charIndex].equipment = [];
        }
        if (!characters[charIndex].equipment[equipIndex]) {
          characters[charIndex].equipment[equipIndex] = {};
        }

        characters[charIndex].equipment[equipIndex].level = selectedLevel;
        characters[charIndex].equipment[equipIndex].quality = selectedQuality;
        characters[charIndex].equipment[equipIndex].disabled = isDisabled;
        saveData("characters", characters);
      }

      closeModal();
    }
  }

  // Function to open the rename modal
  function openRenameModal(charIndex, currentName) {
    currentCharacterIndex = charIndex;
    characterNameInput.value = currentName;
    renameModal.style.display = "block";

    // Focus the input field for immediate typing
    setTimeout(() => characterNameInput.focus(), 100);
  }

  // Function to close the rename modal
  function closeRenameModal() {
    renameModal.style.display = "none";
    currentCharacterIndex = null;
  }

  // Function to save the new character name
  function saveRename(e) {
    e.preventDefault();

    const newName = characterNameInput.value.trim();
    if (newName && currentCharacterIndex !== null) {
      renameCharacter(currentCharacterIndex, newName);
      closeRenameModal();
    }
  }

  // ============= EVENT LISTENERS =============
  // Modal close button
  modalCloseButton.addEventListener("click", closeModal);

  // Outside modal click to close
  window.addEventListener("click", function (event) {
    if (event.target === modal) {
      closeModal();
    }
  });

  // Form submission
  equipmentForm.addEventListener("submit", saveSelection);

  // Add character button
  addCharacterButton.addEventListener("click", addCharacter);

  // Rename modal close button
  renameCloseButton.addEventListener("click", closeRenameModal);

  // Outside rename modal click to close
  window.addEventListener("click", function (event) {
    if (event.target === renameModal) {
      closeRenameModal();
    }
  });

  // Rename form submission
  renameForm.addEventListener("submit", saveRename);

  // Event listener for disabled checkbox change (with null check)
  if (disabledCheckbox) {
    disabledCheckbox.addEventListener("change", function () {
      updateModalDisabledState(this.checked);
    });
  } else {
    console.warn("Disabled checkbox not found in the DOM");
  }

  // ============= INITIALIZATION =============
  // Initialize the application
  createEquipmentGrid();
});
