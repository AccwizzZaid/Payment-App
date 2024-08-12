import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Form from './Form';

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path='/' element={<Form />} />
   
      </Routes>
    </BrowserRouter>
  );
};

export default App;
