import { Link } from 'react-router-dom';
import UserGroups from '../components/UserGroups';

export default function Dashboard() {
  return (
    <div className="bg-black min-h-screen py-12 px-4">
      <h1 className="text-4xl font-extrabold text-green-400 mb-10 text-center">Your Groups</h1>
      <UserGroups />
    </div>
  );
}