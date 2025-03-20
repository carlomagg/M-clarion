import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchNonLicensedUsers } from '../../../queries/users-queries'; // Assuming you'll create this query

function NonLicensedUsersQueue() {
  const { data: users, isLoading, error } = useQuery({
    queryKey: ['nonLicensedUsers'],
    queryFn: fetchNonLicensedUsers,
  });

  if (isLoading) {
    return <div>Loading non-licensed users...</div>;
  }

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  if (!users || users.length === 0) {
    return <div>No non-licensed users found.</div>;
  }

  return (
    <div>
      <h3>Non-Licensed Users Queue</h3>
      <table>
        <thead>
          <tr>
            <th>First Name</th>
            <th>Last Name</th>
            <th>Email</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.email}>
              <td>{user.firstname}</td>
              <td>{user.lastname}</td>
              <td>{user.email}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default NonLicensedUsersQueue;
