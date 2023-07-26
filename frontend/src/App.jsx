import { FrappeProvider } from 'frappe-react-sdk'
import CalendarView from './components/CalendarView';
import { CalendarProvider } from './components/CalendarContex';
import LoginPage from './components/LoginPage';


import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link
} from 'react-router-dom';
import { LoginProvider } from './components/loginContext';

function App() {

  return (
    <div className="App">
      <FrappeProvider>
        <CalendarProvider>
          <LoginProvider>
            <Router>
              <Routes>
                <Route exact path='/frontend' element={< LoginPage />}></Route>
                <Route exact path='/frontend/calendar' element={< CalendarView />}></Route>
                <Route exact path='*' element={< LoginPage />}></Route>
              </Routes>
            </Router>
          </LoginProvider>
        </CalendarProvider>
      </FrappeProvider>
    </div>
  )
}

export default App
