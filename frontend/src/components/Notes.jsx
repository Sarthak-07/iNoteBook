import React, { useContext, useEffect } from "react";
import NoteContext from "../context/notes/NoteContext";
import NoteItem from "./NoteItem";
import {useNavigate} from 'react-router-dom';

const Notes = () => {
  const context = useContext(NoteContext);
  const { notes, fetchNotes } = context;
  let navigate = useNavigate();
  useEffect(() => {
    if (localStorage.getItem("token")) {
      fetchNotes();
    } else {
      navigate("/login");
    }
    // eslint-disable-next-line
  }, []);

  const updateNote = (note) => {};

  return (
    <>
      <div></div>
      <div className="mx-6 flex flex-wrap justify-center">
        {notes.map((note, index) => (
          <div key={index} className="flex-shrink-0">
            <NoteItem key={note._id} updateNote={updateNote} note={note} />
          </div>
        ))}
      </div>
    </>
  );
};

export default Notes;
