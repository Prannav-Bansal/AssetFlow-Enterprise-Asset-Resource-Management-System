// react-big-calendar ships without bundled type declarations and there is no
// installed @types package. This ambient declaration lets the project build;
// the library is only used in one place (the bookings calendar view).
declare module 'react-big-calendar';
declare module 'react-big-calendar/lib/css/react-big-calendar.css';
