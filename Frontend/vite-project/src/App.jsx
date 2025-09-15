import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

import Login from '../src/Pages/Login';
import NotesList from '../src/Pages/NotesList';
import CreateNote from '../src/Pages/CreateNote';
import { Provider } from 'react-redux';
import { store } from './Store';


export default function App() {
  const [loggedIn, setLoggedIn] = useState(!!localStorage.getItem('token'));
  const [refreshNotes, setRefreshNotes] = useState(false);

  // Called when login succeeds
  function onLoginSuccess() {
    setLoggedIn(true);
    setRefreshNotes(r => !r); // Refresh notes immediately on login
  }

  // Called when a note is created to refresh the notes list
  function onNoteCreated() {
    setRefreshNotes(r => !r);
  }

  // Logout handler clears token and states
  function handleLogout() {
    localStorage.removeItem('token');
    setLoggedIn(false);
    setRefreshNotes(false); // Clear notes list by resetting refresh key
  }

  return (
    <Provider store={store}>
    <Router>
      <Routes>
        <Route
          path="/login"
          element={
            loggedIn ? (
              <Navigate to="/notes" replace />
            ) : (
              <Login onLoginSuccess={onLoginSuccess} />
            )
          }
        />
        <Route
          path="/notes"
          element={
            loggedIn ? (
              <div className="container p-3">
                <h1>Multi-Tenant Notes App</h1>
                <button className="btn btn-danger mb-3" onClick={handleLogout}>
                  Logout
                </button>
                <CreateNote onNoteCreated={onNoteCreated} />
                <NotesList refreshKey={refreshNotes} />
              </div>
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        <Route path="*" element={<Navigate to={loggedIn ? '/notes' : '/login'} replace />} />
      </Routes>
    </Router>
    </Provider>
  );
}
