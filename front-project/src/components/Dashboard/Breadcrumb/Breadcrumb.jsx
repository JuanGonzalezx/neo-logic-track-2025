import { useMemo } from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Breadcrumb.css';

const Breadcrumb = () => {
  const location = useLocation();

  const breadcrumbs = useMemo(() => {
    const pathSegments = location.pathname.split('/').filter(Boolean);
    
    const breadcrumbItems = pathSegments.map((segment, index) => {
      const url = `/${pathSegments.slice(0, index + 1).join('/')}`;
      
      // Convert segment to readable format (e.g., "user-management" to "User Management")
      const formattedName = segment
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
      
      return {
        name: formattedName,
        url
      };
    });
    
    // Add home as the first breadcrumb
    return [{ name: 'Home', url: '/dashboard' }, ...breadcrumbItems];
  }, [location]);

  return (
    <nav className="breadcrumb">
      <ol>
        {breadcrumbs.map((crumb, index) => (
          <li key={index} className="breadcrumb-item">
            {index === breadcrumbs.length - 1 ? (
              <span className="breadcrumb-active">{crumb.name}</span>
            ) : (
              <Link to={crumb.url}>{crumb.name}</Link>
            )}
            {index < breadcrumbs.length - 1 && (
              <span className="breadcrumb-separator">/</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
};

export default Breadcrumb;