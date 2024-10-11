import React from 'react'
import { useRouteError } from 'react-router-dom';
function NotFound() {
    const error = useRouteError();
  console.error(error.status);
  return (
    <div>NotFound</div>
  )
}

export default NotFound