// src/App.jsx
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Login from './components/Login';
import Signup from './components/Signup';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import Header from './components/Header';
import Footer from './components/Footer';
import UserGroups from './components/UserGroups';
import CreateGroup from './pages/CreateGroup';
import GroupDetail from './pages/GroupDetail';
import AddMember from './pages/AddMember';
import AddExpense from './pages/AddExpense';
import ExpenseDetail from './pages/ExpenseDetail';
import ErrorBoundary from './components/ErrorBoundary';



function LayoutWithHeaderFooter({ children }) {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <ToastContainer />
      <div className="flex-grow">{children}</div>
      <Footer />
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <Router>
        <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/create-group" element={<CreateGroup />} />
        <Route path="/groups/:groupId" element={
          <LayoutWithHeaderFooter>
            <GroupDetail />
          </LayoutWithHeaderFooter>
        } />
        <Route path="/" element={<Home />} />
        <Route
          path="/dashboard"
          element={
            <LayoutWithHeaderFooter>
              <Dashboard />
              
            </LayoutWithHeaderFooter>
          }
        />
        <Route path="/groups/:groupId/add-member" element={
          <LayoutWithHeaderFooter>
            <AddMember />
          </LayoutWithHeaderFooter>
        } />
        <Route path="/groups/:groupId/add-expense" element={
          <LayoutWithHeaderFooter>
            <AddExpense />
          </LayoutWithHeaderFooter>
        } />
        <Route path="/expenses/:id" element={
          <LayoutWithHeaderFooter>
          <ExpenseDetail />
          </LayoutWithHeaderFooter>
          } />
      </Routes>
      </Router>
    </ErrorBoundary>
  );
}
