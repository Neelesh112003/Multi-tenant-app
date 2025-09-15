import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

import Login from '../src//Pages//Login';
import NotesList from '../src/Pages/NotesList';
import CreateNote from '../src/Pages/CreateNote';

export default function App() {
  const [loggedIn, setLoggedIn] = useState(!!localStorage.getItem('token'));
  const [refreshNotes, setRefreshNotes] = useState(false);

  function onLoginSuccess() {
    setLoggedIn(true);
  }

  function onNoteCreated() {
    setRefreshNotes(r => !r);
  }

  return (
    <Router>
      <Routes>
        <Route
          path="/login"
          element={loggedIn ? <Navigate to="/notes" replace /> : <Login onLoginSuccess={onLoginSuccess} />}
        />
        <Route
          path="/notes"
          element={
            loggedIn ? (
              <div>
                <h1>Multi-Tenant Notes App</h1>
                <CreateNote onNoteCreated={onNoteCreated} />
                <NotesList key={refreshNotes} />
              </div>
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        <Route path="*" element={<Navigate to={loggedIn ? "/notes" : "/login"} replace />} />
      </Routes>
    </Router>
  );
}
