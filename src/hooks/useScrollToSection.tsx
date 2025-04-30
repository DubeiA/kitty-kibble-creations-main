import { useNavigate, useLocation } from 'react-router-dom';

export function useScrollToSection() {
  const navigate = useNavigate();
  const location = useLocation();

  return (sectionId: string) => {
    if (location.pathname === '/') {
      // Якщо вже на головній — просто скроль
      document
        .getElementById(sectionId)
        ?.scrollIntoView({ behavior: 'smooth' });
    } else {
      // Якщо не на головній — переходь на головну з хешем
      navigate(`/#${sectionId}`);
    }
  };
}
