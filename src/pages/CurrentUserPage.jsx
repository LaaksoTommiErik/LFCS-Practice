export default function CurrentUserPage({ user }) {
  return (
    <div>
      <h1>Current User</h1>
      <p>ID: {user.id}</p>
      <p>Email: {user.email}</p>
      <p>Role: {user.role}</p>
    </div>
  )
}
