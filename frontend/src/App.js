import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Home from './pages/Home';
import CreateRecipient from './components/CreateRecipient';
import AcceptInvite from './components/AcceptInvite';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Register from './pages/Register';
import Recipient from './pages/Recipient';

function App() {



  return (
    <div className="App">
      <BrowserRouter>
      <Navbar />
        <Routes>
          <Route path="login" element={<Login/>}/>
          <Route path="register" element={<Register/>}/>
          <Route path="home" element={<Home/>}/>
          <Route path="create_recipient" element={<CreateRecipient/>}/>
          <Route path="accept-invite/:token" element={<AcceptInvite/>}/>
          <Route path="recipient/:id" element={<Recipient/>}/>
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
