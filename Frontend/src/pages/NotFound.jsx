import React from 'react';
import { Link } from 'react-router-dom';
import StatePanel from '../components/StatePanel';

function NotFound() {
  return (
    <StatePanel
      title="Page not found"
      description="The page you requested does not exist or has been moved."
      action={<Link to="/" className="primary-button">Return Home</Link>}
    />
  );
}

export default NotFound;
