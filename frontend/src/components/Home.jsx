import React from "react";
import Notes from "./Notes";
import AddNote from "./AddNote";

const Home = () => {
  return (
    <>
    <div> <AddNote/> </div>
      <div className="my-6">
        <Notes />
      </div>
    </>
  );
};

export default Home;
