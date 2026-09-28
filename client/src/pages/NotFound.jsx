import { Link } from 'react-router-dom';

function NotFound() {
  return (
    <div
      style={{
        maxWidth: '600px',
        margin: '0 auto',
        textAlign: 'center',
        padding: '4rem 0',
      }}
    >
      <h1 style={{ fontSize: '4rem', color: '#ff4d4f', margin: '0 0 1rem 0' }}>
        404
      </h1>
      <h2 style={{ fontSize: '1.8rem', color: '#333', marginBottom: '1rem' }}>
        Page Not Found
      </h2>
      <p style={{ fontSize: '1.1rem', color: '#666', marginBottom: '2rem' }}>
        The page you are looking for does not exist or has been moved.
      </p>
      <Link
        to="/"
        style={{
          padding: '0.8rem 1.5rem',
          background: '#0066cc',
          color: '#fff',
          textDecoration: 'none',
          borderRadius: '4px',
          fontSize: '1rem',
          fontWeight: 'bold',
        }}
      >
        Go Back Home
      </Link>
    </div>
  );
}

export default NotFound;

