const fs = require('fs');

const pathHeader = 'W:/Wedding Planner/seatmate/src/components/Header.tsx';
let headerCode = fs.readFileSync(pathHeader, 'utf8');
headerCode = headerCode.replace(/border-b border-border\/40 bg-background\/95 backdrop-blur/g, 'glass shadow-sm z-50 sticky top-0');
fs.writeFileSync(pathHeader, headerCode, 'utf8');

const pathApp = 'W:/Wedding Planner/seatmate/src/components/SeatingChartApp.tsx';
let appCode = fs.readFileSync(pathApp, 'utf8');
// Canvas container
appCode = appCode.replace(/border border-border\/40 shadow-md/g, 'glass shadow-premium rounded-2xl');
// App background
appCode = appCode.replace(/<div className="flex-1 flex flex-col p-4 md:p-5 border-l border-border\/40 bg-background">/g, '<div className="flex-1 flex flex-col p-4 md:p-6 lg:p-8 bg-transparent">');
fs.writeFileSync(pathApp, appCode, 'utf8');

const pathSidebar = 'W:/Wedding Planner/seatmate/src/components/Sidebar.tsx';
let sidebarCode = fs.readFileSync(pathSidebar, 'utf8');
sidebarCode = sidebarCode.replace(/border-r border-border\/40 bg-card\/95 backdrop-blur/g, 'glass shadow-premium m-4 rounded-2xl border-none');
sidebarCode = sidebarCode.replace(/border border-border\/50/g, 'border-none shadow-sm bg-muted/30');
fs.writeFileSync(pathSidebar, sidebarCode, 'utf8');

const pathToolbar = 'W:/Wedding Planner/seatmate/src/components/Toolbar.tsx';
let toolbarCode = fs.readFileSync(pathToolbar, 'utf8');
toolbarCode = toolbarCode.replace(/bg-card\/80 backdrop-blur-md border-b border-border\/40/g, 'glass shadow-premium mx-4 mt-4 rounded-2xl border-none');
fs.writeFileSync(pathToolbar, toolbarCode, 'utf8');

