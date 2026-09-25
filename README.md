# QueueFlow

## Description
QueueFlow is a simple, professional queue management system built for small businesses and service counters — clinics, school offices, government counters, or customer service desks. Staff can add customers to a queue, call the next customer, mark customers as served, and monitor live queue statistics.

## Features
- Auto-generated queue numbers (A-001, A-002, ...)
- Dashboard with live stats: Waiting, Currently Serving, Served Today, Total Queue
- "Call Next" button that pulls the next waiting customer and displays them prominently
- Full queue list with Call / Mark Served / Remove actions
- Queue history of recently served customers
- Toast notifications for every action
- Data persists after refresh using LocalStorage
- Responsive, mobile-friendly layout with a collapsible sidebar
- Sample data included on first launch

## Technologies
- HTML5
- CSS3
- JavaScript
- LocalStorage

## How to Run
No installation or build steps needed. Simply open `index.html` in any modern web browser.

## Project Structure
```
queueflow/
├── index.html   # App structure and layout
├── style.css    # Styling and responsive design
├── script.js    # Queue logic, LocalStorage, rendering
└── README.md    # Project documentation
```

## Future Improvements
- Daily automatic reset of "Served Today" count
- Print/export queue tickets
- Multiple service counters/windows
- Audio announcement when calling next customer
- Editable customer details
