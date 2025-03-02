# Character Equipment Tracker

## Overview
The Character Equipment Tracker is a mobile web application designed to help users manage characters and their associated equipment slots in a grid format. Each column represents a character, and each row represents an equipment slot. The application utilizes local storage to save user data and is built as a single static page for ease of use.

## Features
- Responsive design optimized for mobile viewports.
- Dynamic grid creation for characters and equipment slots.
- Modal popover for selecting equipment ratings.
- Data persistence using the browser's local storage.

## File Structure
```
character-equipment-tracker
├── assets
│   └── css
│       ├── main.css
│       └── modal.css
├── js
│   ├── app.js
│   ├── characterManager.js
│   ├── equipmentGrid.js
│   ├── localStorage.js
│   └── modal.js
├── index.html
├── favicon.ico
└── README.md
```

## Setup Instructions
1. Clone the repository to your local machine.
2. Open `index.html` in a web browser to run the application.
3. Ensure that your browser supports local storage.

## Usage Guidelines
- To create a new character, click on the designated area in the grid.
- A modal will appear allowing you to select the equipment rating.
- The selected ratings will be reflected in the grid cells.

## Contributing
Contributions are welcome! Please submit a pull request or open an issue for any enhancements or bug fixes.